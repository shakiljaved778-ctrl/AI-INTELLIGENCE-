"use client";

import * as React from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface SearchEntry {
  title: string;
  slug: string;
  subtitle?: string;
  excerpt: string;
  category: string;
  tags: string[];
  date: string;
  isPick: boolean;
}

/**
 * Client-side search over the static index at /search-index.json.
 * The index is generated at build time (scripts/build-search-index.mjs) — no
 * runtime API is involved. Filtering is a simple debounced substring match
 * over title, subtitle, excerpt, category, and tags.
 */
export function SearchDialog() {
  const [open, setOpen] = React.useState(false);
  const [index, setIndex] = React.useState<SearchEntry[] | null>(null);
  const [query, setQuery] = React.useState("");
  const [debounced, setDebounced] = React.useState("");
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Load the index lazily the first time the dialog opens.
  React.useEffect(() => {
    if (open && index === null) {
      fetch("/search-index.json")
        .then((res) => (res.ok ? res.json() : []))
        .then((data: SearchEntry[]) => setIndex(data))
        .catch(() => setIndex([]));
    }
  }, [open, index]);

  // Debounce the query.
  React.useEffect(() => {
    const id = setTimeout(() => setDebounced(query.trim().toLowerCase()), 150);
    return () => clearTimeout(id);
  }, [query]);

  // Keyboard shortcut: Cmd/Ctrl+K opens search.
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen(true);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const results = React.useMemo(() => {
    if (!index || debounced.length === 0) return [];
    return index
      .filter((entry) => {
        const haystack = [
          entry.title,
          entry.subtitle ?? "",
          entry.excerpt,
          entry.category,
          entry.tags.join(" "),
        ]
          .join(" ")
          .toLowerCase();
        return debounced.split(/\s+/).every((term) => haystack.includes(term));
      })
      .slice(0, 12);
  }, [index, debounced]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Search articles">
          <Search className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent
        className="top-[10vh] gap-0 p-0"
        onOpenAutoFocus={(e) => {
          e.preventDefault();
          inputRef.current?.focus();
        }}
      >
        <DialogTitle className="sr-only">Search articles</DialogTitle>
        <DialogDescription className="sr-only">
          Search Cambrian AI articles by title, topic, or tag.
        </DialogDescription>

        <div className="flex items-center gap-3 border-b px-4">
          <Search className="h-5 w-5 shrink-0 text-muted-foreground" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search articles, topics, tags…"
            className="h-14 w-full bg-transparent text-base outline-none placeholder:text-muted-foreground"
            aria-label="Search query"
          />
        </div>

        <div className="max-h-[55vh] overflow-y-auto p-2">
          {debounced.length === 0 && (
            <p className="px-3 py-6 text-center text-sm text-muted-foreground">
              Start typing to search {index ? `${index.length} ` : ""}articles.
            </p>
          )}

          {debounced.length > 0 && results.length === 0 && (
            <p className="px-3 py-6 text-center text-sm text-muted-foreground">
              No results for &ldquo;{query}&rdquo;.
            </p>
          )}

          <ul className="space-y-1">
            {results.map((entry) => (
              <li key={entry.slug}>
                <Link
                  href={`/post/${entry.slug}`}
                  onClick={() => setOpen(false)}
                  className="block rounded-md px-3 py-2 transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-serif font-medium">{entry.title}</span>
                    {entry.category && (
                      <Badge variant="secondary" className="capitalize">
                        {entry.category}
                      </Badge>
                    )}
                    {entry.isPick && <Badge variant="accent">Pick</Badge>}
                  </div>
                  <p className="mt-0.5 line-clamp-2 text-sm text-muted-foreground">
                    {entry.excerpt}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex items-center justify-between border-t px-4 py-2 text-xs text-muted-foreground">
          <span>Client-side search over static content</span>
          <span>
            <kbd className="rounded border bg-muted px-1.5 py-0.5 font-mono">⌘K</kbd>{" "}
            to open
          </span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
