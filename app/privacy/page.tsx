import type { Metadata } from "next";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `Privacy policy for ${siteConfig.name}.`,
};

export default function PrivacyPage() {
  return (
    <div className="container py-8">
      <div className="mx-auto max-w-2xl">
        <h1 className="font-serif text-4xl font-bold tracking-tight">
          Privacy Policy
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Placeholder — replace with your reviewed policy before launch.
        </p>
        <div className="prose-article mt-6">
          <p>
            {siteConfig.name} respects your privacy. This placeholder page
            describes, in general terms, how a static publication like this one
            typically handles data. Replace it with a policy reviewed by counsel.
          </p>
          <h2>Information we collect</h2>
          <p>
            The site is static and stores no personal data on its own servers.
            Third-party services you enable — such as an ad network, analytics,
            or a newsletter provider — may set cookies or collect usage data
            under their own policies.
          </p>
          <h2>Advertising</h2>
          <p>
            If display advertising is enabled, ad partners may use cookies to
            serve and measure ads. Review your ad network&rsquo;s policy and
            surface any required consent notices here.
          </p>
          <h2>Contact</h2>
          <p>
            Questions? Email{" "}
            <a href={`mailto:${siteConfig.contactEmail}`}>
              {siteConfig.contactEmail}
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
