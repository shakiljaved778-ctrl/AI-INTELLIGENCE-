import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PostList } from "@/components/post/post-list";
import { AdRectangle } from "@/components/ads/ad-rectangle";
import { Badge } from "@/components/ui/badge";
import {
  getAllTags,
  getPostsByTag,
  getTagBySlug,
  tagToSlug,
} from "@/lib/posts";

/** Pre-render a page for every tag used across posts. */
export function generateStaticParams() {
  return getAllTags().map(({ tag }) => ({ slug: tagToSlug(tag) }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const tag = getTagBySlug(slug);
  if (!tag) return {};
  return {
    title: `#${tag}`,
    description: `All AI Journal stories tagged ${tag}.`,
  };
}

export default async function TagPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const tag = getTagBySlug(slug);
  if (!tag) notFound();

  const posts = getPostsByTag(tag);
  const allTags = getAllTags();

  return (
    <div className="container py-8">
      <header className="mb-8 border-b pb-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">
          Tag
        </p>
        <h1 className="mt-1 font-serif text-4xl font-bold tracking-tight">
          #{tag}
        </h1>
        <p className="mt-2 text-muted-foreground">
          {posts.length} {posts.length === 1 ? "story" : "stories"}
        </p>
      </header>

      <div className="grid gap-10 lg:grid-cols-3">
        <section className="lg:col-span-2">
          <PostList posts={posts} />
        </section>

        <aside className="space-y-8">
          <section>
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              All tags
            </h2>
            <div className="flex flex-wrap gap-2">
              {allTags.map(({ tag: t, count }) => (
                <Link key={t} href={`/tag/${tagToSlug(t)}`}>
                  <Badge
                    variant={t === tag ? "default" : "outline"}
                    className="hover:bg-accent hover:text-accent-foreground"
                  >
                    {t} ({count})
                  </Badge>
                </Link>
              ))}
            </div>
          </section>
          <AdRectangle slotId="tag-sidebar" />
        </aside>
      </div>
    </div>
  );
}
