/**
 * Category taxonomy for the site.
 *
 * A post's `category` frontmatter field must match one of these `slug` values.
 * Categories belong to one of two desks (`group`):
 *   - "ai"    — the AI coverage that is the site's core (~65% of content)
 *   - "world" — everything else, the "Beyond" desk (~35% of content):
 *               sports, lifestyle, entertainment, non-AI tech, finance, and a
 *               small amount of strictly non-partisan politics (~1%).
 *
 * Add or rename categories here; the nav, category pages, homepage desks, and
 * validation all read from this single source of truth.
 */
export type CategorySlug =
  | "research"
  | "products"
  | "companies"
  | "policy"
  | "models"
  | "opinion"
  | "events"
  | "enterprise"
  | "learning"
  // "Beyond" desk (non-AI)
  | "sports"
  | "lifestyle"
  | "entertainment"
  | "technology"
  | "finance"
  | "politics";

export type CategoryGroup = "ai" | "world";

export interface Category {
  slug: CategorySlug;
  title: string;
  description: string;
  /** Which desk this section belongs to. */
  group: CategoryGroup;
  /** Accent hue (HSL) used for the section's color dot / kicker. */
  color: string;
}

export const categories: Category[] = [
  // ─── AI desk ──────────────────────────────────────────────────────────────
  {
    slug: "models",
    title: "Models",
    description:
      "New model releases, capability jumps, benchmarks, and technical breakdowns of frontier and open systems.",
    group: "ai",
    color: "221 83% 60%",
  },
  {
    slug: "products",
    title: "Products",
    description:
      "AI products and features shipping to developers and consumers, from assistants to dev tools.",
    group: "ai",
    color: "262 72% 62%",
  },
  {
    slug: "companies",
    title: "Companies",
    description:
      "The labs, startups, and incumbents building AI — funding, strategy, hiring, and org moves.",
    group: "ai",
    color: "188 78% 42%",
  },
  {
    slug: "research",
    title: "Research",
    description:
      "Papers, methods, and breakthroughs shaping the science of machine intelligence.",
    group: "ai",
    color: "330 72% 58%",
  },
  {
    slug: "policy",
    title: "AI Policy",
    description:
      "Regulation, safety, governance, and the law catching up with artificial intelligence.",
    group: "ai",
    color: "14 82% 56%",
  },
  {
    slug: "opinion",
    title: "Opinion",
    description:
      "Analysis, argument, and perspective from the Salience Intelligence editorial desk.",
    group: "ai",
    color: "43 90% 52%",
  },
  {
    slug: "events",
    title: "Events",
    description:
      "Conferences, launches, and moments that move the AI industry.",
    group: "ai",
    color: "152 62% 44%",
  },
  {
    slug: "enterprise",
    title: "Enterprise",
    description:
      "How real businesses — many of them not tech companies — deploy AI, and what it does to their bottom line.",
    group: "ai",
    color: "210 20% 45%",
  },
  {
    slug: "learning",
    title: "Learn",
    description:
      "Plain-English explainers of the core AI concepts — RAG, vector databases, agents, embeddings, and more.",
    group: "ai",
    color: "280 65% 60%",
  },

  // ─── Beyond desk (non-AI) ───────────────────────────────────────────────────
  {
    slug: "technology",
    title: "Technology",
    description:
      "Tech beyond AI — devices, platforms, chips, software, and the companies behind them.",
    group: "world",
    color: "199 89% 48%",
  },
  {
    slug: "finance",
    title: "Wealth & Finance",
    description:
      "Markets, business, investing, and the economy — what's moving money and why it matters.",
    group: "world",
    color: "158 64% 40%",
  },
  {
    slug: "sports",
    title: "Sports",
    description:
      "Results, storylines, and the business of the games — across the major leagues and beyond.",
    group: "world",
    color: "24 90% 55%",
  },
  {
    slug: "entertainment",
    title: "Entertainment",
    description:
      "Film, television, music, streaming, and the culture industry.",
    group: "world",
    color: "322 75% 58%",
  },
  {
    slug: "lifestyle",
    title: "Lifestyle",
    description:
      "Health, travel, food, design, and the way we live now.",
    group: "world",
    color: "48 90% 50%",
  },
  {
    slug: "politics",
    title: "Politics",
    description:
      "Strictly non-partisan coverage of policy and governance. We do not cover the Middle East or active geopolitical conflicts, and keep politics a small share of the mix.",
    group: "world",
    color: "215 16% 47%",
  },
];

export const categorySlugs = categories.map((c) => c.slug);

export function getCategory(slug: string): Category | undefined {
  return categories.find((c) => c.slug === slug);
}

export function isValidCategory(slug: string): slug is CategorySlug {
  return categorySlugs.includes(slug as CategorySlug);
}

/** Categories in a given desk, in declared order. */
export function getCategoriesByGroup(group: CategoryGroup): Category[] {
  return categories.filter((c) => c.group === group);
}

export const aiCategories = getCategoriesByGroup("ai");
export const worldCategories = getCategoriesByGroup("world");

/** Slug sets for quick "is this an AI/world story?" checks. */
export const aiCategorySlugs = new Set(aiCategories.map((c) => c.slug));
export const worldCategorySlugs = new Set(worldCategories.map((c) => c.slug));
