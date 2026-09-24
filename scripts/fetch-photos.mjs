// Build-time photo fetcher (Pexels).
//
// For each published post that doesn't declare its own `image`, fetch a
// topic-relevant landscape photo from Pexels and save it to public/photos/<slug>.jpg,
// recording attribution in content/.photo-manifest.json. Posts then prefer the
// photo over the generated SVG hero (see lib/posts.ts). Photos are committed so
// they persist — only posts without a photo are fetched on later runs.
//
// Requires PEXELS_API_KEY. Without it (or on any error) the script skips
// gracefully and the generated SVG heroes are used instead. Free key:
// https://www.pexels.com/api/
//
// Runs as part of `pnpm run assets` (predev / prebuild).

import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const ROOT = process.cwd();
const POSTS_DIR = path.join(ROOT, "content", "posts");
const PHOTOS_DIR = path.join(ROOT, "public", "photos");
const MANIFEST = path.join(ROOT, "content", ".photo-manifest.json");
const API_KEY = process.env.PEXELS_API_KEY;

const log = (...a) => console.log("[fetch-photos]", ...a);

/** Search seed per section — safe, on-topic base queries. */
const SEED = {
  models: "artificial intelligence technology",
  products: "software technology screen",
  companies: "technology office building",
  research: "science laboratory",
  policy: "government building law",
  opinion: "abstract technology",
  events: "conference stage audience",
  enterprise: "corporate business office",
  learning: "abstract technology network",
  technology: "technology gadget device",
  finance: "stock market finance chart",
  sports: "stadium sport athlete",
  entertainment: "cinema stage concert",
  lifestyle: "wellness lifestyle nature",
  politics: "government capitol building", // neutral; never conflict imagery
};

// Safe topical keywords to sharpen the query. Politics deliberately excluded
// (kept to the neutral seed) to avoid conflict/protest imagery.
const SAFE_KEYWORDS = [
  "football", "soccer", "tennis", "cricket", "basketball", "baseball",
  "formula 1", "racing", "olympics", "marathon", "stadium",
  "box office", "cinema", "film", "streaming", "concert", "music", "album", "awards",
  "mortgage", "housing", "market", "stocks", "ipo", "earnings", "economy", "bank",
  "smartphone", "iphone", "apple", "foldable", "chip", "semiconductor",
  "spacex", "rocket", "satellite", "space", "cybersecurity", "data center", "cloud",
  "travel", "wellness", "fitness", "food", "nutrition", "protein",
  "robot", "chip", "gpu", "server", "coding", "startup", "venture",
];

