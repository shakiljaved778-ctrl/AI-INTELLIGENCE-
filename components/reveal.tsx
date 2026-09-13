"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Reveals its children with a subtle fade-up when they scroll into view.
 * Uses IntersectionObserver (fires immediately for above-the-fold content, so
 * it doubles as an on-load entrance). Respects prefers-reduced-motion via CSS.
 */
export function Reveal({
  children,
  className,
  delay = 0,
  as: Tag = "div",
}: {
  children: React.ReactNode;
  className?: string;
  /** Stagger delay in milliseconds. */
  delay?: number;
  as?: React.ElementType;
}) {
  const ref = React.useRef<HTMLElement | null>(null);
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // If IntersectionObserver isn't available, just show the content.
    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      // threshold 0 fires as soon as any part enters; the generous bottom
      // rootMargin pre-reveals ~300px before the block scrolls into view, so
      // tall content blocks never sit as blank space.
      { threshold: 0, rootMargin: "0px 0px 300px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      ref={ref}
      className={cn("reveal", visible && "is-visible", className)}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </Tag>
  );
}
