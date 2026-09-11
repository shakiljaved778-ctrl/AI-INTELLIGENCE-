import Link from "next/link";
import { PostCard } from "@/components/post/post-card";
import { PostList } from "@/components/post/post-list";
import { PickCard } from "@/components/post/pick-card";
import { TopPicks } from "@/components/post/top-picks";
import { AdRectangle } from "@/components/ads/ad-rectangle";
import { AdBanner } from "@/components/ads/ad-banner";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { categories } from "@/lib/categories";
import { siteConfig } from "@/lib/site";
import {
  getAllPostMeta,
  getFeaturedPosts,
  getPicks,
  getPostsByCategory,
} from "@/lib/posts";

export default function HomePage() {
  const featured = getFeaturedPosts(4);
  const [lead, ...secondary] = featured;
  // Latest-news feed: skip the hero lead and exclude evergreen "Learn"
  // explainers (they live in their own section, not the news feed).
  const latest = getAllPostMeta()
    .filter(
      (p) =>
        p.category !== "learning" && (!lead || p.slug !== lead.slug)
    )
    .slice(0, 24);
  const picks = getPicks().slice(0, 3);
  const sidebarPicks = getPicks().slice(0, 5);
  const learn = getPostsByCategory("learning").slice(0, 4);

  return (
    <>
      {/* HERO BAND — airy, minimalist, typographic */}
      <section className="border-b bg-gradient-to-b from-secondary/50 to-background">
        <div className="container py-16 text-center sm:py-24">
          <p className="eyebrow">{siteConfig.tagline}</p>
          <h1 className="mx-auto mt-5 max-w-4xl text-4xl font-light leading-[1.08] tracking-tight sm:text-6xl">
            The intelligence age, <span className="font-normal italic">reported</span>.
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base text-muted-foreground sm:text-lg">
            Authoritative news and analysis on the models, companies, research,
            and policy shaping artificial intelligence.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <a href="#latest" className={buttonVariants({ size: "lg" })}>
              Read the latest
            </a>
            <a
              href="#newsletter"
              className={buttonVariants({ variant: "outline", size: "lg" })}
            >
              Subscribe
            </a>
          </div>
        </div>
      </section>

      <div className="container py-10 sm:py-14">
        {/* Category quick links */}
        <nav
          aria-label="Sections"
          className="mb-10 flex flex-wrap justify-center gap-2 border-b pb-6"
        >
          {categories.map((category) => (
            <Link key={category.slug} href={`/category/${category.slug}`}>
              <Badge
                variant="outline"
                className="hover:bg-secondary hover:text-secondary-foreground"
              >
                {category.title}
              </Badge>
            </Link>
          ))}
        </nav>

        {/* Top Stories */}
        <section aria-labelledby="top-stories" className="mb-16">
          <p id="top-stories" className="eyebrow mb-8">
            Top Stories
          </p>
          <div className="grid gap-10 lg:grid-cols-3">
            {lead && (
              <div className="lg:col-span-2 lg:border-r lg:pr-10">
                <PostCard post={lead} variant="feature" />
              </div>
            )}
            <div className="flex flex-col divide-y">
              {secondary.map((post) => (
                <div key={post.slug} className="py-6 first:pt-0">
                  <PostCard post={post} />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Mid-page banner ad between sections */}
        <AdBanner slotId="home-mid-banner" className="!px-0" />

        {/* Main grid: Latest news + sidebar */}
        <div className="mt-10 grid gap-12 lg:grid-cols-3">
          <section aria-labelledby="latest" className="lg:col-span-2">
            <h2
              id="latest"
              className="mb-4 scroll-mt-24 border-b pb-3 text-2xl font-semibold tracking-tight"
            >
              Latest News
            </h2>
            <PostList posts={latest} />
          </section>

          <aside className="space-y-10">
            <TopPicks picks={sidebarPicks} />
            {/* Sidebar rectangle ad */}
            <AdRectangle slotId="home-sidebar" />
            <section>
              <p className="eyebrow mb-3">Sections</p>
              <ul className="space-y-2 text-sm">
                {categories.map((category) => (
                  <li key={category.slug}>
                    <Link
                      href={`/category/${category.slug}`}
                      className="text-foreground/80 transition-colors hover:text-accent"
                    >
                      {category.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          </aside>
        </div>

        {/* Model & Company Picks */}
        {picks.length > 0 && (
          <section aria-labelledby="picks" className="mt-16">
            <div className="mb-8 flex items-end justify-between border-b pb-3">
              <h2 id="picks" className="text-2xl font-semibold tracking-tight">
                Model &amp; Company Picks
              </h2>
              <Link
                href="/picks"
                className="text-sm font-medium text-accent hover:underline"
              >
                View all picks →
              </Link>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              {picks.map((pick) => (
                <PickCard key={pick.slug} post={pick} />
              ))}
            </div>
          </section>
        )}

        {/* Learn — evergreen concept explainers */}
        {learn.length > 0 && (
          <section aria-labelledby="learn" className="mt-16">
            <div className="mb-8 flex items-end justify-between border-b pb-3">
              <div>
                <p className="eyebrow mb-1">Learn</p>
                <h2 id="learn" className="text-2xl font-semibold tracking-tight">
                  AI concepts, explained
                </h2>
              </div>
              <Link
                href="/category/learning"
                className="text-sm font-medium text-accent hover:underline"
              >
                All explainers →
              </Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {learn.map((p) => (
                <Link
                  key={p.slug}
                  href={`/post/${p.slug}`}
                  className="group rounded-xl border p-5 transition-colors hover:border-accent"
                >
                  <p className="eyebrow mb-2">Explainer</p>
                  <h3 className="text-lg font-semibold leading-snug tracking-tight transition-colors group-hover:text-accent">
                    {p.title}
                  </h3>
                  {p.subtitle && (
                    <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                      {p.subtitle}
                    </p>
                  )}
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
