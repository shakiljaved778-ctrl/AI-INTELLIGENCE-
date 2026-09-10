import Link from "next/link";
import { MainNav } from "@/components/layout/main-nav";
import { MobileNav } from "@/components/layout/mobile-nav";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { SearchDialog } from "@/components/search/search-dialog";
import { buttonVariants } from "@/components/ui/button";
import { siteConfig } from "@/lib/site";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="container flex h-16 items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <MobileNav />
          <Link href="/" aria-label={siteConfig.name}>
            <span className="text-lg font-semibold uppercase tracking-[0.28em] sm:text-xl">
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
