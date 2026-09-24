// Scheduled AI-news drafting.
//
// Pulls recent items from a set of AI-news RSS feeds, skips anything already
// covered (by a persisted "seen" ledger and by existing posts), and asks Claude
// to write an original short analysis for the top few — grounded on the real
// article via the web_fetch server tool and clearly attributed to its source.
// The drafts are written as MDX into content/posts/ so a human can review them
// (the workflow opens a Pull Request) before anything goes live.
//
// It never publishes on its own: this script only writes files. Requires
// ANTHROPIC_API_KEY. Tunable via env: DRAFT_COUNT, DRAFT_MODEL, NEWS_FEEDS
// (comma-separated), LOOKBACK_HOURS.

import fs from "node:fs";
import path from "node:path";
import Anthropic from "@anthropic-ai/sdk";
import Parser from "rss-parser";
import matter from "gray-matter";

const ROOT = process.cwd();
const POSTS_DIR = path.join(ROOT, "content", "posts");
const LEDGER = path.join(ROOT, "content", ".news-seen.json");

// Mirror of lib/categories.ts (kept in sync manually — this script can't import
// the TypeScript module). Only the slugs matter here.
const CATEGORIES = [
  "models",
  "products",
  "companies",
  "research",
  "policy",
  "opinion",
  "events",
  "enterprise",
  "learning",
];

const MODEL = process.env.DRAFT_MODEL || "claude-opus-5";
const MAX_DRAFTS = Math.max(1, Number(process.env.DRAFT_COUNT) || 3);
const LOOKBACK_HOURS = Math.max(6, Number(process.env.LOOKBACK_HOURS) || 36);
const FEEDS = (
  process.env.NEWS_FEEDS ||
  [
    "https://techcrunch.com/category/artificial-intelligence/feed/",
    "https://www.theverge.com/rss/ai-artificial-intelligence/index.xml",
    "https://venturebeat.com/category/ai/feed/",
    "https://arstechnica.com/ai/feed/",
    "https://www.wired.com/feed/tag/ai/latest/rss",
  ].join(",")
)
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

const AUTHOR = "Bayaan AI Desk";

function log(...args) {
  console.log("[draft-news]", ...args);
}

