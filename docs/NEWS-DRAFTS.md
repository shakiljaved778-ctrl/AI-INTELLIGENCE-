# Automated news drafts (with human review)

Cambrian AI drafts fresh AI-news articles on a schedule and opens them as a
**Pull Request for you to review**. Nothing is ever published automatically —
you approve each batch by merging (or discard it by closing) the PR.

The **daily** path uses **Google Gemini (free tier)** so it needs no paid
Anthropic API key. (Two other paths exist as fallbacks — see the bottom.)

## Daily path — Gemini (recommended)

**Workflow:** `.github/workflows/news-daily.yml` → `scripts/draft-news-gemini.mjs`

Each day it:
1. Pulls recent items from several AI-news RSS feeds and skips anything already
   covered (existing posts' `source:` frontmatter, their titles, and the URLs in
   `content/.news-seen.json`).
2. Asks **Gemini** (with Google Search grounding when available) to write an
   original ~350–600 word analysis for the top few, citing the source.
3. Pushes the drafts on a `news/auto-<date>-<run>` branch and opens a review PR
   titled **"AI news drafts for review — <date>"**.
4. **You review the PR** → **merge** to publish (the build workflow rebuilds the
   site — each post gets a hero image + search entry — and Vercel redeploys) or
   **close** to discard. Add `draft: true` to any file to hold just that one.

### One-time setup (two steps)

1. **Free Gemini key** → get one at <https://aistudio.google.com/apikey>. In the
   repo: **Settings → Secrets and variables → Actions → New repository secret**,
   name it exactly **`GEMINI_API_KEY`**.
2. **Let Actions open PRs** → **Settings → Actions → General → Workflow
   permissions** → check **"Allow GitHub Actions to create and approve pull
   requests"** → Save.

Until both are done, the run fails with a clear message and publishes nothing.

### Try it now
**Actions → "Daily AI news drafts (Gemini)" → Run workflow.** A review PR should
appear under **Pull requests** within a minute or two.

### Schedule / cost
- Runs daily at **13:00 UTC (8:00 AM US Eastern, EST**; 9:00 AM during EDT — cron
  can't follow daylight saving). Change the `cron` in `news-daily.yml` to adjust;
  use `0 12 * * *` to prefer 8 AM during summer.
- **Cost: $0** on Gemini's free tier (subject to Google's free-tier rate limits).

### Content mix & editorial rules
The writer targets roughly **65% AI** and **35% "Beyond"** (non-AI: technology,
finance, sports, entertainment, lifestyle) each batch, drawing from two feed
sets. **Politics is kept tiny (~1%)** — there's no politics feed, so it only
appears if a general feed surfaces something. Two hard rules are enforced in
code and in the model prompt: coverage is **strictly non-partisan**, and there
is **no coverage of the Middle East or any active geopolitical conflict/war**
(such items are filtered out by keyword and the model is told to skip them).

### Tuning (`scripts/draft-news-gemini.mjs`)
| Env var | Default | Meaning |
|---|---|---|
| `DRAFT_COUNT` | `3` | Drafts per run |
| `AI_RATIO` | `0.65` | Share of each batch that is AI (rest is Beyond) |
| `GEMINI_MODEL` | `gemini-2.0-flash` | Model id (auto-falls back to an available flash model) |
| `LOOKBACK_HOURS` | `36` | Only consider items newer than this |
| `AI_FEEDS` | (built-in list) | Comma-separated AI RSS feeds |
| `WORLD_FEEDS` | (built-in list) | Comma-separated non-AI RSS feeds |

Run locally: `GEMINI_API_KEY=... pnpm draft-news-gemini` (then
`CAMBRIAN_INCLUDE_DRAFTS=1 pnpm dev` to preview drafts).

## Article photos (Pexels)
Post heroes use a real, topic-matched photo from **Pexels** when available,
falling back to the generated color-coded SVG otherwise. To enable:

1. Get a free key at <https://www.pexels.com/api/>.
2. Add it as the repository secret **`PEXELS_API_KEY`** (Settings → Secrets and
   variables → Actions).

On the next build, `scripts/fetch-photos.mjs` fetches a landscape photo for each
post that lacks one, saves it to `public/photos/<slug>.jpg`, records attribution
in `content/.photo-manifest.json`, and the build commits both so they persist —
only *new* posts are fetched on later builds. A photographer credit is shown
under each article's hero. To override a single post, set `image:` in its
frontmatter. Run locally with `PEXELS_API_KEY=... pnpm photos`.

## Drafts and the `draft:` flag
A post with `draft: true` in its frontmatter is excluded from the built/live
site, the search index, and hero generation. Use it to hold a story back;
remove it to let the next build publish it.

## Fallback paths
- **Anthropic API (manual):** `.github/workflows/draft-news.yml` +
  `scripts/draft-news.mjs`. Manual-run only; needs `ANTHROPIC_API_KEY`. Kept as a
  fallback; the daily schedule uses Gemini instead.
- **Auto-PR on branch push:** `.github/workflows/auto-pr.yml` opens a review PR
  whenever a `news/**` branch is pushed by a person (also needs the "Allow
  Actions to create PRs" setting above).
- **On-demand:** just ask Claude Code to add today's AI news; it drafts and opens
  a PR the same way.
