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

  // Glow position (kept toward an edge so text stays readable).
  const gx = 20 + Math.floor(r() * 60);
  const gy = 15 + Math.floor(r() * 45);

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
  const kicker = esc(title || "").slice(0, 46);

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
  <text x="80" y="120" font-family="Helvetica, Arial, sans-serif" font-size="26" letter-spacing="10" fill="#ffffff" opacity="0.62">CAMBRIAN AI</text>
  <text x="80" y="790" font-family="Helvetica, Arial, sans-serif" font-size="30" font-weight="700" letter-spacing="6" fill="#ffffff" opacity="0.92">${label}</text>
  <text x="80" y="835" font-family="Helvetica, Arial, sans-serif" font-size="24" fill="#ffffff" opacity="0.55">${kicker}</text>
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
