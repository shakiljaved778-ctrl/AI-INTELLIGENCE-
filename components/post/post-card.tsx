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
          <h3 className="font-serif text-base font-semibold leading-snug group-hover:underline">
            {post.title}
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
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
        <div className="flex items-center gap-2">
          {category && (
            <Badge variant="secondary" className="uppercase tracking-wide">
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
              ? "mt-3 font-serif text-2xl font-bold leading-tight group-hover:underline sm:text-3xl"
              : "mt-2 font-serif text-xl font-bold leading-tight group-hover:underline"
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