function slugify(text) {
  return String(text)
    .toLowerCase()
    .replace(/['"’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 70)
    .replace(/-+$/g, "");
}

/** Loose title key for dedupe: lowercased alphanumerics only. */
function titleKey(text) {
  return String(text)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function readLedger() {
  try {
    const arr = JSON.parse(fs.readFileSync(LEDGER, "utf8"));
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function writeLedger(urls) {
  // Keep the ledger bounded so it doesn't grow forever.
  const trimmed = urls.slice(-500);
  fs.writeFileSync(LEDGER, JSON.stringify(trimmed, null, 2) + "\n");
}

/** Existing posts' source URLs and title keys, to avoid re-covering a story. */
function existingCoverage() {
  const sources = new Set();
  const titles = new Set();
  if (!fs.existsSync(POSTS_DIR)) return { sources, titles };
  for (const file of fs.readdirSync(POSTS_DIR)) {
    if (!/\.mdx?$/.test(file) || file.startsWith("_")) continue;
    try {
      const { data } = matter(fs.readFileSync(path.join(POSTS_DIR, file), "utf8"));
      if (data.source) sources.add(String(data.source));
      if (data.title) titles.add(titleKey(data.title));
    } catch {
      /* ignore unparsable files */
    }
  }
  return { sources, titles };
}

function existingSlugs() {
  const set = new Set();
  if (!fs.existsSync(POSTS_DIR)) return set;
  for (const file of fs.readdirSync(POSTS_DIR)) {
    if (/\.mdx?$/.test(file)) set.add(file.replace(/\.mdx?$/, ""));
  }
  return set;
}

async function gatherItems() {
  const parser = new Parser({ timeout: 20000 });
  const cutoff = Date.now() - LOOKBACK_HOURS * 3600 * 1000;
  const items = [];
  for (const url of FEEDS) {
    try {
      const feed = await parser.parseURL(url);
      const source = feed.title || new URL(url).hostname;
      for (const it of feed.items || []) {
        const when = it.isoDate || it.pubDate;
        const ts = when ? new Date(when).getTime() : NaN;
        if (Number.isFinite(ts) && ts < cutoff) continue;
        if (!it.link || !it.title) continue;
        items.push({
          title: it.title.trim(),
          link: it.link.trim(),
          source,
          snippet: (it.contentSnippet || it.content || "").slice(0, 800),
          ts: Number.isFinite(ts) ? ts : 0,
        });
      }
      log(`feed ok: ${url} (${feed.items?.length ?? 0} items)`);
    } catch (err) {
      log(`feed FAILED: ${url} — ${err?.message || err}`);
    }
  }
  // Newest first.
  items.sort((a, b) => b.ts - a.ts);
  return items;
}

const SYSTEM = `You are a staff writer for "Bayaan AI", a news publication with a clean, analytical, Verge-meets-WSJ voice. You write concise, original news-analysis pieces about artificial intelligence.

You will be given a source news item (headline, publication, link, and a short snippet) and the web_fetch tool. Fetch the source article to ground yourself in the facts, then write an ORIGINAL short analysis in the publication's voice.

Hard rules:
- Write original prose. Do NOT copy sentences from the source. Summarize and add context/analysis in your own words.
- Only state facts, figures, names, and quotes that are supported by the source article. Do NOT invent quotes, statistics, dates, or events. If unsure, stay general.
- 350–600 words. Tight and substantive — no filler.
- End the body with an attribution line exactly like: \`*Source: [PUBLICATION](URL)*\`
- Neutral, informed tone. No hype, no first person, no "in conclusion".

Output ONLY a complete MDX file: a YAML frontmatter block delimited by --- lines, then the Markdown body. No code fences, no commentary before or after.

Frontmatter fields to produce:
- title: a sharp, original headline (do not copy the source headline verbatim)
- subtitle: one-sentence dek
- category: EXACTLY one of [models, products, companies, research, policy, opinion, events, enterprise]
- tags: an array of 3–5 short lowercase topic tags
- excerpt: one plain-sentence summary (<=160 chars)

Use "## " subheadings if it helps structure. Body is Markdown (may use standard MDX).`;

function buildUserPrompt(item) {
  return `Source item to cover:
- Headline: ${item.title}
- Publication: ${item.source}
- URL: ${item.link}
- Snippet: ${item.snippet || "(none)"}

Fetch the URL for grounding, then write the MDX article. Remember: original wording, only source-supported facts, 350–600 words, end with the *Source: [${item.source}](${item.link})* line.`;
}

/** Call Claude; fall back to no tools if web_fetch isn't available on the org. */
async function draftArticle(client, item) {
  const host = (() => {
    try {
      return new URL(item.link).hostname;
    } catch {
      return null;
    }
  })();

  const base = {
    model: MODEL,
    max_tokens: 8000,
    system: SYSTEM,
  };
  const tools = host
    ? [{ type: "web_fetch_20260209", name: "web_fetch", max_uses: 2, allowed_domains: [host] }]
    : undefined;

  async function run(withTools) {
    const messages = [{ role: "user", content: buildUserPrompt(item) }];
    let resp;
    for (let i = 0; i < 5; i++) {
      resp = await client.messages.create({
        ...base,
        ...(withTools && tools ? { tools } : {}),
        messages,
      });
      if (resp.stop_reason === "pause_turn") {
        messages.push({ role: "assistant", content: resp.content });
        continue;
      }
      break;
    }
    return resp;
  }

  let resp;
  try {
    resp = await run(Boolean(tools));
  } catch (err) {
    if (err instanceof Anthropic.BadRequestError && tools) {
      log(`web_fetch unavailable, retrying without tools — ${err.message}`);
      resp = await run(false);
    } else {
      throw err;
    }
  }

  if (resp.stop_reason === "refusal") {
    throw new Error(`model refused: ${resp.stop_details?.explanation || "no detail"}`);
  }

  const text = resp.content
    .filter((b) => b.type === "text")
    .map((b) => b.text)
    .join("\n")
    .trim();
  return text;
}

/** Pull the MDX out of the model response, tolerating stray fences/prose. */
function extractMdx(text) {
  let t = text.trim();
  // Strip a wrapping code fence if present.
  const fence = t.match(/^```(?:mdx|markdown|md)?\s*\n([\s\S]*?)\n```$/);
  if (fence) t = fence[1].trim();
  // Start at the first frontmatter delimiter.
  const idx = t.indexOf("---");
  if (idx > 0) t = t.slice(idx);
  return t.trim();
}

function normalizeFrontmatter(mdx, item, slugsInUse) {
  const parsed = matter(mdx);
  const fm = parsed.data || {};
  const today = new Date().toISOString().slice(0, 10);

  let category = String(fm.category || "").toLowerCase();
  if (!CATEGORIES.includes(category) || category === "learning") category = "companies";

  const title = String(fm.title || item.title).trim();

  let base = slugify(title) || slugify(item.title) || "ai-news";
  let slug = base;
  let n = 2;
  while (slugsInUse.has(slug)) slug = `${base}-${n++}`;
  slugsInUse.add(slug);

  const tags = Array.isArray(fm.tags) && fm.tags.length ? fm.tags.slice(0, 5) : ["ai"];

  const front = {
    title,
    subtitle: fm.subtitle ? String(fm.subtitle) : undefined,
    date: today,
    author: AUTHOR,
    category,
    tags,
    excerpt: fm.excerpt ? String(fm.excerpt).slice(0, 160) : undefined,
    featured: false,
    source: item.link,
  };

  let body = parsed.content.trim();
  if (!/\*Source:/i.test(body)) {
    body += `\n\n*Source: [${item.source}](${item.link})*`;
  }

  return { slug, front, body };
}

function toYaml(front) {
  const lines = ["---"];
  for (const [k, v] of Object.entries(front)) {
    if (v === undefined) continue;
    if (Array.isArray(v)) {
      lines.push(`${k}: [${v.map((x) => JSON.stringify(String(x))).join(", ")}]`);
    } else if (typeof v === "boolean") {
      lines.push(`${k}: ${v}`);
    } else {
      lines.push(`${k}: ${JSON.stringify(String(v))}`);
    }
  }
  lines.push("---", "");
  return lines.join("\n");
}

function stepSummary(lines) {
  const file = process.env.GITHUB_STEP_SUMMARY;
  if (file) {
    try {
      fs.appendFileSync(file, lines.join("\n") + "\n");
    } catch {
      /* ignore */
    }
  }
}

async function main() {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error(
      "::error::ANTHROPIC_API_KEY is not set. Add it as a repository secret " +
        "(Settings → Secrets and variables → Actions) to enable news drafting."
    );
    process.exit(1);
  }

  fs.mkdirSync(POSTS_DIR, { recursive: true });
  const client = new Anthropic();

  const items = await gatherItems();
  log(`gathered ${items.length} recent items from ${FEEDS.length} feeds`);

  const ledger = readLedger();
  const ledgerSet = new Set(ledger);
  const { sources, titles } = existingCoverage();
  const slugsInUse = existingSlugs();

  // Choose new, non-duplicate items.
  const chosen = [];
  const seenTitleKeys = new Set();
  for (const it of items) {
    if (chosen.length >= MAX_DRAFTS) break;
    const tk = titleKey(it.title);
    if (ledgerSet.has(it.link) || sources.has(it.link)) continue;
    if (titles.has(tk) || seenTitleKeys.has(tk)) continue;
    seenTitleKeys.add(tk);
    chosen.push(it);
  }

  if (chosen.length === 0) {
    log("no new stories to draft.");
    stepSummary(["### AI news drafts", "", "No new stories found in this run."]);
    return;
  }

  const created = [];
  for (const item of chosen) {
    try {
      log(`drafting: ${item.title}`);
      const text = await draftArticle(client, item);
      if (!text) throw new Error("empty response");
      const mdx = extractMdx(text);
      const { slug, front, body } = normalizeFrontmatter(mdx, item, slugsInUse);
      const file = path.join(POSTS_DIR, `${slug}.mdx`);
      fs.writeFileSync(file, toYaml(front) + body + "\n");
      created.push({ slug, title: front.title, source: item.source, url: item.link });
      log(`wrote content/posts/${slug}.mdx`);
    } catch (err) {
      log(`skipped "${item.title}" — ${err?.message || err}`);
    }
    // Mark as seen whether or not it succeeded, so a persistently failing item
    // doesn't block the queue on every run.
    ledgerSet.add(item.link);
  }

  writeLedger([...ledgerSet]);

  if (created.length === 0) {
    stepSummary(["### AI news drafts", "", "Attempted drafts but none succeeded — see logs."]);
    log("no drafts created.");
    return;
  }

  const summary = [
    `### AI news drafts (${created.length})`,
    "",
    "These were drafted from recent AI news and are awaiting your review:",
    "",
    ...created.map((c) => `- **${c.title}** — from [${c.source}](${c.url}) → \`content/posts/${c.slug}.mdx\``),
    "",
    "Merge the PR to publish; close it to discard. Add `draft: true` to any file to hold just that one.",
  ];
  stepSummary(summary);
  // Also write the summary to a file the workflow can use as the PR body.
  if (process.env.DRAFT_SUMMARY_FILE) {
    try {
      fs.writeFileSync(process.env.DRAFT_SUMMARY_FILE, summary.join("\n") + "\n");
    } catch {
      /* ignore */
    }
  }
  console.log("\n" + summary.join("\n"));
  log(`created ${created.length} draft(s).`);
}

main().catch((err) => {
  console.error("::error::draft-news failed:", err?.stack || err);
  process.exit(1);
});
