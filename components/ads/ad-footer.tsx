import { AdSlot } from "@/components/ads/ad-slot";
import { cn } from "@/lib/utils";

/**
 * Footer banner. Rendered above the site footer on every page.
 */
export function AdFooter({
  slotId = "footer-banner",
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
