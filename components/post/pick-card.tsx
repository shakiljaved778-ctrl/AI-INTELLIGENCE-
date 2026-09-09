import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getCategory } from "@/lib/categories";
import { formatDate } from "@/lib/utils";
import type { PostMeta } from "@/types/content";

/**
 * A "pick" card: highlights who picked the story (a model or an editor) and
 * their one-line rationale.
 */
export function PickCard({ post }: { post: PostMeta }) {
  const category = getCategory(post.category);

  return (
    <Card className="flex h-full flex-col transition-shadow hover:shadow-md">
      <CardContent className="flex flex-1 flex-col p-5">
        <div className="mb-3 flex items-center gap-2">
          <Badge variant="accent">
            {post.pickSource ? `${post.pickSource}’s Pick` : "Pick"}
          </Badge>
          {category && (
            <Badge variant="secondary" className="uppercase tracking-wide">
              {category.title}
            </Badge>
          )}
        </div>

        <Link href={`/post/${post.slug}`} className="group">
          <h3 className="font-serif text-lg font-bold leading-snug group-hover:underline">
            {post.title}
          </h3>
        </Link>

        {post.subtitle && (
          <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
            {post.subtitle}
          </p>
        )}

        {post.pickRationale && (
          <blockquote className="mt-4 border-l-2 border-primary pl-3 text-sm italic text-foreground/80">
            “{post.pickRationale}”
          </blockquote>
        )}

        <p className="mt-auto pt-4 text-xs text-muted-foreground">
          {formatDate(post.date)} · {post.readTime} min read
        </p>
      </CardContent>
    </Card>
  );
}
