import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import type { PostMeta } from "@/types/content";

/**
 * Compact "Top picks" widget for sidebars.
 */
export function TopPicks({
  picks,
  title = "Top picks",
}: {
  picks: PostMeta[];
  title?: string;
}) {
  if (picks.length === 0) return null;

  return (
    <section>
      <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        {title}
      </h2>
      <ul className="space-y-4">
        {picks.map((pick) => (
          <li key={pick.slug} className="group">
            {pick.pickSource && (
              <Badge variant="accent" className="mb-1">
                {pick.pickSource}&rsquo;s Pick
              </Badge>
            )}
            <Link href={`/post/${pick.slug}`}>
              <p className="font-serif text-sm font-semibold leading-snug group-hover:underline">
                {pick.title}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
