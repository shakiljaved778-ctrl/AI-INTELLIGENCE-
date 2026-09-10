/**
 * Central site configuration.
 *
 * Change the site name, description, URL, and navigation here — these values
 * flow into metadata, the header, the footer, and the sitemap. Renaming the
 * publication is a one-line change to `name`.
 */
export const siteConfig = {
  name: "Cambrian AI",
  tagline: "The WSJ of AI",
  description:
    "Authoritative, comprehensive news and analysis on AI models, companies, research, products, and policy — for researchers, engineers, founders, and investors.",
  // Update this to your production domain once deployed on Vercel.
  url: "https://cambrian-ai.vercel.app",
  ogImage: "/og-default.svg",
  contactEmail: "tips@cambrian.ai",
  advertiseEmail: "ads@cambrian.ai",
  links: {
    twitter: "https://twitter.com",
    github: "https://github.com",
  },
} as const;

/**
 * Primary navigation shown in the header.
 * The "Categories" entry is rendered as a dropdown built from `categories`.
 */
export const mainNav = [
  { title: "Home", href: "/" },
  { title: "Picks", href: "/picks" },
  { title: "About", href: "/about" },
  { title: "Advertise", href: "/advertise" },
  { title: "Contact", href: "/contact" },
] as const;
