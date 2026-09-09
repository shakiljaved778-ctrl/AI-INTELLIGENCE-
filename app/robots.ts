import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site";

// Emit robots.txt as a static file (required for `output: export`).
export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  const base = siteConfig.url.replace(/\/$/, "");
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${base}/sitemap.xml`,
  };
}
