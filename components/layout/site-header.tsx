"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MainNav } from "@/components/layout/main-nav";
import { MobileNav } from "@/components/layout/mobile-nav";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { SearchDialog } from "@/components/search/search-dialog";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/lib/site";

export function SiteHeader() {
  // Condense the header once the reader scrolls past the very top.
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full border-b backdrop-blur transition-[background-color,box-shadow,border-color] duration-300 supports-[backdrop-filter]:bg-background/70",
        scrolled
          ? "border-border/80 bg-background/90 shadow-sm"
          : "border-transparent bg-background/60"
      )}
    >
      <div
        className={cn(
          "container flex items-center justify-between gap-2 transition-[height] duration-300",
          scrolled ? "h-14" : "h-20"
        )}
      >
        <div className="flex items-center gap-2">
          <MobileNav />
          <Link href="/" aria-label={siteConfig.name}>
            <span
              className={cn(
                "font-semibold uppercase transition-all duration-300",
                scrolled
                  ? "text-base tracking-[0.22em] sm:text-lg"
                  : "text-lg tracking-[0.3em] sm:text-xl"
              )}
            >
              {siteConfig.name}
            </span>
          </Link>
        </div>

        <MainNav />

        <div className="flex items-center gap-1">
          <SearchDialog />
          <ThemeToggle />
          <a
            href="#newsletter"
            className={buttonVariants({ size: "sm", className: "ml-1 hidden sm:inline-flex" })}
          >
            Subscribe
          </a>
        </div>
      </div>
    </header>
  );
}