// Hand-authored, concrete queries per slug (photograph-friendly subjects).
// Overridden slugs always re-fetch and pick from the top few results, so the
// image is on-topic. New posts fall back to buildQuery().
const QUERY_OVERRIDES = {
  // companies
  "ai-chip-funding-inference": "silicon computer chip",
  "ai-model-fatigue-launch-week": "server room data center",
  "ai-price-war": "stock market chart falling",
  "chinese-ai-labs-race": "shanghai skyline night",
  "chinese-models-dominate-openrouter": "shanghai city skyline",
  "mistral-3b-sovereign-ai": "eiffel tower paris",
  "openai-huggingface-incident": "code error screen",
  "openai-raises-frontier-prices": "dollar money finance",
  // enterprise
  "enterprise-ai-roi-gap": "business charts meeting",
  "jpmorgan-agentic-ai": "wall street skyscraper bank",
  "klarna-ai-customer-service": "call center headset",
  "walmart-ai-operations": "warehouse logistics",
  // entertainment
  "awards-season-nominations-2026": "concert stage lights",
  "box-office-record-summer-2026": "movie theater seats",
  "emmys-2026-preview": "red carpet awards",
  "fall-tv-premieres-2026": "television living room",
  // events
  "ai-summer-safety-reckoning": "conference audience hall",
  "fall-ai-conference-preview": "tech conference stage",
  "september-launch-week-recap": "product launch stage",
  // finance
  "easy-mortgage-loans-risk-2026": "house keys real estate",
  "ipo-window-reopens-2026": "new york stock exchange",
  "markets-brace-for-fed-decision": "new york stock exchange",
  "markets-record-highs-2026": "stock trading screen",
  "snowflake-earnings-pop-2026": "data cloud server",
  "treasury-yields-two-year-high-2026": "government bonds finance",
  // learning
  "what-are-embeddings": "abstract network dots",
  "what-is-a-vector-database": "database server racks",
  "what-is-agentic-ai": "humanoid robot",
  "what-is-mcp": "network connection abstract",
  "what-is-rag": "library books knowledge",
  "what-is-vibe-coding": "programming code screen",
  // lifestyle
  "brain-health-foods-trend-2026": "healthy food nuts berries",
  "glp1-protein-snacking-2026": "protein snacks healthy",
  "wellness-travel-2026-recalibrate": "yoga retreat nature",
  // models
  "alibaba-qwen-tops-open-models": "shanghai technology skyline",
  "anthropic-claude-fable-5-1": "abstract glowing network",
  "deepseek-v41-flash-scales-up": "circuit board macro",
  "frontier-lineup-scorecard": "checklist clipboard",
  "google-gemini-3-8-flash": "abstract blue technology",
  "moonshot-kimi-k3": "full moon night sky",
  // opinion
  "ai-funding-proof-over-promise": "handshake investment meeting",
  "buyers-win-launch-week": "shopping technology store",
  "gpt6-agi-framing": "abstract brain technology",
  "opinion-model-fatigue": "many screens overwhelmed",
  // policy
  "ai-agents-weaponized-papercut-attack": "cybersecurity hacker code",
  "ai-security-rules-pressure": "digital security lock",
  "amodei-pace-the-frontier": "slow down road sign",
  "international-ai-watchdog": "flags international summit",
  "pacing-the-frontier-letter": "car brake pedal",
  // politics
  "why-funding-deadlines-recur-2026": "us capitol washington",
  // products
  "choosing-frontier-models-guide": "decision signpost direction",
  "meta-flagship-model": "abstract data network",
  "openai-gpt6-astra": "futuristic technology glow",
  "physical-ai-robotics-investment": "robot arm factory",
  "qualcomm-aws-ai-chips": "semiconductor chip closeup",
  // manual batch — 2026-09-19..23
  "distillation-boom-small-models": "circuit board macro",
  "ai-data-center-land-rush": "data center server hall",
  "nine-figure-researcher-talent-war": "modern office glass tower",
  "shadow-ai-enterprise": "person laptop office desk",
  "conversational-voice-ai": "microphone studio closeup",
  "interpretability-grows-up": "microscope laboratory",
  "ai-training-copyright-reckoning": "law library books",
  "ai-productivity-paradox": "business chart meeting office",
  "multimodal-by-default": "camera lens macro",
  "agents-back-office-automation": "corporate office workstations",
  "gold-record-run-2026": "gold bars",
  "streaming-bundle-returns": "television remote living room",
  "sleep-economy-boom": "cozy bedroom bed",
  "satellite-internet-race-2026": "satellite orbit space",
  "ryder-cup-2026-returns": "golf course green flag",
  // manual batch — 2026-09-24
  "agentic-browser-arrives": "laptop web browser screen",
  "ai-weather-models-forecast": "dramatic storm clouds sky",
  "ai-agent-memory-turn": "computer memory chips macro",
  "content-credentials-provenance": "photographer camera closeup",
  "solid-state-batteries-ship": "electric car charging port",
  "mlb-playoffs-2026-field-set": "baseball stadium night",
  // manual batch — 2026-09-13
  "small-models-on-device-surge": "laptop computer workspace",
  "enterprise-ai-eval-gap": "data dashboard analytics screen",
  "state-ai-law-patchwork": "gavel law books desk",
  "world-models-physics-research": "robot arm engineering lab",
  "repairable-phone-right-to-repair": "smartphone repair tools",
  "private-credit-shift": "financial trading desk monitors",
  // research
  "ai-superconductor-candidates": "physics laboratory",
  "deepmind-atlas-genome": "dna double helix",
  "deepmind-august-research": "science laboratory computer",
  // sports
  "2026-biggest-year-in-sports": "olympic stadium crowd",
  "f1-2026-norris-title-defense": "formula 1 race car",
  "nfl-2026-season-kickoff": "american football stadium",
  "premier-league-arsenal-perfect-start": "soccer stadium football",
  "summer-transfer-window-2026-recap": "soccer ball pitch",
  "team-tennis-davis-cup-bjk-cup": "tennis court player",
  // technology
  "apple-foldable-2nm-chip-2026": "foldable smartphone",
  "driver-license-data-breach-2026": "cybersecurity laptop hacker",
  "falcon9-reuse-milestone-2026": "rocket launch space",
  "techtember-2026-phone-flood": "smartphones on table",
};

