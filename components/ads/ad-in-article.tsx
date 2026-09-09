import { AdSlot } from "@/components/ads/ad-slot";

/**
 * In-article ad. Placed inside post content after the first few paragraphs.
 * Uses generous vertical margins so it reads as a distinct break in the copy.
 */
export function AdInArticle({
  slotId = "in-article",
}: {
  slotId?: string;
}) {
  return (
    <div className="not-prose my-8">
      <AdSlot
        slotId={slotId}
        label="Advertisement"
        heightClassName="h-[200px] sm:h-[250px]"
      />
    </div>
  );
}
