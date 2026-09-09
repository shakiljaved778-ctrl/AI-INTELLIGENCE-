import Link from "next/link";
import { MainNav } from "@/components/layout/main-nav";
import { MobileNav } from "@/components/layout/mobile-nav";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { SearchDialog } from "@/components/search/search-dialog";
import { siteConfig } from "@/lib/site";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="container flex h-16 items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <MobileNav />
          <Link href="/" className="flex flex-col leading-none">
            <span className="font-serif text-xl font-bold tracking-tight sm:text-2xl">
              {siteConfig.name}
            </span>
            <span className="hidden text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground sm:block">
              {siteConfig.tagline}
            </span>
          </Link>
        </div>

        <MainNav />

        <div className="flex items-center gap-0.5">
          <SearchDialog />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
