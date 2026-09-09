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
import { categories } from "@/lib/categories";
import { mainNav } from "@/lib/site";

/**
 * Desktop navigation: primary links plus a "Categories" dropdown built from
 * the category taxonomy.
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

      <DropdownMenu>
        <DropdownMenuTrigger className="inline-flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium text-foreground/80 outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring">
          Categories
          <ChevronDown className="h-4 w-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="min-w-[16rem]">
          <DropdownMenuLabel>Sections</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {categories.map((category) => (
            <DropdownMenuItem key={category.slug} asChild>
              <Link href={`/category/${category.slug}`}>{category.title}</Link>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

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
