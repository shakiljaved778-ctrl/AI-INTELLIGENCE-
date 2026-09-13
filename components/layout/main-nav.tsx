"use client";

import * as React from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { aiCategories, worldCategories } from "@/lib/categories";
import { mainNav } from "@/lib/site";

function SectionDropdown({
  label,
  items,
}: {
  label: string;
  items: { slug: string; title: string; color: string }[];
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="inline-flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium text-foreground/80 outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring">
        {label}
        <ChevronDown className="h-4 w-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-[15rem]">
        <DropdownMenuLabel>{label}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {items.map((c) => (
          <DropdownMenuItem key={c.slug} asChild>
            <Link href={`/category/${c.slug}`} className="flex items-center gap-2">
              <span
                aria-hidden
                className="inline-block h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: `hsl(${c.color})` }}
              />
              {c.title}
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/**
 * Desktop navigation: Home, an "AI" dropdown and a "Beyond" dropdown built from
 * the two category desks, then the remaining primary links.
 */
export function MainNav() {
  return (
    <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
      {mainNav
        .filter((item) => item.title === "Home")
        .map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-md px-3 py-2 text-sm font-medium text-foreground/80 transition-colors hover:text-foreground"
          >
            {item.title}
          </Link>
        ))}

      <SectionDropdown label="AI" items={aiCategories} />
      <SectionDropdown label="Beyond" items={worldCategories} />

      {mainNav
        .filter((item) => item.title !== "Home")
        .map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-md px-3 py-2 text-sm font-medium text-foreground/80 transition-colors hover:text-foreground"
          >
            {item.title}
          </Link>
        ))}
    </nav>
  );
}
