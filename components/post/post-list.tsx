import { PostCard } from "@/components/post/post-card";
import { Reveal } from "@/components/reveal";
import type { PostMeta } from "@/types/content";

/**
 * A vertical, divided list of article teasers — used for "Latest News" and
 * category feeds. Pass `animate` to stagger each item in with a scroll reveal.
 */
export function PostList({
  posts,
  animate = false,
}: {
  posts: PostMeta[];
  animate?: boolean;
}) {
  if (posts.length === 0) {
    return (
      <p className="py-8 text-sm text-muted-foreground">No stories yet.</p>
    );
  }

  return (
    <div className="divide-y">
      {posts.map((post, i) => {
        const cls = i === 0 ? "py-6 pt-0" : "py-6";
        return animate ? (
          <Reveal key={post.slug} className={cls} delay={Math.min(i, 8) * 60}>
            <PostCard post={post} />
          </Reveal>
        ) : (
          <div key={post.slug} className={cls}>
            <PostCard post={post} />
          </div>
        );
      })}
    </div>
  );
}
