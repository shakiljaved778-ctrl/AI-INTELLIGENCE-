import { PostCard } from "@/components/post/post-card";
import type { PostMeta } from "@/types/content";

/**
 * A vertical, divided list of article teasers — used for "Latest News" and
 * category feeds.
 */
export function PostList({ posts }: { posts: PostMeta[] }) {
  if (posts.length === 0) {
    return (
      <p className="py-8 text-sm text-muted-foreground">No stories yet.</p>
    );
  }

  return (
    <div className="divide-y">
      {posts.map((post) => (
        <div key={post.slug} className="py-6 first:pt-0">
          <PostCard post={post} />
        </div>
      ))}
    </div>
  );
}
