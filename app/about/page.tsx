import type { Metadata } from "next";
import { AdRectangle } from "@/components/ads/ad-rectangle";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "About",
  description:
    "AI Journal is the WSJ of AI — comprehensive, trustworthy news and analysis on artificial intelligence.",
};

const team = [
  { name: "Editorial Desk", role: "News & analysis" },
  { name: "Research Desk", role: "Papers & methods" },
  { name: "Policy Desk", role: "Regulation & governance" },
];

export default function AboutPage() {
  return (
    <div className="container py-8">
      <div className="grid gap-10 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <h1 className="font-serif text-4xl font-bold tracking-tight">
            About {siteConfig.name}
          </h1>
          <div className="prose-article mt-6">
            <p>
              <strong>{siteConfig.name}</strong> is the Wall Street Journal of
              AI — a comprehensive, trustworthy source for news and analysis on
              artificial intelligence. We cover the models, companies, research,
              products, and policy shaping the most consequential technology of
              our era.
            </p>
            <h2>Our mission</h2>
            <p>
              To give researchers, engineers, founders, and investors a single,
              authoritative place to understand what&rsquo;s happening in AI —
              and why it matters. We prize clarity, accuracy, and depth over
              hype.
            </p>
            <h2>How content is curated</h2>
            <p>
              Every story is written and edited by our desks, then organized into
              clear sections — Models, Products, Companies, Research, Policy,
              Opinion, and Events. Standout stories are surfaced as{" "}
              <a href="/picks">Picks</a>, selected by leading AI models and our
              editors, each with a short rationale explaining why it earned the
              spotlight.
            </p>
            <h2>Editorially independent</h2>
            <p>
              {siteConfig.name} is supported by display advertising. Ads are
              clearly labeled and never influence our editorial judgment.
              Interested in reaching our audience? See our{" "}
              <a href="/advertise">media kit</a>.
            </p>
          </div>

          <h2 className="mt-12 font-serif text-2xl font-bold">Our desks</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            {team.map((member) => (
              <div key={member.name} className="rounded-lg border p-4">
                <p className="font-serif text-lg font-semibold">{member.name}</p>
                <p className="text-sm text-muted-foreground">{member.role}</p>
              </div>
            ))}
          </div>
        </div>

        <aside className="space-y-8">
          <AdRectangle slotId="about-sidebar" />
        </aside>
      </div>
    </div>
  );
}
