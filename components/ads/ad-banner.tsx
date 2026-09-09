import { AdSlot } from "@/components/ads/ad-slot";
import { cn } from "@/lib/utils";

/**
 * Top horizontal banner (leaderboard). Used below the nav / above the hero on
 * every page. Responsive: shorter on mobile, taller on desktop.
 */
export function AdBanner({
  slotId = "top-banner",
  className,
}: {
  slotId?: string;
  className?: string;
}) {
  return (
    <div className={cn("container py-4", className)}>
      <AdSlot
        slotId={slotId}
        label="Advertisement"
        heightClassName="h-20 sm:h-24 md:h-[90px]"
      />
    </div>
  );
}
