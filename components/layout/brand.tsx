import { cn } from "@/lib/utils";
import { siteConfig } from "@/lib/site";

/**
 * Europa Research brand mark — a meridian globe with a Signal-Amber locus:
 * "intelligence for a changing world," a point of insight on the map. The
 * globe lines use `currentColor`, so the mark adapts to ink on light and
 * near-white on dark automatically; the locus is always Signal Amber.
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
      <g stroke="currentColor" strokeWidth="1.4">
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18" />
        <path d="M4.3 7.4Q12 5.7 19.7 7.4" opacity="0.6" />
        <path d="M4.3 16.6Q12 18.3 19.7 16.6" opacity="0.6" />
        <ellipse cx="12" cy="12" rx="4.2" ry="9" />
      </g>
      {/* signal locus */}
      <circle cx="15.6" cy="7.2" r="1.95" fill="hsl(var(--signal))" />
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
