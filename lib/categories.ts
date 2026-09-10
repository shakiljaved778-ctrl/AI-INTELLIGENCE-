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
  | "events";

export interface Category {
  slug: CategorySlug;
  title: string;
  description: string;
}

export const categories: Category[] = [
  {
    slug: "models",
    title: "Models",
    description:
      "New model releases, capability jumps, benchmarks, and technical breakdowns of frontier and open systems.",
  },
  {
    slug: "products",
    title: "Products",
    description:
      "AI products and features shipping to developers and consumers, from assistants to dev tools.",
  },
  {
    slug: "companies",
    title: "Companies",
    description:
      "The labs, startups, and incumbents building AI — funding, strategy, hiring, and org moves.",
  },
  {
    slug: "research",
    title: "Research",
    description:
      "Papers, methods, and breakthroughs shaping the science of machine intelligence.",
  },
  {
    slug: "policy",
    title: "Policy",
    description:
      "Regulation, safety, governance, and the law catching up with artificial intelligence.",
  },
  {
    slug: "opinion",
    title: "Opinion",
    description:
      "Analysis, argument, and perspective from the Cambrian AI editorial desk.",
  },
  {
    slug: "events",
    title: "Events",
    description:
      "Conferences, launches, and moments that move the AI industry.",
  },
];

export const categorySlugs = categories.map((c) => c.slug);

export function getCategory(slug: string): Category | undefined {
  return categories.find((c) => c.slug === slug);
}

export function isValidCategory(slug: string): slug is CategorySlug {
  return categorySlugs.includes(slug as CategorySlug);
}
