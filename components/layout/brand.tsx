import { cn } from "@/lib/utils";
import { siteConfig } from "@/lib/site";

/**
 * Bayaan AI brand mark — a geometric "B" monogram in a rounded app-icon tile.
 * The stem and upper bowl are near-white; the lower bowl is Signal Amber. The
 * tile is a self-contained logo (its own ink field + a hairline edge), so it
 * reads identically on light and dark themes and scales to a 16px favicon.
 */
export function BrandMark({
  className,
  title = "Bayaan AI",
}: {
  className?: string;
  title?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      role="img"
      aria-label={title}
      className={cn("h-6 w-6 shrink-0", className)}
    >
      <rect
        x="0.5"
        y="0.5"
        width="23"
        height="23"
        rx="6"
        fill="#141A26"
        stroke="rgba(148,163,184,0.20)"
      />
      <g
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.3"
      >
        <path d="M9 6 V18" stroke="#F4F6FB" />
        <path d="M9 6 H13.4 a3.1 3.1 0 0 1 0 6.2 H9" stroke="#F4F6FB" />
        <path d="M9 12 H14 a3.3 3.3 0 0 1 0 6.4 H9" stroke="#F9B015" />
      </g>
    </svg>
  );
}

/**
 * Full wordmark lockup: the signal mark + "Bayaan" (bold) and
 * "AI" (light, muted). `size` tunes the type for the condensed
 * (scrolled) header vs. the resting one; `tagline` shows the strapline beneath.
 */
export function Wordmark({
  className,
  size = "md",
  tagline = false,
}: {
  className?: string;
  size?: "sm" | "md";
  /** Show the brand tagline beneath the name (used on the home masthead). */
  tagline?: boolean;
}) {
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <BrandMark
        className={
          size === "sm" ? "h-[26px] w-[26px]" : "h-8 w-8 sm:h-9 sm:w-9"
        }
      />
      <span className="flex flex-col justify-center leading-none">
        <span
          className={cn(
            "font-brand font-bold uppercase tracking-[0.01em] text-foreground transition-all duration-300",
            size === "sm" ? "text-lg sm:text-xl" : "text-xl sm:text-[1.7rem]"
          )}
        >
          Bayaan
          <span className="ml-1.5 font-medium text-muted-foreground">
            AI
          </span>
        </span>
        {tagline && (
          <span className="mt-1.5 font-brand text-[10.5px] font-semibold leading-snug tracking-[0.03em] text-navy sm:text-xs">
            Intelligence for a Changing World.
          </span>
        )}
      </span>
      <span className="sr-only">{siteConfig.name}</span>
    </span>
  );
}
