import Link from "next/link";
import { PostCard } from "@/components/post/post-card";
import { PostList } from "@/components/post/post-list";
import { PickCard } from "@/components/post/pick-card";
import { TopPicks } from "@/components/post/top-picks";
import { AdRectangle } from "@/components/ads/ad-rectangle";
import { AdBanner } from "@/components/ads/ad-banner";
import { Reveal } from "@/components/reveal";
import {
  getCategory,
  aiCategorySlugs,
  worldCategorySlugs,
} from "@/lib/categories";
import { formatDate } from "@/lib/utils";
import {
  getAllPostMeta,
  getFeaturedPosts,
  getPicks,
  getPostsByCategory,
} from "@/lib/posts";
import type { PostMeta } from "@/types/content";

/** A compact card for the "Latest" fresh rail, numbered to convey sequence. */
function FreshCard({ post, index }: { post: PostMeta; index: number }) {
  const category = getCategory(post.category);
  return (
    <article className="group snap-start w-[82%] shrink-0 sm:w-[46%] lg:w-auto lg:shrink">
      <Link href={`/post/${post.slug}`} className="block">
        <div className="relative overflow-hidden rounded-xl border bg-muted">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={post.image}
            alt=""
            loading="lazy"
            className="aspect-[16/9] w-full object-cover transition-transform duration-300 group-hover:scale-[1.04]"
          />
          <span className="absolute left-2 top-2 rounded-md bg-background/85 px-1.5 py-0.5 font-mono text-[11px] font-semibold tabular-nums text-foreground/80 backdrop-blur">
            {String(index + 1).padStart(2, "0")}
          </span>
        </div>
        <div className="mt-3 flex items-center gap-1.5">
          {category && (
            <>
              <span
                aria-hidden
                className="inline-block h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: `hsl(${category.color})` }}
              />
              <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                {category.title}
              </span>
            </>
          )}
        </div>
        <h3 className="mt-1 font-serif text-lg font-semibold leading-snug tracking-tight transition-colors group-hover:text-accent">
          {post.title}
        </h3>
        <p className="mt-1 text-xs text-muted-foreground">
          {formatDate(post.date)}
        </p>
      </Link>
    </article>
  );
}

export default function HomePage() {
  const allMeta = getAllPostMeta();
  // News feed = everything except evergreen "Learn" explainers.
  const news = allMeta.filter((p) => p.category !== "learning");

  // Fresh rail: the newest stories across BOTH desks, so the reader always
  // opens to what's new this morning — shown in sequence, not stale.
  const fresh = news.slice(0, 5);
  const freshSlugs = new Set(fresh.map((p) => p.slug));

  // ── AI desk (the core, ~65%) ──────────────────────────────────────────────
  const aiRecent = news.filter(
    (p) => aiCategorySlugs.has(p.category) && !freshSlugs.has(p.slug)
  );
  const aiFeatured = new Set(getFeaturedPosts(8).map((p) => p.slug));
  let aiBento = aiRecent.filter((p) => aiFeatured.has(p.slug));
  if (aiBento.length < 3) aiBento = aiRecent;
  aiBento = aiBento.slice(0, 5);
  const aiBentoSlugs = new Set(aiBento.map((p) => p.slug));
  const aiLatest = aiRecent
    .filter((p) => !aiBentoSlugs.has(p.slug))
    .slice(0, 14);

  // ── Beyond desk (non-AI, ~35%) ────────────────────────────────────────────
  const beyond = news
    .filter((p) => worldCategorySlugs.has(p.category) && !freshSlugs.has(p.slug))
    .slice(0, 6);

  const sidebarPicks = getPicks().slice(0, 5);
  const learn = getPostsByCategory("learning").slice(0, 4);

  return (
    <div className="container py-8 sm:py-10">
      {/* ── Fresh rail: newest across all desks, horizontal & sequential ── */}
      {fresh.length > 0 && (
        <section aria-labelledby="latest" className="mb-14">
          <div className="mb-5 flex items-end justify-between border-b pb-3">
            <div>
              <p className="eyebrow mb-1">Fresh this morning</p>
              <h2
                id="latest"
                className="font-serif text-2xl font-bold tracking-tight sm:text-3xl"
              >
                Latest
              </h2>
            </div>
            <span className="hidden text-xs text-muted-foreground sm:block">
              Newest first · updated daily
            </span>
          </div>
          <div className="-mx-1 flex snap-x gap-5 overflow-x-auto px-1 pb-4 lg:mx-0 lg:grid lg:grid-cols-5 lg:gap-6 lg:overflow-visible lg:px-0 lg:pb-0">
            {fresh.map((post, i) => (
              <FreshCard key={post.slug} post={post} index={i} />
            ))}
          </div>
        </section>
      )}

      {/* ── AI desk ── */}
      <section aria-labelledby="ai-desk" className="mb-16">
        <div className="mb-8 flex items-end justify-between border-b pb-3">
          <div>
            <p className="eyebrow mb-1">The core</p>
            <h2
              id="ai-desk"
              className="font-serif text-2xl font-bold tracking-tight sm:text-3xl"
            >
              Artificial Intelligence
            </h2>
          </div>
        </div>

        {/* Top stories bento (wide lead tile + smaller tiles) */}
        {aiBento.length > 0 && (
          <div className="mb-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {aiBento.map((post, i) => (
              <Reveal
                key={post.slug}
                delay={i * 80}
                className={i === 0 ? "sm:col-span-2" : ""}
              >
                <PostCard post={post} variant={i === 0 ? "feature" : "default"} />
              </Reveal>
            ))}
          </div>
        )}

        <AdBanner slotId="home-mid-banner" className="!px-0" />

        {/* Latest AI news + sidebar */}
        <Reveal className="mt-10 grid gap-12 lg:grid-cols-3">
          <section aria-labelledby="ai-latest" className="lg:col-span-2">
            <h3
              id="ai-latest"
              className="mb-4 scroll-mt-24 border-b pb-3 text-xl font-semibold tracking-tight"
            >
              Latest in AI
            </h3>
            <PostList posts={aiLatest} />
          </section>

          <aside className="space-y-10">
            <TopPicks picks={sidebarPicks} />
            <AdRectangle slotId="home-sidebar" />
          </aside>
        </Reveal>
      </section>

      {/* ── Beyond desk (non-AI) ── */}
      {beyond.length > 0 && (
        <Reveal as="section" aria-labelledby="beyond" className="mb-16">
          <div className="mb-8 flex items-end justify-between border-b pb-3">
            <div>
              <p className="eyebrow mb-1">Beyond AI</p>
              <h2
                id="beyond"
                className="font-serif text-2xl font-bold tracking-tight sm:text-3xl"
              >
                The wider world
              </h2>
            </div>
          </div>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {beyond.map((post, i) => (
              <Reveal key={post.slug} delay={i * 70}>
                <PostCard post={post} />
              </Reveal>
            ))}
          </div>
        </Reveal>
      )}

      {/* ── Picks ── */}
      {sidebarPicks.length > 0 && (
        <Reveal as="section" aria-labelledby="picks" className="mb-16">
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
            {sidebarPicks.slice(0, 3).map((pick, i) => (
              <Reveal key={pick.slug} delay={i * 90}>
                <PickCard post={pick} />
              </Reveal>
            ))}
          </div>
        </Reveal>
      )}

      {/* ── Learn ── */}
      {learn.length > 0 && (
        <Reveal as="section" aria-labelledby="learn">
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
  );
}
