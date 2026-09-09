import type { MetadataRoute } from "next";
import { categories } from "@/lib/categories";
import { getAllPosts, getAllTags, tagToSlug } from "@/lib/posts";
import { siteConfig } from "@/lib/site";

// Emit sitemap.xml as a static file (required for `output: export`).
export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteConfig.url.replace(/\/$/, "");

  const staticRoutes = [
    "",
    "/picks",
    "/about",
    "/advertise",
    "/contact",
    "/privacy",
    "/terms",
  ].map((route) => ({
    url: `${base}${route}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: route === "" ? 1 : 0.6,
  }));

  const categoryRoutes = categories.map((category) => ({
    url: `${base}/category/${category.slug}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: 0.7,
  }));

  const postRoutes = getAllPosts().map((post) => ({
    url: `${base}/post/${post.slug}`,
    lastModified: new Date(post.updated ?? post.date),
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  const tagRoutes = getAllTags().map(({ tag }) => ({
    url: `${base}/tag/${tagToSlug(tag)}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.4,
  }));

  return [...staticRoutes, ...categoryRoutes, ...postRoutes, ...tagRoutes];
}
