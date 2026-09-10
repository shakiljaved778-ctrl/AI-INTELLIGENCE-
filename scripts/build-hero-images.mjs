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

  // Cool steel-blue family; small per-post hue variation keeps them related.
  const hue = 205 + Math.floor(r() * 24); // 205–228
  const angle = Math.floor(r() * 360);
  const dark = `hsl(${hue}, 32%, 11%)`;
  const mid = `hsl(${hue}, 38%, ${20 + Math.floor(r() * 8)}%)`;
  const glow = `hsl(${hue}, 78%, 62%)`;
  const line = `hsl(${hue}, 45%, 82%)`;

  // Glow kept to the right half so the left-aligned headline stays readable.
  const gx = 62 + Math.floor(r() * 28);
  const gy = 18 + Math.floor(r() * 44);

  // Concentric rings.
  const ringCount = 3 + Math.floor(r() * 3);
  let rings = "";
  const cx = 1240 + Math.floor(r() * 220);
  const cy = 300 + Math.floor(r() * 320);
  for (let i = 0; i < ringCount; i++) {
    const rad = 130 + i * (70 + Math.floor(r() * 40));
    rings += `<circle cx="${cx}" cy="${cy}" r="${rad}" fill="none" stroke="${line}" stroke-width="1.5" opacity="${(0.22 - i * 0.03).toFixed(2)}"/>`;
  }

  // Faint diagonal hatch for texture.
  let hatch = "";
  for (let x = -900; x < 1600; x += 90) {
    hatch += `<line x1="${x}" y1="0" x2="${x + 900}" y2="900" stroke="#ffffff" stroke-width="1" opacity="0.03"/>`;
  }

  const label = esc((category || "").toUpperCase());

  // Headline set large across the card so it reads as an editorial title card
  // (fills the space and is relevant) rather than a mostly-empty background.
  const headlineLines = wrapHeadline(title, 22, 4);
  const fontSize = headlineLines.length >= 4 ? 66 : headlineLines.length === 3 ? 74 : 80;
  const lh = fontSize * 1.16;
  const blockTop = 470 - ((headlineLines.length - 1) * lh) / 2;
  const headlineSvg = headlineLines
    .map(
      (ln, idx) =>
        `<text x="80" y="${Math.round(blockTop + idx * lh)}" font-family="Helvetica, Arial, sans-serif" font-size="${fontSize}" font-weight="600" letter-spacing="-0.5" fill="#ffffff" opacity="0.96">${esc(ln)}</text>`
    )
    .join("");
  const eyebrowY = Math.round(blockTop - fontSize - 34);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900" viewBox="0 0 1600 900" role="img" aria-label="${esc(title)}">
  <defs>
    <linearGradient id="bg" gradientTransform="rotate(${angle} 0.5 0.5)">
      <stop offset="0" stop-color="${dark}"/>
      <stop offset="1" stop-color="${mid}"/>
    </linearGradient>
    <radialGradient id="glow" cx="${gx}%" cy="${gy}%" r="70%">
      <stop offset="0" stop-color="${glow}" stop-opacity="0.42"/>
      <stop offset="55%" stop-color="${glow}" stop-opacity="0.10"/>
      <stop offset="100%" stop-color="${glow}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1600" height="900" fill="url(#bg)"/>
  <g>${hatch}</g>
  <rect width="1600" height="900" fill="url(#glow)"/>
  <g>${rings}</g>
  <text x="80" y="118" font-family="Helvetica, Arial, sans-serif" font-size="26" letter-spacing="10" fill="#ffffff" opacity="0.60">CAMBRIAN AI</text>
  <text x="82" y="${eyebrowY}" font-family="Helvetica, Arial, sans-serif" font-size="28" font-weight="700" letter-spacing="7" fill="${line}" opacity="0.95">${label}</text>
  ${headlineSvg}
  <rect x="82" y="812" width="60" height="4" rx="2" fill="${glow}" opacity="0.9"/>
  <text x="82" y="852" font-family="Helvetica, Arial, sans-serif" font-size="22" letter-spacing="2" fill="#ffffff" opacity="0.55">cambrian-ai.vercel.app</text>
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
