/**
 * Category taxonomy for the site.
 *
 * A post's `category` frontmatter field must match one of these `slug` values.
 * Add or rename categories here; the nav dropdown, category pages, and
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
  | "learning";

export interface Category {
  slug: CategorySlug;
  title: string;
  description: string;
  /** Accent hue (HSL) used for the section's color dot / kicker. */
  color: string;
}

export const categories: Category[] = [
  {
    slug: "models",
    title: "Models",
    description:
      "New model releases, capability jumps, benchmarks, and technical breakdowns of frontier and open systems.",
    color: "221 83% 60%",
  },
  {
    slug: "products",
    title: "Products",
    description:
      "AI products and features shipping to developers and consumers, from assistants to dev tools.",
    color: "262 72% 62%",
  },
  {
    slug: "companies",
    title: "Companies",
    description:
      "The labs, startups, and incumbents building AI — funding, strategy, hiring, and org moves.",
    color: "188 78% 42%",
  },
  {
    slug: "research",
    title: "Research",
    description:
      "Papers, methods, and breakthroughs shaping the science of machine intelligence.",
    color: "330 72% 58%",
  },
  {
    slug: "policy",
    title: "Policy",
    description:
      "Regulation, safety, governance, and the law catching up with artificial intelligence.",
    color: "14 82% 56%",
  },
  {
    slug: "opinion",
    title: "Opinion",
    description:
      "Analysis, argument, and perspective from the Cambrian AI editorial desk.",
    color: "43 90% 52%",
  },
  {
    slug: "events",
    title: "Events",
    description:
      "Conferences, launches, and moments that move the AI industry.",
    color: "152 62% 44%",
  },
  {
    slug: "enterprise",
    title: "Enterprise",
    description:
      "How real businesses — many of them not tech companies — deploy AI, and what it does to their bottom line.",
    color: "210 20% 45%",
  },
  {
    slug: "learning",
    title: "Learn",
    description:
      "Plain-English explainers of the core AI concepts — RAG, vector databases, agents, embeddings, and more.",
    color: "280 65% 60%",
  },
];

export const categorySlugs = categories.map((c) => c.slug);

export function getCategory(slug: string): Category | undefined {
  return categories.find((c) => c.slug === slug);
}

export function isValidCategory(slug: string): slug is CategorySlug {
  return categorySlugs.includes(slug as CategorySlug);
}
