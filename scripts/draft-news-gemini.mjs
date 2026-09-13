// Scheduled AI-news drafting with Google Gemini (free tier) — no Anthropic key.
//
// Pulls recent items from AI-news RSS feeds, skips anything already covered,
// and asks Gemini (with Google Search grounding when available) to write an
// original short analysis for the top few. Writes MDX into content/posts/ for
// review; never publishes on its own. Requires GEMINI_API_KEY.
//
// Tunable via env: DRAFT_COUNT, GEMINI_MODEL, NEWS_FEEDS, LOOKBACK_HOURS.

import fs from "node:fs";
import path from "node:path";
import Parser from "rss-parser";
import matter from "gray-matter";

const ROOT = process.cwd();
const POSTS_DIR = path.join(ROOT, "content", "posts");
const LEDGER = path.join(ROOT, "content", ".news-seen.json");

const CATEGORIES = [
  "models", "products", "companies", "research",
  "policy", "opinion", "events", "enterprise",
];

const API_KEY = process.env.GEMINI_API_KEY;
const MODEL_PREF = process.env.GEMINI_MODEL || "gemini-2.0-flash";
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
).split(",").map((s) => s.trim()).filter(Boolean);

const AUTHOR = "Cambrian AI Desk";
const BASE = "https://generativelanguage.googleapis.com/v1beta";

const log = (...a) => console.log("[draft-news-gemini]", ...a);

function slugify(t) {
  return String(t).toLowerCase().replace(/['"’]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 70).replace(/-+$/g, "");
}
const titleKey = (t) => String(t).toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

function readLedger() {
  try { const a = JSON.parse(fs.readFileSync(LEDGER, "utf8")); return Array.isArray(a) ? a : []; }
  catch { return []; }
}
function writeLedger(urls) {
  fs.writeFileSync(LEDGER, JSON.stringify(urls.slice(-500), null, 2) + "\n");
}
function existingCoverage() {
  const sources = new Set(), titles = new Set();
  if (!fs.existsSync(POSTS_DIR)) return { sources, titles };
  for (const f of fs.readdirSync(POSTS_DIR)) {
    if (!/\.mdx?$/.test(f) || f.startsWith("_")) continue;
    try {
      const { data } = matter(fs.readFileSync(path.join(POSTS_DIR, f), "utf8"));
      if (data.source) sources.add(String(data.source));
      if (data.title) titles.add(titleKey(data.title));
    } catch { /* ignore */ }
  }
  return { sources, titles };
}
function existingSlugs() {
  const s = new Set();
  if (fs.existsSync(POSTS_DIR))
    for (const f of fs.readdirSync(POSTS_DIR)) if (/\.mdx?$/.test(f)) s.add(f.replace(/\.mdx?$/, ""));
  return s;
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
        const ts = new Date(it.isoDate || it.pubDate || 0).getTime();
        if (Number.isFinite(ts) && ts && ts < cutoff) continue;
        if (!it.link || !it.title) continue;
        items.push({
          title: it.title.trim(), link: it.link.trim(), source,
          snippet: (it.contentSnippet || it.content || "").slice(0, 800),
          ts: Number.isFinite(ts) ? ts : 0,
        });
      }
      log(`feed ok: ${url} (${feed.items?.length ?? 0})`);
    } catch (e) { log(`feed FAILED: ${url} — ${e?.message || e}`); }
  }
  items.sort((a, b) => b.ts - a.ts);
  return items;
}

const SYSTEM = `You are a staff writer for "Cambrian AI", an AI-news publication with a clean, analytical, Verge-meets-WSJ voice.

You are given a source news item (headline, publication, link, snippet). Use Google Search grounding when available to verify and enrich the facts, then write an ORIGINAL short news-analysis in the publication's voice.

Hard rules:
- Original prose only. Never copy sentences from the source.
- Only state facts, figures, names and quotes that are supported by reliable reporting. Do NOT invent quotes, statistics, dates or events. If unsure, stay general.
- 350–600 words. Tight and substantive.
- End the body with an attribution line exactly like: *Source: [PUBLICATION](URL)*
- Neutral, informed tone. No hype, no first person.

Output ONLY a complete MDX file: a YAML frontmatter block delimited by --- lines, then the Markdown body. No code fences, no commentary.

Frontmatter fields:
- title: an original sharp headline (do NOT copy the source headline verbatim)
- subtitle: one-sentence dek
- category: EXACTLY one of [models, products, companies, research, policy, opinion, events, enterprise]
- tags: array of 3–5 short lowercase topic tags
- excerpt: one plain sentence, <=160 chars`;

function userPrompt(item) {
  return `Source item:
- Headline: ${item.title}
- Publication: ${item.source}
- URL: ${item.link}
- Snippet: ${item.snippet || "(none)"}

Write the MDX article now. Original wording; only well-supported facts; 350–600 words; end with *Source: [${item.source}](${item.link})*.`;
}

