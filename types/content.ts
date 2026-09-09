import type { CategorySlug } from "@/lib/categories";

/**
 * Frontmatter as authored in an MDX file's `--- ... ---` block.
 * `date`, `title`, `category`, and `author` are required; the rest are optional.
 */
export interface PostFrontmatter {
  title: string;
  subtitle?: string;
  slug?: string; // defaults to the filename if omitted
  date: string; // ISO date, e.g. "2025-09-01"
  updated?: string;
  author: string;
  category: CategorySlug;
  tags?: string[];
  featured?: boolean;
  isPick?: boolean;
  pickSource?: string; // e.g. "Claude", "Editor", "Gemini"
  pickRationale?: string;
  readTime?: number; // minutes; auto-computed from body if omitted
  image?: string; // optional hero/OG image path
}

/**
 * A fully parsed post: validated frontmatter plus derived fields and raw body.
 */
export interface Post {
  slug: string;
  title: string;
  subtitle?: string;
  date: string;
  updated?: string;
  author: string;
  category: CategorySlug;
  tags: string[];
  featured: boolean;
  isPick: boolean;
  pickSource?: string;
  pickRationale?: string;
  readTime: number;
  image?: string;
  excerpt: string;
  /** Raw MDX body (without frontmatter). */
  content: string;
}

/** Lightweight post shape used for lists and the search index. */
export type PostMeta = Omit<Post, "content">;
