import type { Metadata } from "next";
import { AdRectangle } from "@/components/ads/ad-rectangle";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "About",
  description:
    "Bayaan AI is intelligence for a changing world — sharp, original reporting on AI, technology, markets, and culture, and what each shift means.",
};

const team = [
  { name: "AI Desk", role: "Models, research & policy" },
  { name: "Beyond Desk", role: "Tech, markets & culture" },
  { name: "Editorial Desk", role: "Analysis & picks" },
];

export default function AboutPage() {
  return (
    <div className="container py-8">
      <div className="grid gap-10 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <h1 className="font-serif text-4xl font-bold tracking-tight">
            About {siteConfig.name}
          </h1>
          <p className="eyebrow mt-3 !text-navy">{siteConfig.tagline}</p>
          <div className="prose-article mt-6">
            <p>
              <strong>{siteConfig.name}</strong> is intelligence for a changing
              world. We report on the technology reshaping how we live and work —
              led by artificial intelligence — and on the shifts it sets off
              across markets, business, culture, and everyday life.
            </p>
            <h2>Our mission</h2>
            <p>
              Enough is happening every day to fill a hundred feeds. Our job is
              to tell you what actually matters and why — clearly, accurately,
              and without hype: rigorous analysis that helps you make sense of a
              world in motion.
            </p>
            <h2>What we cover</h2>
            <p>
              Roughly two-thirds of our coverage is AI — the models, companies,
              research, products, and policy defining the field. The rest is{" "}
              <strong>Beyond</strong>: the technology, markets, sports,
              entertainment, and lifestyle stories worth your attention.
              Standout pieces are surfaced as <a href="/picks">Picks</a>, each
              with a short rationale explaining why it earned the spotlight.
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
