// Build-time hero-image generator.
//
// For every MDX post that doesn't declare its own `image`, this generates a
// unique, on-brand SVG hero into public/heroes/<slug>.svg. The art is
// deterministic (seeded by the slug) so each article looks distinct but stays
// within the site's minimalist, moody steel-blue palette. No external assets or
// network are needed — perfect for a fully static build.
//
// Runs automatically via the `predev` / `prebuild` npm scripts.

import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const ROOT = process.cwd();
const POSTS_DIR = path.join(ROOT, "content", "posts");
const OUT_DIR = path.join(ROOT, "public", "heroes");

/** Deterministic 32-bit hash from a string (FNV-1a). */
function hash(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** A tiny seeded PRNG (mulberry32) for repeatable variation. */
function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function esc(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/** Greedy word-wrap into up to maxLines lines of ~maxChars; ellipsis if longer. */
function wrapHeadline(text, maxChars, maxLines) {
  const words = String(text).split(/\s+/).filter(Boolean);
  const lines = [];
  let cur = "";
  let i = 0;
  for (; i < words.length; i++) {
    const t = cur ? `${cur} ${words[i]}` : words[i];
    if (t.length <= maxChars) {
      cur = t;
    } else {
      if (cur) lines.push(cur);
      cur = words[i];
      if (lines.length === maxLines) break;
    }
  }
  if (lines.length < maxLines && cur) lines.push(cur);
  const consumed = lines.join(" ").split(/\s+/).filter(Boolean).length;
  if (consumed < words.length && lines.length) {
    lines[lines.length - 1] =
      lines[lines.length - 1].replace(/[.,;:—-]+$/, "") + "…";
  }
  return lines.slice(0, maxLines);
}

/**
 * Line-art topic icons drawn in a 100×100 space (fill:none, white stroke),
 * so every hero carries a motif that hints at the article's subject.
 */
const ICONS = {
  chip: `<rect x="30" y="30" width="40" height="40" rx="4"/><rect x="42" y="42" width="16" height="16" rx="2"/><path d="M40 22v8M50 22v8M60 22v8M40 70v8M50 70v8M60 70v8M22 40h8M22 50h8M22 60h8M70 40h8M70 50h8M70 60h8"/>`,
  robot: `<rect x="30" y="36" width="40" height="32" rx="6"/><circle cx="42" cy="52" r="3.5"/><circle cx="58" cy="52" r="3.5"/><path d="M50 24v12"/><circle cx="50" cy="22" r="3"/><path d="M30 50h-6M70 50h6M42 68v8M58 68v8"/>`,
  atom: `<circle cx="50" cy="50" r="6"/><ellipse cx="50" cy="50" rx="32" ry="13"/><ellipse cx="50" cy="50" rx="32" ry="13" transform="rotate(60 50 50)"/><ellipse cx="50" cy="50" rx="32" ry="13" transform="rotate(120 50 50)"/>`,
  neural: `<path d="M30 34 52 42M30 34 52 60M30 52 52 42M30 52 52 60M30 70 52 42M30 70 52 60M52 42 74 50M52 60 74 50"/><circle cx="30" cy="34" r="4"/><circle cx="30" cy="52" r="4"/><circle cx="30" cy="70" r="4"/><circle cx="52" cy="42" r="4"/><circle cx="52" cy="60" r="4"/><circle cx="74" cy="50" r="4"/>`,
  chart: `<path d="M24 24V78H80"/><path d="M30 66 46 52 58 60 78 34"/><path d="M66 34H78V46"/>`,
  building: `<path d="M22 42 50 24 78 42"/><path d="M26 42V76M38 42V76M50 42V76M62 42V76M74 42V76"/><path d="M20 80H80M24 48H76"/>`,
  globe: `<circle cx="50" cy="50" r="30"/><ellipse cx="50" cy="50" rx="12" ry="30"/><path d="M20 50H80M25 36H75M25 64H75"/>`,
  database: `<ellipse cx="50" cy="30" rx="26" ry="9"/><path d="M24 30V70 A26 9 0 0 0 76 70V30M24 50 A26 9 0 0 0 76 50"/>`,
  book: `<path d="M50 32 C42 26 28 26 22 30V74 C28 70 42 70 50 76 C58 70 72 70 78 74V30 C72 26 58 26 50 32Z"/><path d="M50 32V76"/>`,
  brackets: `<path d="M42 30 26 50 42 70M58 30 74 50 58 70"/>`,
  calendar: `<rect x="24" y="30" width="52" height="46" rx="4"/><path d="M24 44H76M36 24V34M64 24V34"/><circle cx="38" cy="56" r="2.5"/><circle cx="50" cy="56" r="2.5"/><circle cx="62" cy="56" r="2.5"/>`,
  scales: `<path d="M50 22V80M34 80H66M22 34H78M50 22V34"/><path d="M22 34 14 52 a9 9 0 0 0 16 0Z"/><path d="M78 34 70 52 a9 9 0 0 0 16 0Z"/>`,
  quote: `<path d="M32 36h14v14c0 8 -5 12 -13 14M54 36h14v14c0 8 -5 12 -13 14"/>`,
  spark: `<path d="M50 22 C53 43 57 47 78 50 C57 53 53 57 50 78 C47 57 43 53 22 50 C43 47 47 43 50 22Z"/>`,
};

/** Choose an icon that best reflects the article's subject. */
function iconKey(category, title, tags) {
  const hay = `${category} ${title} ${(tags || []).join(" ")}`.toLowerCase();
  const has = (arr) => arr.some((w) => hay.includes(w));

  if (has(["chip", "silicon", "nvidia", "qualcomm", "gpu", "inference", "hardware"])) return "chip";
  if (has(["robot", "physical ai", "autonom", "drone", "humanoid"])) return "robot";
  if (has(["genome", "dna", "mutation", "superconductor", "material", "protein"])) return "atom";
  if (category === "learning") {
    if (has(["rag", "vector", "embedding", "database", "retrieval"])) return "database";
    if (has(["mcp", "agent", "vibe", "coding", "tool"])) return "brackets";
    return "book";
  }
  if (category === "enterprise") {
    return has(["fund", "round", "valuation", "billion", "invest"]) ? "chart" : "building";
  }
  if (category === "policy") return "scales";
  if (category === "events") return "calendar";
  if (category === "opinion") return "quote";
  if (has(["china", "chinese", "deepseek", "alibaba", "qwen", "moonshot", "kimi", "tencent", "minimax", "openrouter", "mistral", "europe", "sovereign", "global"])) return "globe";
  if (has(["fund", "round", "valuation", "billion", "invest", "venture"])) return "chart";
  if (has(["rag", "vector", "embedding", "database", "retrieval"])) return "database";
  if (has(["agent", "mcp", "vibe"])) return "brackets";
  if (has(["science", "research", "deepmind"])) return "atom";
  if (has(["model", "llm", "gpt", "gemini", "claude", "fable", "flash", "reasoning"])) return "neural";
  return "spark";
}

function generateSvg({ slug, category, title, tags }) {
  const seed = hash(slug);
  const r = rng(seed);

  // Brand blue locked to the chosen "first preview" hue for a consistent look
  // across every hero; per-article variety comes from the topic motif.
  const hue = 227;
  const angle = Math.floor(r() * 360);
  const dark = `hsl(${hue}, 44%, 8%)`;
  const mid = `hsl(${hue}, 58%, ${24 + Math.floor(r() * 8)}%)`;
  const accent = `hsl(${hue}, 90%, 63%)`;

  // Vivid accent glow behind the topic icon on the right.
  const gx = 68;
  const gy = 40;

  // Topic motif (right side) — hints at what the article is about.
  const icon = ICONS[iconKey(category, title, tags)] || ICONS.spark;
  const iconGroup = `<g transform="translate(1090 250) scale(3.35)" fill="none" stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" opacity="0.9">${icon}</g>`;

  // Faint diagonal hatch for texture.
  let hatch = "";
  for (let x = -900; x < 1600; x += 96) {
    hatch += `<line x1="${x}" y1="0" x2="${x + 900}" y2="900" stroke="#ffffff" stroke-width="1" opacity="0.028"/>`;
  }

  const label = esc((category || "").toUpperCase());

  // Big, bold headline set across the card — a punchy editorial title card.
  const headlineLines = wrapHeadline(title, 18, 4);
  const fontSize =
    headlineLines.length >= 4 ? 72 : headlineLines.length === 3 ? 82 : 92;
  const lh = fontSize * 1.1;
  const blockTop = 470 - ((headlineLines.length - 1) * lh) / 2;
  const headlineSvg = headlineLines
    .map(
      (ln, idx) =>
        `<text x="78" y="${Math.round(blockTop + idx * lh)}" font-family="Helvetica, Arial, sans-serif" font-size="${fontSize}" font-weight="700" letter-spacing="-2" fill="#ffffff">${esc(ln)}</text>`
    )
    .join("");
  const eyebrowY = Math.round(blockTop - fontSize - 30);
  const barY = eyebrowY - 40;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900" viewBox="0 0 1600 900" role="img" aria-label="${esc(title)}">
  <defs>
    <linearGradient id="bg" gradientTransform="rotate(${angle} 0.5 0.5)">
      <stop offset="0" stop-color="${dark}"/>
      <stop offset="1" stop-color="${mid}"/>
    </linearGradient>
    <radialGradient id="glow" cx="${gx}%" cy="${gy}%" r="60%">
      <stop offset="0" stop-color="${accent}" stop-opacity="0.5"/>
      <stop offset="55%" stop-color="${accent}" stop-opacity="0.1"/>
      <stop offset="100%" stop-color="${accent}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1600" height="900" fill="url(#bg)"/>
  <g>${hatch}</g>
  <text x="1584" y="1012" text-anchor="end" font-family="Helvetica, Arial, sans-serif" font-size="300" font-weight="800" letter-spacing="-10" fill="#ffffff" opacity="0.05">${label}</text>
  <rect width="1600" height="900" fill="url(#glow)"/>
  ${iconGroup}
  <text x="80" y="120" font-family="Helvetica, Arial, sans-serif" font-size="26" letter-spacing="10" fill="#ffffff" opacity="0.62">CAMBRIAN AI</text>
  <rect x="80" y="${barY}" width="74" height="8" rx="4" fill="${accent}"/>
  <text x="82" y="${eyebrowY}" font-family="Helvetica, Arial, sans-serif" font-size="30" font-weight="700" letter-spacing="7" fill="${accent}">${label}</text>
  ${headlineSvg}
</svg>
`;
}

function build() {
  if (!fs.existsSync(POSTS_DIR)) return;
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const files = fs
    .readdirSync(POSTS_DIR)
    .filter((f) => /\.mdx?$/.test(f) && !f.startsWith("_"));

  let made = 0;
  for (const file of files) {
    const raw = fs.readFileSync(path.join(POSTS_DIR, file), "utf8");
    const { data } = matter(raw);
    if (data.image) continue; // author supplied their own image
    const slug = data.slug ?? file.replace(/\.mdx?$/, "");
    const svg = generateSvg({
      slug,
      category: data.category ?? "",
      title: data.title ?? "",
      tags: Array.isArray(data.tags) ? data.tags : [],
    });
    fs.writeFileSync(path.join(OUT_DIR, `${slug}.svg`), svg);
    made++;
  }
  console.log(`[hero-images] Generated ${made} hero images in public/heroes/`);
}

build();
