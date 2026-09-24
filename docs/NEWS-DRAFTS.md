# Automated news drafts (with human review)

Bayaan AI drafts fresh news articles on a schedule and opens them as a
**Pull Request for you to review**. Nothing is ever published automatically —
you approve each batch by merging (or discard it by closing) the PR.

The **daily** path uses a **free-tier LLM** so it needs no paid Anthropic key.
It supports two free providers and picks one automatically:

- **Groq (recommended)** — used when `GROQ_API_KEY` is set. Generous free tier,
  very reliable for unattended automation.
- **Google Gemini** — used when only `GEMINI_API_KEY` is set. Free tier, but its
  per-project quota can be restrictive (a brand-new key with no allocated free
  quota returns `RESOURCE_EXHAUSTED` on every call — if that happens, use Groq).

(Two other paths exist as fallbacks — see the bottom.)

## Daily path (recommended)

**Workflow:** `.github/workflows/news-daily.yml` → `scripts/draft-news-gemini.mjs`

Each day it:
1. Pulls recent items from several news RSS feeds and skips anything already
   covered (existing posts' `source:` frontmatter, their titles, and the URLs in
   `content/.news-seen.json`).
2. Asks the chosen model (Gemini adds Google Search grounding when available) to
   write an original ~350–600 word analysis for the top few, citing the source.
3. Pushes the drafts on a `news/auto-<date>-<run>` branch and opens a review PR
   titled **"AI news drafts for review — <date>"**.
4. **You review the PR** → **merge** to publish (the build workflow rebuilds the
   site — each post gets a hero image + search entry — and Vercel redeploys) or
   **close** to discard. Add `draft: true` to any file to hold just that one.

### One-time setup (two steps)

1. **A free LLM key** — either is fine; Groq is used first if both are present:
   - **Groq (recommended):** get a key at <https://console.groq.com/keys>, add it
     as the repository secret **`GROQ_API_KEY`**.
   - **Gemini:** get a key at <https://aistudio.google.com/apikey> (create it in a
     *new* project, not one linked to Cloud Billing, or the free tier may be
     disabled), add it as **`GEMINI_API_KEY`**.

   Add secrets under **Settings → Secrets and variables → Actions → New
   repository secret**.
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
- **Cost: $0** on either provider's free tier (subject to their rate limits).

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
| `GROQ_MODEL` | `llama-3.3-70b-versatile` | Groq model id (auto-falls back to an available chat model) |
| `GEMINI_MODEL` | `gemini-3.6-flash` | Gemini model id (auto-falls back to an available flash model) |
| `LOOKBACK_HOURS` | `36` | Only consider items newer than this |
| `AI_FEEDS` | (built-in list) | Comma-separated AI RSS feeds |
| `WORLD_FEEDS` | (built-in list) | Comma-separated non-AI RSS feeds |

Provider is chosen automatically: **Groq** if `GROQ_API_KEY` is set, else
**Gemini**. Run locally: `GROQ_API_KEY=... pnpm draft-news-gemini` (or
`GEMINI_API_KEY=...`), then `CAMBRIAN_INCLUDE_DRAFTS=1 pnpm dev` to preview.

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
