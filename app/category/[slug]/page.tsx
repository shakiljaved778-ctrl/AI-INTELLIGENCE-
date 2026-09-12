import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PostList } from "@/components/post/post-list";
import { TopPicks } from "@/components/post/top-picks";
import { AdRectangle } from "@/components/ads/ad-rectangle";
import { Reveal } from "@/components/reveal";
import { categories, getCategory } from "@/lib/categories";
import { getPicks, getPostsByCategory } from "@/lib/posts";
import { siteConfig } from "@/lib/site";

/** Pre-render every category at build time (fully static). */
export function generateStaticParams() {
  return categories.map((category) => ({ slug: category.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = getCategory(slug);
  if (!category) return {};
  return {
    title: category.title,
    description: category.description,
    openGraph: {
      title: `${category.title} | ${siteConfig.name}`,
      description: category.description,
    },
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const category = getCategory(slug);
  if (!category) notFound();

  const posts = getPostsByCategory(category.slug);
  const picks = getPicks().slice(0, 5);

  return (
    <div className="container py-8">
      <header className="mb-8 border-b pb-6">
        <p className="eyebrow text-primary animate-fade-up">Section</p>
        <h1
          className="mt-2 font-serif text-4xl font-bold tracking-tight animate-fade-up"
          style={{ animationDelay: "80ms" }}
        >
          {category.title}
        </h1>
        <p
          className="mt-2 max-w-2xl text-muted-foreground animate-fade-up"
          style={{ animationDelay: "150ms" }}
        >
          {category.description}
        </p>
      </header>

      <div className="grid gap-10 lg:grid-cols-3">
        <section className="lg:col-span-2">
          <PostList posts={posts} animate />
        </section>

        <Reveal as="aside" className="space-y-8" delay={120}>
          <TopPicks picks={picks} />
          <AdRectangle slotId={`category-${category.slug}-sidebar`} />
        </Reveal>
      </div>
    </div>
  );
}