function buildQuery(data) {
  const category = String(data.category || "").toLowerCase();
  const seed = SEED[category] || "technology abstract";
  if (category === "politics") return seed; // stay neutral
  const hay = `${data.title || ""} ${(Array.isArray(data.tags) ? data.tags.join(" ") : "")}`.toLowerCase();
  const kw = SAFE_KEYWORDS.find((k) => hay.includes(k));
  return kw ? `${kw} ${seed.split(" ")[0]}` : seed;
}

/** Deterministic index from a string, so a given slug always picks the same photo. */
function pick(str, len) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
  return len > 0 ? (h >>> 0) % len : 0;
}

function readManifest() {
  try { return JSON.parse(fs.readFileSync(MANIFEST, "utf8")); } catch { return {}; }
}

// fetch with a hard timeout so a hung request can't stall the build.
async function fetchT(url, opts = {}, ms = 30000) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  try {
    return await fetch(url, { ...opts, signal: ctrl.signal });
  } finally {
    clearTimeout(t);
  }
}

async function pexelsSearch(query) {
  const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=15&orientation=landscape`;
  const res = await fetchT(url, { headers: { Authorization: API_KEY } }, 30000);
  if (!res.ok) throw new Error(`Pexels ${res.status}`);
  const data = await res.json();
  return Array.isArray(data.photos) ? data.photos : [];
}

async function download(url, dest) {
  const res = await fetchT(url, {}, 45000);
  if (!res.ok) throw new Error(`download ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(dest, buf);
}

async function main() {
  if (!API_KEY) {
    log("PEXELS_API_KEY not set — skipping photo fetch (generated SVG heroes will be used).");
    return;
  }
  if (!fs.existsSync(POSTS_DIR)) return;
  fs.mkdirSync(PHOTOS_DIR, { recursive: true });
  const manifest = readManifest();

  const files = fs
    .readdirSync(POSTS_DIR)
    .filter((f) => /\.mdx?$/.test(f) && !f.startsWith("_"));

  let fetched = 0, skipped = 0, failed = 0;
  for (const file of files) {
    const { data } = matter(fs.readFileSync(path.join(POSTS_DIR, file), "utf8"));
    if (data.draft) continue;              // drafts aren't on the live site
    if (data.image) continue;              // author supplied their own image
    const slug = data.slug ?? file.replace(/\.mdx?$/, "");
    const dest = path.join(PHOTOS_DIR, `${slug}.jpg`);
    const override = QUERY_OVERRIDES[slug];
    const query = override || buildQuery(data);
    // Keep an existing photo unless its (overridden) query changed — so tweaking
    // one query re-fetches just that slug, not all of them.
    if (fs.existsSync(dest)) {
      const rec = manifest[slug];
      if ((rec && rec.query === query) || !override) { skipped++; continue; }
    }
    try {
      let photos = await pexelsSearch(query);
      if (photos.length === 0) photos = await pexelsSearch((SEED[data.category] || "technology").split(" ")[0]);
      if (photos.length === 0) { log(`no photo for ${slug} ("${query}")`); failed++; continue; }
      // For a hand-authored query, choose from the top few (most relevant);
      // otherwise spread across all results for variety.
      const photo = photos[pick(slug, override ? Math.min(5, photos.length) : photos.length)];
      const src = photo.src?.landscape || photo.src?.large || photo.src?.original;
      if (!src) { failed++; continue; }
      await download(src, dest);
      manifest[slug] = {
        photographer: photo.photographer,
        photographer_url: photo.photographer_url,
        pexels_url: photo.url,
        query,
      };
      fetched++;
      log(`✓ ${slug} — "${query}" (© ${photo.photographer})`);
    } catch (e) {
      log(`✗ ${slug} — ${e?.message || e}`);
      failed++;
    }
  }

  fs.writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2) + "\n");
  log(`done: ${fetched} fetched, ${skipped} kept, ${failed} failed.`);
}

main()
  // Force a clean exit — keep-alive sockets from fetch can otherwise stall
  // the process for minutes after the work is done.
  .then(() => process.exit(0))
  .catch((e) => {
    // Never fail the build over photos — fall back to SVG heroes.
    console.error("[fetch-photos] non-fatal error:", e?.message || e);
    process.exit(0);
  });
