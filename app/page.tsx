import Link from "next/link";
import { PostCard } from "@/components/post/post-card";
import { PostList } from "@/components/post/post-list";
import { TopPicks } from "@/components/post/top-picks";
import { AdRectangle } from "@/components/ads/ad-rectangle";
import { Reveal } from "@/components/reveal";
import {
  getCategory,
  aiCategorySlugs,
  worldCategories,
} from "@/lib/categories";
import { formatDate } from "@/lib/utils";
import {
  getAllPostMeta,
  getPicks,
  getPostsByCategory,
} from "@/lib/posts";
import type { PostMeta } from "@/types/content";

/** Compact headline row with a section color dot (used in lists/columns). */
function HeadlineRow({ post, showDate = true }: { post: PostMeta; showDate?: boolean }) {
  const category = getCategory(post.category);
  return (
    <article className="group py-3">
      <Link href={`/post/${post.slug}`} className="block">
        <div className="flex items-center gap-1.5">
          {category && (
            <span
              aria-hidden
              className="inline-block h-1.5 w-1.5 shrink-0 rounded-full"
              style={{ backgroundColor: `hsl(${category.color})` }}
            />
          )}
          <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            {category?.title}
          </span>
        </div>
        <h4 className="mt-1 font-serif text-[0.98rem] font-semibold leading-snug tracking-tight transition-colors group-hover:text-accent">
          {post.title}
        </h4>
        {showDate && (
          <p className="mt-1 text-xs text-muted-foreground">{formatDate(post.date)}</p>
        )}
      </Link>
    </article>
  );
}

