# AI Journal — the WSJ of AI

A production-ready, **fully static** news site for artificial intelligence —
covering models, companies, research, products, policy, and curated editor/model
"picks." All content is stored in the repository as MDX and rendered at build
time. **There are no live APIs or external data fetching at runtime.** Monetized
via banner and display ad slots.

Built with **Next.js (App Router) + TypeScript**, **Tailwind CSS**, and
shadcn/ui-style components. Designed to deploy on **Vercel** straight from
GitHub.

> The publication name (`AI Journal`) is a placeholder. Change it once in
> [`lib/site.ts`](lib/site.ts) and it updates everywhere.

---

## Quick start

Requires **Node 18.18+** (Node 20/22 recommended) and **pnpm**.

```bash
pnpm install       # install dependencies
pnpm dev           # start the dev server at http://localhost:3000
pnpm build         # production build (also regenerates the search index)
pnpm start         # serve the production build locally
pnpm lint          # run ESLint
pnpm search-index  # regenerate public/search-index.json manually
```

`pnpm dev` and `pnpm build` automatically rebuild the search index first (via
the `predev` / `prebuild` scripts).

---

## Project structure

```
app/                     App Router routes, layouts, metadata
  layout.tsx             Root layout: header, footer, ad slots, theme, SEO
  page.tsx               Home (hero, latest, picks, category links)
  category/[slug]/       Category pages (static per category)
  post/[slug]/           Article pages (MDX + in-article ad + sidebar)
  picks/                 "Latest Picks" page, grouped by source
  tag/[slug]/            Tag pages (static per tag)
  about/ advertise/      Marketing pages
  contact/               Contact & tips (mailto form)
  privacy/ terms/        Legal placeholders
  sitemap.ts robots.ts   SEO route handlers
  not-found.tsx          404
components/
  ui/                    shadcn/ui-style primitives (button, card, dialog, …)
  ads/                   AdBanner, AdRectangle, AdInArticle, AdFooter, AdSlot
  layout/                Header, footer, nav, theme toggle
  post/                  Cards, lists, MDX renderer, related/picks widgets
  search/                Client-side search dialog
lib/
  posts.ts               MDX parsing, validation, queries (build-time)
  categories.ts          Category taxonomy (single source of truth)
  site.ts                Site name, nav, description, contact emails
  utils.ts               cn() + date formatting
content/
  posts/*.mdx            All articles (see content/README.md)
  README.md              How to add/edit posts
scripts/
  build-search-index.mjs Generates public/search-index.json at build time
public/                  Static assets + generated search index
types/                   Content type definitions
```

---

## Adding & editing content

See **[`content/README.md`](content/README.md)** for the full frontmatter schema
and workflow. In short:

1. Copy `content/posts/_template.mdx` to a new `.mdx` file.
2. Fill in the frontmatter and write the body.
3. Commit and push — Vercel rebuilds and deploys automatically.

Required frontmatter fields are validated at build time; missing fields fail the
build with a clear, file-specific error, so broken content never ships.

---

## Ads & monetization

Ad slots are structural placeholders — **no ad network is wired up by default.**
Reusable components live in [`components/ads/`](components/ads):

| Component      | Placement |
|----------------|-----------|
| `AdBanner`     | Top leaderboard, below the nav on every page. Also used mid-page on home. |
| `AdRectangle`  | Sidebar rectangle on home, category, post, and tag pages. |
| `AdInArticle`  | Inside article copy, auto-inserted after the opening paragraphs. |
| `AdFooter`     | Banner above the footer on every page. |

Each renders a labelled placeholder and accepts a `slotId` prop. To monetize:

1. **Add your network's loader script** in [`app/layout.tsx`](app/layout.tsx) —
   there's a commented block showing the Google AdSense pattern with
   `next/script`.
2. **Replace the placeholder markup** inside
   [`components/ads/ad-slot.tsx`](components/ads/ad-slot.tsx) with your network's
   ad tag (e.g. the AdSense `<ins class="adsbygoogle">` element and its
   `push({})` call).
3. **Pass real ad unit ids** via the `slotId` prop where each ad is used.

Containers are responsive and reserve height so ads never break the layout on
mobile.

---

## Search

Client-side search runs over a static index at `public/search-index.json`,
generated at build time from the MDX frontmatter and body (title, slug,
excerpt, category, tags). The search dialog (⌘K / Ctrl+K, or the header search
icon) fetches this file and filters it in the browser — no server involved.

---

## SEO

- Per-page and per-post metadata via the App Router Metadata API (title
  template, description, Open Graph, Twitter cards).
- `NewsArticle` JSON-LD on article pages.
- `sitemap.xml` and `robots.txt` generated from
  [`app/sitemap.ts`](app/sitemap.ts) and [`app/robots.ts`](app/robots.ts).
- Set your production domain in [`lib/site.ts`](lib/site.ts) (`url`) so absolute
  URLs and OG tags are correct.

---

## Theming & design

- WSJ-inspired: serif headlines, dense-but-modern spacing, deep-red accent.
- Light/dark mode via `next-themes` (toggle in the header; respects system
  preference).
- Colors are CSS variables in [`app/globals.css`](app/globals.css) — adjust the
  palette in one place.
- Fonts use system serif/sans stacks by default (no network fetch at build). To
  use web fonts, wire up `next/font` and point `--font-serif` / `--font-sans` at
  them.

---

## Deploy to Vercel

1. Push this repository to GitHub.
2. In [Vercel](https://vercel.com), **New Project → Import** the repo.
3. Framework preset **Next.js** is detected automatically. No environment
   variables are required. Defaults:
   - Build command: `pnpm build` (runs the search-index step first)
   - Output: handled by Next.js
4. Deploy. Vercel rebuilds on every push to the default branch; preview
   deployments are created for pull requests.

After the first deploy, update `url` in [`lib/site.ts`](lib/site.ts) to your
Vercel/custom domain and redeploy so metadata and the sitemap use the correct
absolute URLs.

No `vercel.json` is needed for the standard setup. Add one only if you later
introduce custom rewrites, redirects, or headers.

---

## Tech stack

- **Next.js 15** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS 3** + `@tailwindcss/typography`
- **shadcn/ui-style** components (Radix primitives, CVA, `lucide-react`)
- **MDX** via `next-mdx-remote` + `gray-matter` + `remark-gfm`
- **next-themes** for dark mode

## Notes & conventions

- The site is 100% static: every route is prerendered (`○ Static` / `● SSG`).
- Content parsing and validation live in `lib/posts.ts` and run at build time.
- The category taxonomy in `lib/categories.ts` is the single source of truth for
  sections.
