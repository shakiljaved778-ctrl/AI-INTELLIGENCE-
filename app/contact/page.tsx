import type { Metadata } from "next";
import { ContactForm } from "@/components/contact-form";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact & Tips",
  description:
    "Send AI Journal a tip, a correction, or a press inquiry. We read everything.",
};

export default function ContactPage() {
  return (
    <div className="container py-8">
      <div className="mx-auto grid max-w-4xl gap-10 md:grid-cols-2">
        <div>
          <h1 className="font-serif text-4xl font-bold tracking-tight">
            Contact &amp; Tips
          </h1>
          <p className="mt-4 text-muted-foreground">
            Have a story tip, spotted an error, or want to reach the newsroom?
            We read everything. For confidential tips, email us directly.
          </p>

          <dl className="mt-6 space-y-4 text-sm">
            <div>
              <dt className="font-semibold">Tips &amp; corrections</dt>
              <dd>
                <a
                  href={`mailto:${siteConfig.contactEmail}`}
                  className="text-primary hover:underline"
                >
                  {siteConfig.contactEmail}
                </a>
              </dd>
            </div>
            <div>
              <dt className="font-semibold">Advertising</dt>
              <dd>
                <a
                  href={`mailto:${siteConfig.advertiseEmail}`}
                  className="text-primary hover:underline"
                >
                  {siteConfig.advertiseEmail}
                </a>
              </dd>
            </div>
          </dl>
        </div>

        <div className="rounded-lg border p-6">
          <ContactForm />
        </div>
      </div>
    </div>
  );
}
