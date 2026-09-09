# Content guide

All articles live in this folder as MDX files (`content/posts/*.mdx`). The site
reads them at **build time** — there is no database and no runtime API. To
publish, add or edit a file here and redeploy (Vercel does this automatically on
every push).

## Add a new post in 3 steps

1. Copy `content/posts/_template.mdx` to a new file, e.g.
   `content/posts/my-new-story.mdx`. (Files starting with `_` are ignored, so
   the template never appears on the site.)
2. Edit the frontmatter (the block between the `---` lines) and write your
   article body below it in Markdown/MDX.
3. Commit and push. That's it.

The filename becomes the URL slug by default (`/post/my-new-story`), unless you
set a `slug` field.

## Frontmatter schema

| Field          | Required | Type      | Notes |
|----------------|----------|-----------|-------|
| `title`        | ✅       | string    | Headline. |
| `subtitle`     |          | string    | Deck / standfirst shown under the title. |
| `slug`         |          | string    | URL slug. Defaults to the filename. Must be unique. |
| `date`         | ✅       | string    | ISO date, e.g. `"2025-09-01"`. |
| `updated`      |          | string    | ISO date of last update. |
| `author`       | ✅       | string    | Byline. |
| `category`     | ✅       | string    | One of: `research`, `products`, `companies`, `policy`, `models`, `opinion`, `events`. |
| `tags`         |          | string[]  | e.g. `["LLM", "OpenAI"]`. Each tag gets a page at `/tag/<slug>`. |
| `featured`     |          | boolean   | `true` makes the post eligible for the home hero. |
| `isPick`       |          | boolean   | `true` shows the post on `/picks`. Requires `pickSource`. |
| `pickSource`   | if pick  | string    | Who picked it: `"Claude"`, `"Gemini"`, `"Editor"`, etc. |
| `pickRationale`|          | string    | One or two sentences on why it was picked. |
| `readTime`     |          | number    | Minutes. Auto-computed from the body if omitted. |
| `image`        |          | string    | Optional hero/OG image path (in `/public`). |

Required fields are validated at build time. If one is missing or a `category`
is invalid, **the build fails with a clear error naming the file** — so broken
content never ships.

## Categories

Categories are defined in [`lib/categories.ts`](../lib/categories.ts). To add or
rename one, edit that file — the nav dropdown, category pages, footer, and
validation all read from it. A post's `category` must match a category `slug`.

## Tags

Tags are free-form. Use consistent casing (`"LLM"`, not `"llm"` and `"Llm"`) so
they group correctly. Tag pages are generated automatically for every tag in
use.

## Picks

A "pick" is a highlighted story. Set `isPick: true` and a `pickSource`
(`"Claude"`, `"Gemini"`, `"Editor"`, …). Add a short `pickRationale` to explain
why it matters. Picks appear on the home page, in sidebars, and on the dedicated
`/picks` page, grouped by source.

## MDX components

Inside a post body you can use plain Markdown plus a few components:

- `<Callout>…</Callout>` — a highlighted editor's note.
- `<AdInArticle />` — an extra in-article ad slot (one is inserted
  automatically after the opening paragraphs).
- `<NewsletterSignup />` — the newsletter form.

## Search index

`public/search-index.json` is regenerated automatically before `dev` and
`build` (see `scripts/build-search-index.mjs`). Run it manually with
`pnpm search-index` if needed.
