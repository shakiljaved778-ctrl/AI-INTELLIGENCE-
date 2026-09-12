import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { getCategory } from "@/lib/categories";
import { formatDate } from "@/lib/utils";
import type { PostMeta } from "@/types/content";

/**
 * Article teaser card. `variant="feature"` renders a larger lead treatment for
 * the hero; `variant="compact"` is a tight row for sidebars and lists.
 */
export function PostCard({
  post,
  variant = "default",
}: {
  post: PostMeta;
  variant?: "default" | "feature" | "compact";
}) {
  const category = getCategory(post.category);

  if (variant === "compact") {
    return (
      <article className="group">
        <Link href={`/post/${post.slug}`} className="block">
          <h3 className="text-base font-semibold leading-snug tracking-tight transition-colors group-hover:text-accent">
            {post.title}
          </h3>
          <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
            {category && (
              <span
                aria-hidden
                className="inline-block h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: `hsl(${category.color})` }}
              />
            )}
            {category?.title} · {formatDate(post.date)}
          </p>
        </Link>
      </article>
    );
  }

  const isFeature = variant === "feature";

  return (
    <article className="group flex flex-col">
      <Link href={`/post/${post.slug}`} className="flex flex-col">
        {post.image && (
          <div className="mb-4 overflow-hidden rounded-xl border bg-muted">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={post.image}
              alt=""
              loading="lazy"
              className="aspect-[16/9] w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            />
          </div>
        )}
        <div className="flex items-center gap-2">
          {category && (
            <Badge variant="secondary" className="gap-1.5 uppercase tracking-wide">
              <span
                aria-hidden
                className="inline-block h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: `hsl(${category.color})` }}
              />
              {category.title}
            </Badge>
          )}
          {post.isPick && post.pickSource && (
            <Badge variant="accent">{post.pickSource}&rsquo;s Pick</Badge>
          )}
        </div>
        <h3
          className={
            isFeature
              ? "mt-4 font-serif text-3xl font-semibold leading-[1.08] tracking-tight transition-colors group-hover:text-accent sm:text-[2.7rem]"
              : "mt-2 font-serif text-xl font-semibold leading-snug tracking-tight transition-colors group-hover:text-accent sm:text-2xl"
          }
        >
          {post.title}
        </h3>
        {post.subtitle && (
          <p
            className={
              isFeature
                ? "mt-2 text-base text-muted-foreground sm:text-lg"
                : "mt-1.5 text-sm text-muted-foreground"
            }
          >
            {post.subtitle}
          </p>
        )}
        <p className="mt-3 text-xs text-muted-foreground">
          By {post.author} · {formatDate(post.date)} · {post.readTime} min read
        </p>
      </Link>
    </article>
  );
}
