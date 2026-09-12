import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXContent } from "@/components/post/mdx-content";
import { RelatedStories } from "@/components/post/related-stories";
import { TopPicks } from "@/components/post/top-picks";
import { AdRectangle } from "@/components/ads/ad-rectangle";
import { Reveal } from "@/components/reveal";
import { Badge } from "@/components/ui/badge";
import { getCategory } from "@/lib/categories";
import {
  getAllPosts,
  getPicks,
  getPostBySlug,
  getRelatedPosts,
  tagToSlug,
} from "@/lib/posts";
import { formatDate } from "@/lib/utils";
import { siteConfig } from "@/lib/site";

/** Pre-render every post at build time. */
export function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};

  const description = post.subtitle ?? post.excerpt;
  return {
    title: post.title,
    description,
    authors: [{ name: post.author }],
    openGraph: {
      type: "article",
      title: post.title,
      description,
      publishedTime: post.date,
      modifiedTime: post.updated,
      authors: [post.author],
      tags: post.tags,
      images: post.image ? [{ url: post.image }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description,
    },
  };
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const category = getCategory(post.category);
  const related = getRelatedPosts(post, 4);
  const picks = getPicks()
    .filter((p) => p.slug !== post.slug)
    .slice(0, 4);

  // JSON-LD for rich results.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: post.title,
    description: post.subtitle ?? post.excerpt,
    datePublished: post.date,
    dateModified: post.updated ?? post.date,
    author: [{ "@type": "Organization", name: post.author }],
    publisher: { "@type": "Organization", name: siteConfig.name },
    articleSection: category?.title,
    keywords: post.tags.join(", "),
  };

  return (
    <div className="container py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="grid gap-10 lg:grid-cols-3">
        {/* Article */}
        <article className="lg:col-span-2">
          <nav className="mb-4 text-xs text-muted-foreground">
            <Link href="/" className="hover:text-primary">
              Home
            </Link>
            {category && (
              <>
                {" / "}
                <Link
                  href={`/category/${category.slug}`}
                  className="hover:text-primary"
                >
                  {category.title}
                </Link>
              </>
            )}
          </nav>

          <header className="border-b pb-6">
            <div className="flex flex-wrap items-center gap-2 animate-fade-up">
              {category && (
                <Badge variant="secondary" className="uppercase tracking-wide">
                  {category.title}
                </Badge>
              )}
              {post.isPick && post.pickSource && (
                <Badge variant="accent">{post.pickSource}&rsquo;s Pick</Badge>
              )}
            </div>

            <h1
              className="mt-3 font-serif text-3xl font-bold leading-tight tracking-tight animate-fade-up sm:text-4xl"
              style={{ animationDelay: "80ms" }}
            >
              {post.title}
            </h1>
            {post.subtitle && (
              <p
                className="mt-3 text-lg text-muted-foreground animate-fade-up sm:text-xl"
                style={{ animationDelay: "150ms" }}
              >
                {post.subtitle}
              </p>
            )}

            <div
              className="mt-5 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground animate-fade-up"
              style={{ animationDelay: "220ms" }}
            >
              <span className="font-medium text-foreground">{post.author}</span>
              <span>·</span>
              <time dateTime={post.date}>{formatDate(post.date)}</time>
              <span>·</span>
              <span>{post.readTime} min read</span>
              {post.updated && (
                <>
                  <span>·</span>
                  <span>Updated {formatDate(post.updated)}</span>
                </>
              )}
            </div>
          </header>

          {post.image && (
            <figure
              className="mt-8 overflow-hidden rounded-xl border bg-muted animate-fade-up"
              style={{ animationDelay: "300ms" }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={post.image}
                alt={post.title}
                className="aspect-[16/9] w-full object-cover"
              />
            </figure>
          )}

          {post.isPick && post.pickRationale && (
            <div className="mt-6 rounded-md border-l-4 border-accent bg-accent/10 p-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-accent-foreground/70">
                Why {post.pickSource} picked this
              </p>
              <p className="mt-1 font-serif text-lg italic">
                “{post.pickRationale}”
              </p>
            </div>
          )}

          {/* MDX body with an auto-inserted in-article ad after ~3 paragraphs */}
          <div className="prose-article mt-8">
            <MDXContent source={post.content} />
          </div>

          {/* Tags */}
          {post.tags.length > 0 && (
            <div className="mt-10 flex flex-wrap items-center gap-2 border-t pt-6">
              <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Tags
              </span>
              {post.tags.map((tag) => (
                <Link key={tag} href={`/tag/${tagToSlug(tag)}`}>
                  <Badge variant="outline" className="hover:bg-accent hover:text-accent-foreground">
                    {tag}
                  </Badge>
                </Link>
              ))}
            </div>
          )}
        </article>

        {/* Sidebar */}
        <Reveal
          as="aside"
          delay={120}
          className="space-y-8 lg:border-l lg:pl-8"
        >
          <RelatedStories posts={related} />
          <TopPicks picks={picks} title="Model picks" />
          <AdRectangle slotId="post-sidebar" />
        </Reveal>
      </div>
    </div>
  );
}
