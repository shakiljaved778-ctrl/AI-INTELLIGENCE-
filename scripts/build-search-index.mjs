// Build-time search index generator.
//
// Reads every MDX post in content/posts/, extracts lightweight metadata, and
// writes public/search-index.json. The client-side search modal fetches this
// static file — there is no runtime API. Runs automatically via the `predev`
// and `prebuild` npm scripts; run manually with `pnpm search-index`.

import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const ROOT = process.cwd();
const POSTS_DIR = path.join(ROOT, "content", "posts");
const OUT_FILE = path.join(ROOT, "public", "search-index.json");

function toPlainText(mdx) {
  return mdx
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]*`/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^>\s?/gm, "")
    .replace(/[*_~]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function makeExcerpt(mdx, length = 160) {
  const text = toPlainText(mdx);
  if (text.length <= length) return text;
  return text.slice(0, length).replace(/\s+\S*$/, "") + "…";
}

function build() {
  if (!fs.existsSync(POSTS_DIR)) {
    console.warn(`[search-index] No posts directory at ${POSTS_DIR}; writing empty index.`);
    fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true });
    fs.writeFileSync(OUT_FILE, "[]\n");
    return;
  }

  const files = fs
    .readdirSync(POSTS_DIR)
    .filter((f) => /\.mdx?$/.test(f) && !f.startsWith("_"));

  const index = files
    .map((file) => {
      const raw = fs.readFileSync(path.join(POSTS_DIR, file), "utf8");
      const { data, content } = matter(raw);
      return {
        title: data.title ?? file,
        slug: data.slug ?? file.replace(/\.mdx?$/, ""),
        subtitle: data.subtitle ?? "",
        excerpt: makeExcerpt(content),
        category: data.category ?? "",
        tags: Array.isArray(data.tags) ? data.tags : [],
        date: data.date ?? "",
        isPick: Boolean(data.isPick),
      };
    })
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true });
  fs.writeFileSync(OUT_FILE, JSON.stringify(index, null, 2) + "\n");
  console.log(`[search-index] Wrote ${index.length} entries to public/search-index.json`);
}

build();
