import { cn } from "@/lib/utils";
import { siteConfig } from "@/lib/site";

/**
 * Salience Intelligence brand mark — "the signal rising above the noise."
 * Four bars: three quiet noise bars in the ink/text colour and one tall
 * Signal-Amber bar that stands out (salience). Scales cleanly to a 16px
 * favicon. Noise bars use `currentColor`, so the mark adapts to ink on light
 * and near-white on dark automatically.
 */
export function BrandMark({
  className,
  title = "Salience Intelligence",
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
 * Full wordmark lockup: the signal mark + "Salience" (bold) and
 * "Intelligence" (light, muted). On narrow screens the second word is hidden,
 * leaving the mark + "Salience". `size` tunes the type for the condensed
 * (scrolled) header vs. the resting one.
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
      <BrandMark className={size === "sm" ? "h-[22px] w-[22px]" : "h-7 w-7"} />
      <span className="flex flex-col justify-center leading-none">
        <span
          className={cn(
            "font-brand font-semibold tracking-[-0.01em] text-foreground transition-all duration-300",
            size === "sm" ? "text-base sm:text-lg" : "text-lg sm:text-xl"
          )}
        >
          Salience
          <span className="ml-1.5 font-normal text-muted-foreground">
            Intelligence
          </span>
        </span>
        {tagline && (
          <span className="mt-1 font-brand text-[10.5px] font-medium tracking-[0.02em] text-accent sm:text-[11px]">
            See the Signal, Understand the Shift.
          </span>
        )}
      </span>
      <span className="sr-only">{siteConfig.name}</span>
    </span>
  );
}
