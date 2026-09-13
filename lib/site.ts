/**
 * Central site configuration.
 *
 * Change the site name, description, URL, and navigation here — these values
 * flow into metadata, the header, the footer, and the sitemap. Renaming the
 * publication is a one-line change to `name`.
 */
export const siteConfig = {
  name: "Cambrian AI",
  tagline: "AI News & Analysis",
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

  // Search Console verification. Paste the code strings you get after
  // registering the site (Google Search Console / Bing Webmaster Tools), or set
  // the matching env vars at build time. Leaving these empty simply omits the
  // meta tags.
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION ?? "",
    bing: process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION ?? "",
  },

  // Newsletter: paste your provider's public embed FORM ACTION URL (Buttondown,
  // Mailchimp, Beehiiv, …). When set, the signup form posts real subscribers to
  // it; when empty, the form shows a friendly "not connected yet" message.
  // Example (Buttondown): https://buttondown.com/api/emails/embed-subscribe/YOURUSERNAME
  newsletter: {
    action: process.env.NEXT_PUBLIC_NEWSLETTER_ACTION ?? "",
    // The form field name the provider expects for the email address.
    emailField: process.env.NEXT_PUBLIC_NEWSLETTER_EMAIL_FIELD ?? "email",
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
