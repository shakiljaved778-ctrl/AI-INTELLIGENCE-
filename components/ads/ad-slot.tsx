import { cn } from "@/lib/utils";

/**
 * Base ad slot.
 * =============================================================================
 * This renders a labelled placeholder container. NO ad network is wired up by
 * default. To monetize, replace the placeholder markup below with your ad
 * network's tag (e.g. Google AdSense <ins class="adsbygoogle" ...>) and push
 * the slot in a client component or in the network's init script.
 *
 * HOW TO WIRE UP GOOGLE ADSENSE (example):
 *   1. Add the AdSense loader <Script> in app/layout.tsx (see the commented
 *      block there) with your publisher ID.
 *   2. In a client component, render:
 *        <ins className="adsbygoogle"
 *             style={{ display: "block" }}
 *             data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
 *             data-ad-slot={slotId}
 *             data-ad-format="auto"
 *             data-full-width-responsive="true" />
 *      and call (window.adsbygoogle = window.adsbygoogle || []).push({})
 *      inside a useEffect.
 *   3. Pass the network's ad unit id via the `slotId` prop.
 *
 * The wrapper always reserves space and is responsive so ads never break the
 * layout on mobile.
 */
export interface AdSlotProps {
  /** Ad network slot / unit id. Rendered as a data attribute for wiring later. */
  slotId?: string;
  /** Semantic label shown on the placeholder. */
  label?: string;
  /** Tailwind height classes controlling the reserved space per breakpoint. */
  heightClassName?: string;
  className?: string;
}

export function AdSlot({
  slotId = "placeholder",
  label = "Advertisement",
  heightClassName = "h-24",
  className,
}: AdSlotProps) {
  return (
    <aside
      // Wire your ad network here. `data-ad-slot` is a convenient hook.
      data-ad-slot={slotId}
      aria-label="Advertisement"
      className={cn(
        "flex w-full items-center justify-center overflow-hidden rounded-md border border-dashed border-border bg-muted/40 text-muted-foreground",
        heightClassName,
        className
      )}
    >
      {/* ▼▼▼ Replace this block with your ad network tag ▼▼▼ */}
      <div className="flex flex-col items-center gap-0.5 px-4 text-center">
        <span className="text-[10px] font-semibold uppercase tracking-widest">
          {label}
        </span>
        <span className="text-[10px] opacity-70">
          Ad slot &ldquo;{slotId}&rdquo; — insert ad tag here
        </span>
      </div>
      {/* ▲▲▲ Replace this block with your ad network tag ▲▲▲ */}
    </aside>
  );
}
