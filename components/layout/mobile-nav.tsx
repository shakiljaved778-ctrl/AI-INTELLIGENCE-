"use client";

import * as React from "react";
import Link from "next/link";
import { Menu } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { categories } from "@/lib/categories";
import { mainNav, siteConfig } from "@/lib/site";

/**
 * Mobile navigation drawer (opened from the hamburger button). Uses the Dialog
 * primitive as a lightweight sheet.
 */
export function MobileNav() {
  const [open, setOpen] = React.useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="top-0 left-0 h-full w-[85%] max-w-sm -translate-x-0 -translate-y-0 rounded-none border-y-0 border-l-0">
        <DialogTitle className="font-serif text-xl font-bold">
          {siteConfig.name}
        </DialogTitle>
        <nav className="mt-2 flex flex-col" aria-label="Mobile">
          {mainNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="border-b py-3 text-base font-medium"
            >
              {item.title}
            </Link>
          ))}

          <p className="mt-4 mb-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Sections
          </p>
          {categories.map((category) => (
            <Link
              key={category.slug}
              href={`/category/${category.slug}`}
              onClick={() => setOpen(false)}
              className="border-b py-2.5 text-sm text-foreground/80"
            >
              {category.title}
            </Link>
          ))}
        </nav>
      </DialogContent>
    </Dialog>
  );
}
