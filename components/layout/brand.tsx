import { cn } from "@/lib/utils";
import { siteConfig } from "@/lib/site";

/**
 * Europa Research brand mark — "the signal rising above the noise."
 * Four bars: three quiet noise bars in the ink/text colour and one tall
 * Signal-Amber bar that stands out — the finding that matters. Scales to a 16px
 * favicon. Noise bars use `currentColor`, so the mark adapts to ink on light
 * and near-white on dark automatically.
 */
export function BrandMark({
  className,
  title = "Europa Research",
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
      fill="none"
    >
      {/* noise */}
      <rect x="1.6" y="14" width="3.2" height="7" rx="1.2" fill="currentColor" opacity="0.34" />
      <rect x="6.6" y="10" width="3.2" height="11" rx="1.2" fill="currentColor" opacity="0.5" />
      <rect x="16.8" y="12" width="3.2" height="9" rx="1.2" fill="currentColor" opacity="0.42" />
      {/* signal */}
      <rect x="11.7" y="3" width="3.4" height="18" rx="1.4" fill="hsl(var(--signal))" />
      <circle cx="13.4" cy="3.2" r="2.1" fill="hsl(var(--signal))" opacity="0.28" />
    </svg>
  );
}

/**
 * Full wordmark lockup: the signal mark + "Europa" (bold) and
 * "Research" (light, muted). `size` tunes the type for the condensed
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
            "font-brand font-bold tracking-[-0.025em] text-foreground transition-all duration-300",
            size === "sm" ? "text-lg sm:text-xl" : "text-xl sm:text-[1.7rem]"
          )}
        >
          Europa
          <span className="ml-1.5 font-medium text-muted-foreground">
            Research
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
