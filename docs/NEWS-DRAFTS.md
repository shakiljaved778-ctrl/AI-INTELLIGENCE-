# Automated news drafts (with human review)

Cambrian AI can draft fresh AI-news articles on a schedule and open them as a
**Pull Request for you to review**. Nothing is ever published automatically —
you approve each batch by merging (or discard it by closing) the PR.

## How it works

1. **Daily**, a GitHub Action (`.github/workflows/draft-news.yml`) runs
   `scripts/draft-news.mjs`.
2. The script pulls recent items from several AI-news RSS feeds, skips anything
   already covered, and asks **Claude** to write an original short analysis for
   the top few — grounding itself on the real article (via the `web_fetch`
   tool) and citing the source.
3. The drafts are written to `content/posts/*.mdx` and pushed to a new branch,
   and a **Pull Request** titled "AI news drafts for review — <date>" is opened.
4. **You review the PR.**
   - **Merge it** → the drafts land on `main`, the build workflow rebuilds the
     site (each post gets a generated hero image + search entry), and Vercel
     redeploys. Now they're live.
   - **Close it** → the drafts are discarded, nothing is published.
   - **Edit before merging** → change wording, categories, tags, or headlines
     right in the PR. To hold back just one story in a batch, add
     `draft: true` to its frontmatter (drafts are excluded from the live site).

So the loop is: *drafted for you → you approve → it publishes.* A human is
always in the loop.

## One-time setup: add your Anthropic API key

The drafting step calls the Claude API, so it needs an API key stored as a
repository secret:

1. Get a key at <https://console.anthropic.com/> (Settings → API Keys).
2. In the GitHub repo: **Settings → Secrets and variables → Actions → New
   repository secret**.
3. Name it exactly `ANTHROPIC_API_KEY` and paste the key.

Until this secret is set, the scheduled run fails with a clear message (it does
not publish anything).

## Try it now (without waiting for the schedule)

In the repo: **Actions → "Draft AI news for review" → Run workflow**. You can
set how many drafts to generate. When it finishes, check **Pull requests** for
the review PR.

## Cost

Each run drafts a few short articles. By default it uses `claude-opus-5`. A
typical run costs cents. To use a cheaper model, set the workflow input
`model` (e.g. `claude-sonnet-5`) when running manually, or change the
`DRAFT_MODEL` default in the workflow.

## Tuning

Environment variables read by `scripts/draft-news.mjs`:

| Variable | Default | Meaning |
|---|---|---|
| `DRAFT_COUNT` | `3` | How many drafts per run |
| `DRAFT_MODEL` | `claude-opus-5` | Claude model id |
| `LOOKBACK_HOURS` | `36` | Only consider items newer than this |
| `NEWS_FEEDS` | (built-in list) | Comma-separated RSS feed URLs |

The list of stories already seen is tracked in `content/.news-seen.json` so the
same story isn't drafted twice.

## Run locally

```bash
export ANTHROPIC_API_KEY=sk-ant-...
pnpm draft-news          # writes drafts into content/posts/
CAMBRIAN_INCLUDE_DRAFTS=1 pnpm dev   # preview drafts locally
```