let RESOLVED_MODEL = null;
async function resolveModel() {
  if (RESOLVED_MODEL) return RESOLVED_MODEL;
  // Trust the preferred model first; only list models if it fails at call time.
  RESOLVED_MODEL = MODEL_PREF;
  return RESOLVED_MODEL;
}
async function listFlashModel() {
  const res = await fetch(`${BASE}/models?key=${API_KEY}`);
  if (!res.ok) throw new Error(`ListModels ${res.status}`);
  const data = await res.json();
  const usable = (data.models || []).filter((m) =>
    (m.supportedGenerationMethods || []).includes("generateContent"));
  const flash = usable.find((m) => /flash/i.test(m.name) && !/(vision|embedding|image|tts|live)/i.test(m.name));
  const pick = (flash || usable[0]);
  if (!pick) throw new Error("no generateContent-capable model available");
  return pick.name.replace(/^models\//, "");
}

async function callGemini(model, system, user, withSearch) {
  const body = {
    systemInstruction: { parts: [{ text: system }] },
    contents: [{ role: "user", parts: [{ text: user }] }],
    generationConfig: { temperature: 0.7, maxOutputTokens: 4096 },
  };
  if (withSearch) body.tools = [{ google_search: {} }];
  const res = await fetch(`${BASE}/models/${model}:generateContent?key=${API_KEY}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  return { ok: res.ok, status: res.status, text };
}

function extractGeminiText(raw) {
  let data;
  try { data = JSON.parse(raw); } catch { return ""; }
  const parts = data?.candidates?.[0]?.content?.parts || [];
  return parts.map((p) => p.text || "").join("").trim();
}

async function draftArticle(item) {
  let model = await resolveModel();
  let attempt = await callGemini(model, SYSTEM, userPrompt(item), true);

  // Model not found → discover a usable flash model and retry.
  if (!attempt.ok && (attempt.status === 404 || /not found|not supported/i.test(attempt.text))) {
    model = await listFlashModel();
    RESOLVED_MODEL = model;
    log(`falling back to model: ${model}`);
    attempt = await callGemini(model, SYSTEM, userPrompt(item), true);
  }
  // Search tool rejected → retry without it.
  if (!attempt.ok && /google_search|tool|function/i.test(attempt.text)) {
    log("google_search grounding unavailable; retrying without it");
    attempt = await callGemini(model, SYSTEM, userPrompt(item), false);
  }
  if (!attempt.ok) throw new Error(`Gemini ${attempt.status}: ${attempt.text.slice(0, 300)}`);

  const text = extractGeminiText(attempt.text);
  if (!text) throw new Error("empty response");
  return text;
}

function extractMdx(text) {
  let t = text.trim();
  const fence = t.match(/^```(?:mdx|markdown|md)?\s*\n([\s\S]*?)\n```$/);
  if (fence) t = fence[1].trim();
  const i = t.indexOf("---");
  if (i > 0) t = t.slice(i);
  return t.trim();
}

function normalize(mdx, item, slugsInUse) {
  const parsed = matter(mdx);
  const fm = parsed.data || {};
  const today = new Date().toISOString().slice(0, 10);

  let category = String(fm.category || "").toLowerCase();
  if (!CATEGORIES.includes(category)) category = "companies";

  const title = String(fm.title || item.title).trim();
  let base = slugify(title) || "ai-news", slug = base, n = 2;
  while (slugsInUse.has(slug)) slug = `${base}-${n++}`;
  slugsInUse.add(slug);

  const tags = Array.isArray(fm.tags) && fm.tags.length ? fm.tags.slice(0, 5) : ["ai"];
  const front = {
    title,
    subtitle: fm.subtitle ? String(fm.subtitle) : undefined,
    date: today, author: AUTHOR, category, tags,
    excerpt: fm.excerpt ? String(fm.excerpt).slice(0, 160) : undefined,
    featured: false, source: item.link,
  };
  let body = parsed.content.trim();
  if (!/\*Source:/i.test(body)) body += `\n\n*Source: [${item.source}](${item.link})*`;
  return { slug, front, body };
}

function toYaml(front) {
  const lines = ["---"];
  for (const [k, v] of Object.entries(front)) {
    if (v === undefined) continue;
    if (Array.isArray(v)) lines.push(`${k}: [${v.map((x) => JSON.stringify(String(x))).join(", ")}]`);
    else if (typeof v === "boolean") lines.push(`${k}: ${v}`);
    else lines.push(`${k}: ${JSON.stringify(String(v))}`);
  }
  lines.push("---", "");
  return lines.join("\n");
}

async function main() {
  if (!API_KEY) {
    console.error("::error::GEMINI_API_KEY is not set. Add it as a repository secret (Settings → Secrets and variables → Actions). Get a free key at https://aistudio.google.com/apikey");
    process.exit(1);
  }
  fs.mkdirSync(POSTS_DIR, { recursive: true });

  const items = await gatherItems();
  log(`gathered ${items.length} recent items`);

  const ledgerSet = new Set(readLedger());
  const { sources, titles } = existingCoverage();
  const slugsInUse = existingSlugs();

  const chosen = [];
  const seen = new Set();
  for (const it of items) {
    if (chosen.length >= MAX_DRAFTS) break;
    const tk = titleKey(it.title);
    if (ledgerSet.has(it.link) || sources.has(it.link) || titles.has(tk) || seen.has(tk)) continue;
    seen.add(tk);
    chosen.push(it);
  }
  if (chosen.length === 0) { log("no new stories to draft."); return; }

  const created = [];
  for (const item of chosen) {
    try {
      log(`drafting: ${item.title}`);
      const mdx = extractMdx(await draftArticle(item));
      const { slug, front, body } = normalize(mdx, item, slugsInUse);
      fs.writeFileSync(path.join(POSTS_DIR, `${slug}.mdx`), toYaml(front) + body + "\n");
      created.push({ slug, title: front.title });
      log(`wrote content/posts/${slug}.mdx`);
    } catch (e) {
      log(`skipped "${item.title}" — ${e?.message || e}`);
    }
    ledgerSet.add(item.link);
  }
  writeLedger([...ledgerSet]);
  log(`created ${created.length} draft(s).`);
  if (created.length === 0) log("no drafts created (see errors above).");
}

main().catch((e) => { console.error("::error::draft-news-gemini failed:", e?.stack || e); process.exit(1); });
