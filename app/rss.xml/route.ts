import { getAllPosts } from "@/lib/posts";
import { getCategory } from "@/lib/categories";
import { siteConfig } from "@/lib/site";

// Static RSS 2.0 feed generated at build time (works with `output: export`).
export const dynamic = "force-static";

function esc(s: string) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function GET() {
  const base = siteConfig.url.replace(/\/$/, "");
  const posts = getAllPosts().slice(0, 50);
  const updated = posts[0]?.date
    ? new Date(posts[0].date).toUTCString()
    : new Date().toUTCString();

  const items = posts
    .map((p) => {
      const url = `${base}/post/${p.slug}`;
      const cat = getCategory(p.category)?.title ?? p.category;
      const desc = p.subtitle ?? p.excerpt ?? "";
      return `    <item>
      <title>${esc(p.title)}</title>
      <link>${esc(url)}</link>
      <guid isPermaLink="true">${esc(url)}</guid>
      <pubDate>${new Date(p.date).toUTCString()}</pubDate>
      <category>${esc(cat)}</category>
      <dc:creator>${esc(p.author)}</dc:creator>
      <description>${esc(desc)}</description>
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${esc(siteConfig.name)}</title>
    <link>${esc(base)}</link>
    <atom:link href="${esc(base)}/rss.xml" rel="self" type="application/rss+xml"/>
    <description>${esc(siteConfig.description)}</description>
    <language>en-us</language>
    <lastBuildDate>${updated}</lastBuildDate>
${items}
  </channel>
</rss>
`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
