import Link from "next/link";
import { PostCard } from "@/components/post/post-card";
import { PostList } from "@/components/post/post-list";
import { PickCard } from "@/components/post/pick-card";
import { TopPicks } from "@/components/post/top-picks";
import { AdRectangle } from "@/components/ads/ad-rectangle";
import { AdBanner } from "@/components/ads/ad-banner";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Reveal } from "@/components/reveal";
import { categories, getCategory } from "@/lib/categories";
import { formatDate } from "@/lib/utils";
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
      (p) => p.category !== "learning" && (!lead || p.slug !== lead.slug)
    )
    .slice(0, 24);
  const picks = getPicks().slice(0, 3);
  const sidebarPicks = getPicks().slice(0, 5);
  const learn = getPostsByCategory("learning").slice(0, 4);

  return (
    <>
      {/* HERO — opens with the latest top story, front and center */}
      {lead && (
        <section className="relative overflow-hidden border-b bg-gradient-to-b from-secondary/50 to-background">
          {/* Decorative drifting accent blobs (purely visual). */}
          <div
            aria-hidden
            className="pointer-events-none absolute -right-24 -top-28 h-80 w-80 rounded-full bg-accent/20 blur-3xl animate-float-slow"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-32 -left-24 h-80 w-80 rounded-full bg-primary/10 blur-3xl animate-float-slow"
            style={{ animationDelay: "-7s" }}
          />

          <div className="container relative z-10 grid items-center gap-8 py-12 sm:py-16 lg:grid-cols-2 lg:gap-12">
            {/* Image (top on mobile, right on desktop) */}
            <Link
              href={`/post/${lead.slug}`}
              className="group order-1 block overflow-hidden rounded-2xl border bg-muted animate-fade-up lg:order-2"
              style={{ animationDelay: "200ms" }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={lead.image}
                alt={lead.title}
                className="aspect-[16/10] w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              />
            </Link>

            {/* Headline + dek */}
            <div className="order-2 lg:order-1">
              <p className="eyebrow animate-fade-up">
                Top Story{getCategory(lead.category) ? ` · ${getCategory(lead.category)!.title}` : ""}
              </p>
              <h1
                className="mt-4 font-serif text-4xl font-bold leading-[1.05] tracking-tight animate-fade-up sm:text-5xl"
                style={{ animationDelay: "80ms" }}
              >
                <Link
                  href={`/post/${lead.slug}`}
                  className="transition-colors hover:text-accent"
                >
                  {lead.title}
                </Link>
              </h1>
              {lead.subtitle && (
                <p
                  className="mt-4 max-w-xl text-lg text-muted-foreground animate-fade-up"
                  style={{ animationDelay: "150ms" }}
                >
                  {lead.subtitle}
                </p>
              )}
              <div
                className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 animate-fade-up"
                style={{ animationDelay: "230ms" }}
              >
                <Link
                  href={`/post/${lead.slug}`}
                  className={buttonVariants({ size: "lg" })}
                >
                  Read the story
                </Link>
                <span className="text-sm text-muted-foreground">
                  {lead.author} · {formatDate(lead.date)} · {lead.readTime} min read
                </span>
              </div>
            </div>
          </div>
        </section>
      )}

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
                className="transition-transform hover:-translate-y-0.5 hover:bg-secondary hover:text-secondary-foreground"
              >
                {category.title}
              </Badge>
            </Link>
          ))}
        </nav>

        {/* More Top Stories (the rest of the featured set) */}
        {secondary.length > 0 && (
          <Reveal as="section" aria-labelledby="top-stories" className="mb-16">
            <p id="top-stories" className="eyebrow mb-8">
              More Top Stories
            </p>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {secondary.map((post, i) => (
                <Reveal key={post.slug} delay={i * 80}>
                  <PostCard post={post} />
                </Reveal>
              ))}
            </div>
          </Reveal>
        )}

        {/* Mid-page banner ad between sections */}
        <AdBanner slotId="home-mid-banner" className="!px-0" />

        {/* Main grid: Latest news + sidebar */}
        <Reveal className="mt-10 grid gap-12 lg:grid-cols-3">
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
        </Reveal>

        {/* Model & Company Picks */}
        {picks.length > 0 && (
          <Reveal as="section" aria-labelledby="picks" className="mt-16">
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
              {picks.map((pick, i) => (
                <Reveal key={pick.slug} delay={i * 90}>
                  <PickCard post={pick} />
                </Reveal>
              ))}
            </div>
          </Reveal>
        )}

        {/* Learn — evergreen concept explainers */}
        {learn.length > 0 && (
          <Reveal as="section" aria-labelledby="learn" className="mt-16">
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
              {learn.map((p, i) => (
                <Reveal key={p.slug} delay={i * 80}>
                  <Link
                    href={`/post/${p.slug}`}
                    className="group block h-full rounded-xl border p-5 transition-all duration-300 hover:-translate-y-1 hover:border-accent hover:shadow-md"
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
                </Reveal>
              ))}
            </div>
          </Reveal>
        )}
      </div>
    </>
  );
}
