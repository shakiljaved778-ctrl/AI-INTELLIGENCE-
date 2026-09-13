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

async function pexelsSearch(query) {
  const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=15&orientation=landscape`;
  const res = await fetch(url, { headers: { Authorization: API_KEY } });
  if (!res.ok) throw new Error(`Pexels ${res.status}`);
  const data = await res.json();
  return Array.isArray(data.photos) ? data.photos : [];
}

async function download(url, dest) {
  const res = await fetch(url);
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
    if (fs.existsSync(dest)) { skipped++; continue; } // already have it

    const query = buildQuery(data);
    try {
      let photos = await pexelsSearch(query);
      if (photos.length === 0) photos = await pexelsSearch((SEED[data.category] || "technology").split(" ")[0]);
      if (photos.length === 0) { log(`no photo for ${slug} ("${query}")`); failed++; continue; }
      const photo = photos[pick(slug, photos.length)];
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

main().catch((e) => {
  // Never fail the build over photos — fall back to SVG heroes.
  console.error("[fetch-photos] non-fatal error:", e?.message || e);
  process.exit(0);
});
