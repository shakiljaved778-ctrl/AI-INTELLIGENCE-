import type { Metadata } from "next";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms of Use",
  description: `Terms of use for ${siteConfig.name}.`,
};

export default function TermsPage() {
  return (
    <div className="container py-8">
      <div className="mx-auto max-w-2xl">
        <h1 className="font-serif text-4xl font-bold tracking-tight">
          Terms of Use
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Placeholder — replace with your reviewed terms before launch.
        </p>
        <div className="prose-article mt-6">
          <p>
            By using {siteConfig.name}, you agree to these placeholder terms.
            Replace this text with terms reviewed by counsel.
          </p>
          <h2>Content</h2>
          <p>
            All articles are provided for informational purposes only and do not
            constitute financial, legal, or professional advice.
          </p>
          <h2>Intellectual property</h2>
          <p>
            Content on this site is the property of {siteConfig.name} unless
            otherwise noted. Do not reproduce without permission.
          </p>
          <h2>Changes</h2>
          <p>We may update these terms at any time. Continued use constitutes acceptance.</p>
        </div>
      </div>
    </div>
  );
}
