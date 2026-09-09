import type { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { AdSlot } from "@/components/ads/ad-slot";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Advertise",
  description:
    "Reach a high-intent audience of AI researchers, engineers, founders, and investors. AI Journal media kit and ad formats.",
};

const stats = [
  { label: "Monthly readers", value: "—", note: "placeholder" },
  { label: "Newsletter subscribers", value: "—", note: "placeholder" },
  { label: "Avg. time on article", value: "—", note: "placeholder" },
];

const formats = [
  {
    name: "Header Leaderboard",
    spec: "728×90 / responsive",
    desc: "Top banner below the nav on every page. Maximum reach.",
  },
  {
    name: "Sidebar Rectangle",
    spec: "300×250",
    desc: "Medium rectangle on home, category, and article pages (desktop).",
  },
  {
    name: "In-Article",
    spec: "Responsive",
    desc: "Native placement inside article copy after the opening paragraphs.",
  },
  {
    name: "Footer Banner",
    spec: "728×90 / responsive",
    desc: "Banner above the site footer on every page.",
  },
];

export default function AdvertisePage() {
  return (
    <div className="container py-8">
      <header className="mb-10 max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">
          Media Kit
        </p>
        <h1 className="mt-1 font-serif text-4xl font-bold tracking-tight">
          Advertise with {siteConfig.name}
        </h1>
        <p className="mt-3 text-lg text-muted-foreground">
          Reach a high-intent, hard-to-reach audience of AI researchers,
          engineers, founders, and investors who come to us for signal, not
          noise.
        </p>
      </header>

      {/* Audience stats (placeholders) */}
      <section className="mb-12 grid gap-4 sm:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader>
              <CardTitle className="text-3xl font-bold">{stat.value}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm font-medium">{stat.label}</p>
              <p className="text-xs text-muted-foreground">({stat.note})</p>
            </CardContent>
          </Card>
        ))}
      </section>

      {/* Ad formats */}
      <section className="mb-12">
        <h2 className="mb-4 font-serif text-2xl font-bold">Available formats</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {formats.map((format) => (
            <Card key={format.name}>
              <CardContent className="p-5">
                <div className="flex items-baseline justify-between gap-2">
                  <p className="font-serif text-lg font-semibold">
                    {format.name}
                  </p>
                  <span className="rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                    {format.spec}
                  </span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  {format.desc}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Example placement */}
      <section className="mb-12">
        <h2 className="mb-4 font-serif text-2xl font-bold">Example placement</h2>
        <AdSlot
          slotId="media-kit-demo"
          label="Your ad here"
          heightClassName="h-[250px]"
        />
      </section>

      {/* Contact */}
      <section className="rounded-lg border bg-muted/30 p-8 text-center">
        <h2 className="font-serif text-2xl font-bold">Let&rsquo;s talk</h2>
        <p className="mx-auto mt-2 max-w-xl text-muted-foreground">
          Tell us about your product and goals and we&rsquo;ll send rates and
          availability.
        </p>
        <div className="mt-5">
          <a
            href={`mailto:${siteConfig.advertiseEmail}?subject=Advertising%20inquiry`}
            className={buttonVariants()}
          >
            Email {siteConfig.advertiseEmail}
          </a>
        </div>
      </section>
    </div>
  );
}
