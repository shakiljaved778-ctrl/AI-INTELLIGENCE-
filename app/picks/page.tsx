import type { Metadata } from "next";
import { PickCard } from "@/components/post/pick-card";
import { AdBanner } from "@/components/ads/ad-banner";
import { getPicks } from "@/lib/posts";

export const metadata: Metadata = {
  title: "Picks",
  description:
    "The latest stories picked by leading AI models and the AI Journal editorial desk — each with a short rationale.",
};

export default function PicksPage() {
  const picks = getPicks();

  // Group picks by source (e.g. "Claude", "Editor", "Gemini").
  const bySource = new Map<string, typeof picks>();
  for (const pick of picks) {
    const source = pick.pickSource ?? "Editor";
    bySource.set(source, [...(bySource.get(source) ?? []), pick]);
  }

  return (
    <div className="container py-8">
      <header className="mb-8 border-b pb-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">
          Curated
        </p>
        <h1 className="mt-1 font-serif text-4xl font-bold tracking-tight">
          Latest Picks
        </h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Stories worth your attention, selected by leading AI models and our
          editors — each with a one-line rationale for why it matters.
        </p>
      </header>

      <AdBanner slotId="picks-top-banner" className="!px-0 !pt-0" />

      {picks.length === 0 ? (
        <p className="py-12 text-muted-foreground">No picks yet.</p>
      ) : (
        <div className="mt-6 space-y-12">
          {Array.from(bySource.entries()).map(([source, sourcePicks]) => (
            <section key={source}>
              <h2 className="mb-4 flex items-center gap-2 text-lg font-bold uppercase tracking-wide">
                {source}&rsquo;s Picks
                <span className="text-sm font-normal text-muted-foreground">
                  ({sourcePicks.length})
                </span>
              </h2>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {sourcePicks.map((pick) => (
                  <PickCard key={pick.slug} post={pick} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
