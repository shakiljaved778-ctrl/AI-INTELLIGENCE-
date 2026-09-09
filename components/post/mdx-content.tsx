import Link from "next/link";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import { AdInArticle } from "@/components/ads/ad-in-article";
import { NewsletterSignup } from "@/components/newsletter-signup";
import { splitContentForAd } from "@/lib/posts";

/**
 * Custom components available inside MDX. Authors can drop <Callout>, an
 * <AdInArticle />, or <NewsletterSignup /> directly into a post body. Internal
 * links are upgraded to Next.js <Link> for client-side navigation.
 */
const mdxComponents = {
  a: ({ href = "", ...props }: React.ComponentProps<"a">) => {
    const isInternal = href.startsWith("/") || href.startsWith("#");
    if (isInternal) {
      return (
        <Link href={href} {...props} />
      );
    }
    return <a href={href} target="_blank" rel="noopener noreferrer" {...props} />;
  },
  Callout: ({ children }: { children: React.ReactNode }) => (
    <div className="not-prose my-6 rounded-md border-l-4 border-primary bg-muted/50 p-4 text-sm">
      {children}
    </div>
  ),
  AdInArticle,
  NewsletterSignup,
};

const mdxOptions = {
  mdxOptions: {
    remarkPlugins: [remarkGfm],
  },
};

/**
 * Render an article body as MDX with an in-article ad inserted after the first
 * few paragraphs. If the author placed their own <AdInArticle /> in the body,
 * they can pass `autoAd={false}` to skip the automatic one.
 */
export function MDXContent({
  source,
  autoAd = true,
}: {
  source: string;
  autoAd?: boolean;
}) {
  if (!autoAd) {
    return <MDXRemote source={source} components={mdxComponents} options={mdxOptions} />;
  }

  const [before, after] = splitContentForAd(source, 3);

  return (
    <>
      <MDXRemote source={before} components={mdxComponents} options={mdxOptions} />
      {after && (
        <>
          <AdInArticle />
          <MDXRemote source={after} components={mdxComponents} options={mdxOptions} />
        </>
      )}
    </>
  );
}
