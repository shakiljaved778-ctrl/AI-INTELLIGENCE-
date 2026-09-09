import { AdSlot } from "@/components/ads/ad-slot";

/**
 * Sidebar medium rectangle (300x250-ish). Used in the sidebar on home,
 * category, and post pages (desktop).
 */
export function AdRectangle({
  slotId = "sidebar-rectangle",
}: {
  slotId?: string;
}) {
  return (
    <AdSlot
      slotId={slotId}
      label="Advertisement"
      heightClassName="h-[250px]"
    />
  );
}
