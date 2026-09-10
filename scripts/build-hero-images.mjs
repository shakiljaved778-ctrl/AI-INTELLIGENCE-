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

function generateSvg({ slug, category, title }) {
  const seed = hash(slug);
  const r = rng(seed);

  // Brand blue locked to the chosen "first preview" hue for a consistent look
  // across every hero; per-article variety comes from composition, not color.
  const hue = 227;
  const angle = Math.floor(r() * 360);
  const dark = `hsl(${hue}, 44%, 8%)`;
  const mid = `hsl(${hue}, 58%, ${24 + Math.floor(r() * 8)}%)`;
  const accent = `hsl(${hue}, 90%, 63%)`;
  const line = `hsl(${hue}, 55%, 86%)`;

  // Vivid accent glow, kept to the right so the headline stays readable.
  const gx = 66 + Math.floor(r() * 22);
  const gy = 14 + Math.floor(r() * 40);

  // A few subtle concentric rings on the right for depth.
  let rings = "";
  const cx = 1300 + Math.floor(r() * 170);
  const cy = 240 + Math.floor(r() * 260);
  for (let i = 0; i < 3; i++) {
    const rad = 150 + i * (95 + Math.floor(r() * 30));
    rings += `<circle cx="${cx}" cy="${cy}" r="${rad}" fill="none" stroke="${line}" stroke-width="1.5" opacity="${(0.16 - i * 0.04).toFixed(2)}"/>`;
  }

  // Faint diagonal hatch for texture.
  let hatch = "";
  for (let x = -900; x < 1600; x += 96) {
    hatch += `<line x1="${x}" y1="0" x2="${x + 900}" y2="900" stroke="#ffffff" stroke-width="1" opacity="0.028"/>`;
  }

  const label = esc((category || "").toUpperCase());

  // Big, bold headline set across the card — a punchy editorial title card.
  const headlineLines = wrapHeadline(title, 20, 4);
  const fontSize =
    headlineLines.length >= 4 ? 74 : headlineLines.length === 3 ? 84 : 96;
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
    <radialGradient id="glow" cx="${gx}%" cy="${gy}%" r="66%">
      <stop offset="0" stop-color="${accent}" stop-opacity="0.55"/>
      <stop offset="52%" stop-color="${accent}" stop-opacity="0.12"/>
      <stop offset="100%" stop-color="${accent}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1600" height="900" fill="url(#bg)"/>
  <g>${hatch}</g>
  <text x="1584" y="1012" text-anchor="end" font-family="Helvetica, Arial, sans-serif" font-size="300" font-weight="800" letter-spacing="-10" fill="#ffffff" opacity="0.05">${label}</text>
  <rect width="1600" height="900" fill="url(#glow)"/>
  <g>${rings}</g>
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
    });
    fs.writeFileSync(path.join(OUT_DIR, `${slug}.svg`), svg);
    made++;
  }
  console.log(`[hero-images] Generated ${made} hero images in public/heroes/`);
}

build();
