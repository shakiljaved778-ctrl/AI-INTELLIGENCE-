import Link from "next/link";
import { PostCard } from "@/components/post/post-card";
import { PostList } from "@/components/post/post-list";
import { PickCard } from "@/components/post/pick-card";
import { TopPicks } from "@/components/post/top-picks";
import { AdRectangle } from "@/components/ads/ad-rectangle";
import { AdBanner } from "@/components/ads/ad-banner";
import { Badge } from "@/components/ui/badge";
import { categories } from "@/lib/categories";
import {
  getAllPostMeta,
  getFeaturedPosts,
  getPicks,
} from "@/lib/posts";

export default function HomePage() {
  const featured = getFeaturedPosts(4);
  const [lead, ...secondary] = featured;
  const latest = getAllPostMeta().slice(0, 12);
  const picks = getPicks().slice(0, 3);
  const sidebarPicks = getPicks().slice(0, 5);

  return (
    <div className="container py-8">
      {/* Category quick links */}
      <nav
        aria-label="Sections"
        className="mb-8 flex flex-wrap gap-2 border-b pb-4"
      >
        {categories.map((category) => (
          <Link key={category.slug} href={`/category/${category.slug}`}>
            <Badge variant="outline" className="hover:bg-accent hover:text-accent-foreground">
              {category.title}
            </Badge>
          </Link>
        ))}
      </nav>

      {/* HERO: Top Stories */}
      <section aria-labelledby="top-stories" className="mb-12">
        <h2
          id="top-stories"
          className="mb-6 text-xs font-semibold uppercase tracking-widest text-primary"
        >
          Top Stories
        </h2>
        <div className="grid gap-8 lg:grid-cols-3">
          {lead && (
            <div className="lg:col-span-2 lg:border-r lg:pr-8">
              <PostCard post={lead} variant="feature" />
            </div>
          )}
          <div className="flex flex-col divide-y lg:divide-y">
            {secondary.map((post) => (
              <div key={post.slug} className="py-5 first:pt-0">
                <PostCard post={post} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mid-page banner ad between sections */}
      <AdBanner slotId="home-mid-banner" className="!px-0" />

      {/* Main grid: Latest news + sidebar */}
      <div className="mt-8 grid gap-10 lg:grid-cols-3">
        <section aria-labelledby="latest" className="lg:col-span-2">
          <h2
            id="latest"
            className="mb-2 border-b pb-2 text-lg font-bold uppercase tracking-wide"
          >
            Latest News
          </h2>
          <PostList posts={latest} />
        </section>

        <aside className="space-y-8">
          <TopPicks picks={sidebarPicks} />
          {/* Sidebar rectangle ad */}
          <AdRectangle slotId="home-sidebar" />
          <section>
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Sections
            </h2>
            <ul className="space-y-2 text-sm">
              {categories.map((category) => (
                <li key={category.slug}>
                  <Link
                    href={`/category/${category.slug}`}
                    className="hover:text-primary"
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
        <section aria-labelledby="picks" className="mt-14">
          <div className="mb-6 flex items-end justify-between border-b pb-2">
            <h2 id="picks" className="text-lg font-bold uppercase tracking-wide">
              Model &amp; Company Picks
            </h2>
            <Link href="/picks" className="text-sm text-primary hover:underline">
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
    </div>
  );
}