export default function HomePage() {
  const news = getAllPostMeta().filter((p) => p.category !== "learning");

  // Progressive selection so no story repeats across blocks.
  const used = new Set<string>();
  const take = (arr: PostMeta[], n: number) => {
    const out: PostMeta[] = [];
    for (const p of arr) {
      if (out.length >= n) break;
      if (used.has(p.slug)) continue;
      used.add(p.slug);
      out.push(p);
    }
    return out;
  };

  const lead = news[0];
  if (lead) used.add(lead.slug);
  const latestList = take(news, 6); // "Latest" rail beside the lead
  const secondary = take(news, 4); // feature cards under the hero

  const aiNews = news.filter((p) => aiCategorySlugs.has(p.category));
  const aiLatest = take(aiNews, 12);

  const beyondBlocks = worldCategories
    .map((c) => ({ cat: c, posts: take(news.filter((p) => p.category === c.slug), 4) }))
    .filter((b) => b.posts.length > 0);

  const leadCat = lead ? getCategory(lead.category) : undefined;
  const sidebarPicks = getPicks().slice(0, 5);
  const learn = getPostsByCategory("learning").slice(0, 5);

  return (
    <div className="container py-6 sm:py-8">
      {/* ── Hero cluster: big lead + Latest headline rail ── */}
      {lead && (
        <section aria-label="Top stories" className="mb-12 border-b pb-10">
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Lead */}
            <article className="group lg:col-span-2">
              <Link href={`/post/${lead.slug}`} className="block">
                <div className="overflow-hidden rounded-2xl border bg-muted">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={lead.image}
                    alt=""
                    className="aspect-[16/9] w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                </div>
                <div className="mt-4 flex items-center gap-2">
                  {leadCat && (
                    <span
                      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-white"
                      style={{ backgroundColor: `hsl(${leadCat.color})` }}
                    >
                      {leadCat.title}
                    </span>
                  )}
                  <span className="text-xs text-muted-foreground">
                    {formatDate(lead.date)}
                  </span>
                </div>
                <h1 className="mt-3 font-serif text-3xl font-bold leading-[1.08] tracking-tight transition-colors group-hover:text-accent sm:text-4xl lg:text-5xl">
                  {lead.title}
                </h1>
                {lead.subtitle && (
                  <p className="mt-3 max-w-2xl text-base text-muted-foreground sm:text-lg">
                    {lead.subtitle}
                  </p>
                )}
                <p className="mt-3 text-xs text-muted-foreground">
                  By {lead.author} · {lead.readTime} min read
                </p>
              </Link>
            </article>

            {/* Latest rail */}
            <aside className="lg:border-l lg:pl-8">
              <p className="eyebrow mb-2">Latest</p>
              <ol className="divide-y">
                {latestList.map((post, i) => (
                  <li key={post.slug} className="flex gap-3 py-3 first:pt-0">
                    <span className="mt-0.5 font-mono text-xs font-semibold tabular-nums text-accent">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div className="min-w-0 flex-1">
                      <HeadlineRow post={post} showDate={false} />
                    </div>
                  </li>
                ))}
              </ol>
            </aside>
          </div>
        </section>
      )}

      {/* ── Secondary features ── */}
      {secondary.length > 0 && (
        <Reveal as="section" className="mb-14">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {secondary.map((post, i) => (
              <Reveal key={post.slug} delay={i * 70}>
                <PostCard post={post} />
              </Reveal>
            ))}
          </div>
        </Reveal>
      )}

      {/* ── AI desk ── */}
      <section aria-labelledby="ai-desk" className="mb-16">
        <div className="mb-6 flex items-end justify-between border-b pb-3">
          <div>
            <p className="eyebrow mb-1">The core</p>
            <h2 id="ai-desk" className="font-serif text-2xl font-bold tracking-tight sm:text-3xl">
              Artificial Intelligence
            </h2>
          </div>
          <Link href="/category/models" className="text-sm font-medium text-accent hover:underline">
            More AI →
          </Link>
        </div>
        <Reveal className="grid gap-12 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <PostList posts={aiLatest} />
          </div>
          <aside className="space-y-10">
            <TopPicks picks={sidebarPicks} />
            <AdRectangle slotId="home-sidebar" />
          </aside>
        </Reveal>
      </section>

      {/* ── Beyond desk: a column per section ── */}
      {beyondBlocks.length > 0 && (
        <Reveal as="section" aria-labelledby="beyond" className="mb-16">
          <div className="mb-6 flex items-end justify-between border-b pb-3">
            <div>
              <p className="eyebrow mb-1">Beyond AI</p>
              <h2 id="beyond" className="font-serif text-2xl font-bold tracking-tight sm:text-3xl">
                The wider world
              </h2>
            </div>
          </div>
          <div className="grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {beyondBlocks.map((block, i) => (
              <Reveal key={block.cat.slug} delay={i * 60} className="min-w-0">
                <div className="mb-2 flex items-center justify-between border-b pb-2">
                  <Link
                    href={`/category/${block.cat.slug}`}
                    className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide hover:text-accent"
                  >
                    <span
                      aria-hidden
                      className="inline-block h-2 w-2 rounded-full"
                      style={{ backgroundColor: `hsl(${block.cat.color})` }}
                    />
                    {block.cat.title}
                  </Link>
                </div>
                {/* First story gets a thumbnail, the rest are headline rows. */}
                <article className="group">
                  <Link href={`/post/${block.posts[0].slug}`} className="block">
                    <div className="overflow-hidden rounded-lg border bg-muted">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={block.posts[0].image}
                        alt=""
                        loading="lazy"
                        className="aspect-[16/9] w-full object-cover transition-transform duration-300 group-hover:scale-[1.04]"
                      />
                    </div>
                    <h4 className="mt-2 font-serif text-lg font-semibold leading-snug tracking-tight transition-colors group-hover:text-accent">
                      {block.posts[0].title}
                    </h4>
                  </Link>
                </article>
                <div className="mt-1 divide-y">
                  {block.posts.slice(1).map((post) => (
                    <HeadlineRow key={post.slug} post={post} showDate={false} />
                  ))}
                </div>
              </Reveal>
            ))}
          </div>
        </Reveal>
      )}

      {/* ── Learn strip ── */}
      {learn.length > 0 && (
        <Reveal as="section" aria-labelledby="learn">
          <div className="mb-6 flex items-end justify-between border-b pb-3">
            <div>
              <p className="eyebrow mb-1">Learn</p>
              <h2 id="learn" className="text-2xl font-semibold tracking-tight">
                AI concepts, explained
              </h2>
            </div>
            <Link href="/category/learning" className="text-sm font-medium text-accent hover:underline">
              All explainers →
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {learn.map((p, i) => (
              <Reveal key={p.slug} delay={i * 70}>
                <Link
                  href={`/post/${p.slug}`}
                  className="group block h-full rounded-xl border p-5 transition-all duration-300 hover:-translate-y-1 hover:border-accent hover:shadow-md"
                >
                  <p className="eyebrow mb-2">Explainer</p>
                  <h3 className="text-base font-semibold leading-snug tracking-tight transition-colors group-hover:text-accent">
                    {p.title}
                  </h3>
                </Link>
              </Reveal>
            ))}
          </div>
        </Reveal>
      )}
    </div>
  );
}
