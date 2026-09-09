import { PostCard } from "@/components/post/post-card";
import type { PostMeta } from "@/types/content";

export function RelatedStories({ posts }: { posts: PostMeta[] }) {
  if (posts.length === 0) return null;

  return (
    <section>
      <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        Related stories
      </h2>
      <div className="space-y-4">
        {posts.map((post) => (
          <PostCard key={post.slug} post={post} variant="compact" />
        ))}
      </div>
    </section>
  );
}
