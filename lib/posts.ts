import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import readingTime from "reading-time";
import { isValidCategory } from "@/lib/categories";
import type { Post, PostMeta } from "@/types/content";

const POSTS_DIR = path.join(process.cwd(), "content", "posts");

/**
 * Strip MDX/Markdown/JSX down to plain text so we can derive an excerpt.
 * Intentionally simple — good enough for previews and the search index.
 */
export function toPlainText(mdx: string): string {
  return mdx
    .replace(/```[\s\S]*?```/g, " ") // fenced code
    .replace(/`[^`]*`/g, " ") // inline code
    .replace(/<[^>]+>/g, " ") // JSX / HTML tags
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ") // images
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1") // links -> text
    .replace(/^#{1,6}\s+/gm, "") // headings
    .replace(/^>\s?/gm, "") // blockquotes
    .replace(/[*_~]/g, "") // emphasis marks
    .replace(/\s+/g, " ")
    .trim();
}

export function makeExcerpt(mdx: string, length = 160): string {
  const text = toPlainText(mdx);
  if (text.length <= length) return text;
  return text.slice(0, length).replace(/\s+\S*$/, "") + "…";
}

/** List MDX filenames in content/posts (ignoring templates prefixed with "_"). */
function getPostFiles(): string[] {
  if (!fs.existsSync(POSTS_DIR)) return [];
  return fs
    .readdirSync(POSTS_DIR)
    .filter((file) => /\.mdx?$/.test(file) && !file.startsWith("_"));
}

/**
 * Parse and validate a single post file. Throws a descriptive error when a
 * required frontmatter field is missing or invalid, so bad content fails the
 * build instead of silently producing broken pages.
 */
function parsePost(filename: string): Post {
  const filePath = path.join(POSTS_DIR, filename);
  const raw = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(raw);

  const fileSlug = filename.replace(/\.mdx?$/, "");
  const where = `content/posts/${filename}`;

  const require = (field: string, value: unknown) => {
    if (value === undefined || value === null || value === "") {
      throw new Error(
        `[content] Missing required frontmatter field "${field}" in ${where}`
      );
    }
  };

  require("title", data.title);
  require("date", data.date);
  require("author", data.author);
  require("category", data.category);

  if (!isValidCategory(data.category)) {
    throw new Error(
      `[content] Invalid category "${data.category}" in ${where}. ` +
        `Must be one of: research, products, companies, policy, models, opinion, events.`
    );
  }

  if (Number.isNaN(new Date(data.date).getTime())) {
    throw new Error(
      `[content] Invalid date "${data.date}" in ${where}. Use ISO format, e.g. "2025-09-01".`
    );
  }

  const isPick = Boolean(data.isPick);
  if (isPick && !data.pickSource) {
    throw new Error(
      `[content] Post ${where} has isPick: true but no pickSource (e.g. "Claude", "Editor").`
    );
  }

  const readTime =
    typeof data.readTime === "number"
      ? data.readTime
      : Math.max(1, Math.round(readingTime(content).minutes));

  const slug = (data.slug as string) || fileSlug;

  return {
    slug,
    title: data.title,
    subtitle: data.subtitle,
    date: data.date,
    updated: data.updated,
    author: data.author,
    category: data.category,
    tags: Array.isArray(data.tags) ? data.tags : [],
    featured: Boolean(data.featured),
    isPick,
    pickSource: data.pickSource,
    pickRationale: data.pickRationale,
    readTime,
    // Fall back to the generated hero image (scripts/build-hero-images.mjs).
    image: (data.image as string) || `/heroes/${slug}.svg`,
    excerpt: makeExcerpt(content),
    content,
  };
}

/** All posts, newest first. Cached across the build via module scope. */
let _cache: Post[] | null = null;

export function getAllPosts(): Post[] {
  if (_cache) return _cache;
  const posts = getPostFiles()
    .map(parsePost)
    .sort((a, b) => +new Date(b.date) - +new Date(a.date));

  // Guard against duplicate slugs, which would collide on the same URL.
  const seen = new Set<string>();
  for (const post of posts) {
    if (seen.has(post.slug)) {
      throw new Error(
        `[content] Duplicate slug "${post.slug}". Slugs must be unique across content/posts.`
      );
    }
    seen.add(post.slug);
  }

  _cache = posts;
  return posts;
}

/** Metadata-only list (no MDX body) — handy for cards and indexes. */
export function getAllPostMeta(): PostMeta[] {
  return getAllPosts().map(({ content: _content, ...meta }) => meta);
}

export function getPostBySlug(slug: string): Post | undefined {
  return getAllPosts().find((p) => p.slug === slug);
}

export function getPostsByCategory(category: string): Post[] {
  return getAllPosts().filter((p) => p.category === category);
}

export function getFeaturedPosts(limit = 5): Post[] {
  const featured = getAllPosts().filter((p) => p.featured);
  // Fall back to the most recent posts if nothing is explicitly featured.
  const pool = featured.length > 0 ? featured : getAllPosts();
  return pool.slice(0, limit);
}

export function getPicks(): Post[] {
  return getAllPosts().filter((p) => p.isPick);
}

export function getAllTags(): { tag: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const post of getAllPosts()) {
    for (const tag of post.tags) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }
  return Array.from(counts.entries())
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
}

export function getPostsByTag(tag: string): Post[] {
  const lower = tag.toLowerCase();
  return getAllPosts().filter((p) =>
    p.tags.some((t) => t.toLowerCase() === lower)
  );
}

/** Slugify a tag for use in URLs (e.g. "EU AI Act" -> "eu-ai-act"). */
export function tagToSlug(tag: string): string {
  return tag
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function getTagBySlug(slug: string): string | undefined {
  return getAllTags().find(({ tag }) => tagToSlug(tag) === slug)?.tag;
}

/**
 * Split MDX body into two parts around the Nth top-level block so an in-article
 * ad can be inserted after a few paragraphs. Fence-aware so we never split
 * inside a fenced code block. Returns [before, after]; `after` is "" if the
 * body has fewer than `afterBlocks` blocks.
 */
export function splitContentForAd(
  content: string,
  afterBlocks = 3
): [string, string] {
  const lines = content.split("\n");
  let inFence = false;
  let sawContent = false;
  let blockCount = 0;
  let splitLine = -1;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/^\s*(```|~~~)/.test(line)) {
      inFence = !inFence;
      sawContent = true;
      continue;
    }
    if (inFence) {
      sawContent = true;
      continue;
    }
    if (line.trim() === "") {
      if (sawContent) {
        blockCount++;
        sawContent = false;
        if (blockCount >= afterBlocks) {
          splitLine = i;
          break;
        }
      }
    } else {
      sawContent = true;
    }
  }

  if (splitLine === -1) return [content, ""];
  return [
    lines.slice(0, splitLine).join("\n"),
    lines.slice(splitLine + 1).join("\n"),
  ];
}

/**
 * Related posts: same category first, then shared tags, excluding the post
 * itself. Returns up to `limit` items.
 */
export function getRelatedPosts(post: Post, limit = 4): Post[] {
  const others = getAllPosts().filter((p) => p.slug !== post.slug);
  const scored = others
    .map((p) => {
      let score = 0;
      if (p.category === post.category) score += 2;
      score += p.tags.filter((t) => post.tags.includes(t)).length;
      return { post: p, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score || +new Date(b.post.date) - +new Date(a.post.date));

  const related = scored.map((x) => x.post);
  // Top up with recent posts if we didn't find enough related ones.
  if (related.length < limit) {
    for (const p of others) {
      if (related.length >= limit) break;
      if (!related.includes(p)) related.push(p);
    }
  }
  return related.slice(0, limit);
}
