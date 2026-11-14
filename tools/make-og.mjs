#!/usr/bin/env node
// Renders brand-style Open Graph cards (1200×630) for every video in src/data/videos.json,
// plus og/default.png and the PNG app icons, using headless Chromium (Playwright).
// Usage:  npm i -D playwright && npx playwright install chromium   (once)
//         npm run og            → writes public/og/*.png, public/icon-*.png, public/favicon-32.png
// Pages pick up public/og/<slug>.png automatically; RSS-only videos fall back to the YouTube thumbnail.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const videos = JSON.parse(fs.readFileSync(path.join(root, "src/data/videos.json"), "utf8"));
const outDir = path.join(root, "public/og");
fs.mkdirSync(outDir, { recursive: true });
const font = (w) =>
  "data:font/woff2;base64," +
  fs.readFileSync(path.join(root, `node_modules/@fontsource/mukta/files/mukta-devanagari-${w}-normal.woff2`)).toString("base64");
const fontLatin = (w) =>
  "data:font/woff2;base64," + fs.readFileSync(path.join(root, `node_modules/@fontsource/mukta/files/mukta-latin-${w}-normal.woff2`)).toString("base64");

const QPATH = `<path d="M-26 -22 C-26 -58 30 -58 30 -22 C30 4 2 6 2 30" fill="none" stroke="#D4372C" stroke-width="24" stroke-linecap="round"/><circle cx="2" cy="52" r="14" fill="#D4372C"/>`;
const logo = (s) => `<svg viewBox="0 0 120 120" width="${s}" height="${s}"><circle cx="60" cy="60" r="54" fill="#F7C948" stroke="#111" stroke-width="8"/><g transform="translate(58 55) scale(0.7)">${QPATH}</g></svg>`;
const tri = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='72' height='18'%3E%3Cpolygon points='0,0 18,18 36,0' fill='%23F7C948'/%3E%3Cpolygon points='36,0 54,18 72,0' fill='%23D4372C'/%3E%3C/svg%3E")`;
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
const digits = (n) => String(n).replace(/[0-9]/g, (d) => "०१२३४५६७८९"[d]);
const topics = { festivals: "चाडपर्व · Festivals", history: "इतिहास · History", science: "विज्ञान · Science", business: "ब्यापार · Business", religion: "धर्म र संस्कृति · Religion & Culture" };

const card = ({ kicker, title, sub }) => `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{font-family:Mukta;font-weight:800;src:url(${font(800)})}
@font-face{font-family:Mukta;font-weight:800;src:url(${fontLatin(800)});unicode-range:U+0000-00FF,U+2000-206F}
@font-face{font-family:Mukta;font-weight:500;src:url(${font(500)})}
@font-face{font-family:Mukta;font-weight:500;src:url(${fontLatin(500)});unicode-range:U+0000-00FF,U+2000-206F}
html,body{margin:0;width:1200px;height:630px;overflow:hidden}
body{font-family:Mukta,sans-serif;background:linear-gradient(#1F2A6B,#2E3F8F);color:#FBF3DF;position:relative}
body:before{content:"";position:absolute;inset:0;background:radial-gradient(circle,rgba(247,201,72,.35) 3px,transparent 3.4px) 0 0/28px 28px}
.f1{position:absolute;inset:14px;border:14px solid #111}.f2{position:absolute;inset:36px;border:6px solid #F7C948}
.t{position:absolute;left:42px;right:42px;height:18px;background:${tri} repeat-x}.t.top{top:42px}.t.bot{bottom:42px;transform:scaleY(-1)}
.c{position:absolute;left:90px;right:360px;top:100px;bottom:100px;display:flex;flex-direction:column;justify-content:center}
.k{align-self:flex-start;background:#D4372C;color:#fff;border:4px solid #111;border-radius:999px;padding:0 18px;font-weight:800;font-size:30px}
h1{font-weight:800;font-size:${title.length > 34 ? 64 : 76}px;line-height:1.18;margin:18px 0 10px;color:#F7C948;text-shadow:4px 4px 0 #111}
p{font-weight:500;font-size:34px;margin:0;opacity:.92}
.brand{position:absolute;right:86px;bottom:92px;display:flex;align-items:center;gap:14px;font-weight:800;font-size:38px}
.art{position:absolute;right:70px;top:84px;width:300px;height:300px}
</style></head><body><div class="f1"></div><div class="f2"></div><div class="t top"></div><div class="t bot"></div>
<div class="c"><span class="k">${esc(kicker)}</span><h1>${esc(title)}</h1><p>${esc(sub)}</p></div>
<div class="art">${MASCOT}</div>
<div class="brand">${logo(64)}थाहा थियो?</div></body></html>`;

// Compact mascot head (same drawing as the video kit) for the card.
const MASCOT = `<svg viewBox="-175 -185 350 350" width="300" height="300">
<defs><pattern id="dh" width="44" height="44" patternUnits="userSpaceOnUse"><rect width="44" height="44" fill="#D4372C"/><polygon points="0,44 22,22 44,44" fill="#F7C948"/><polygon points="0,0 11,11 22,0" fill="#2D7A6B"/><polygon points="22,0 33,11 44,0" fill="#2D7A6B"/></pattern></defs>
<circle r="160" fill="#F28C28" stroke="#111" stroke-width="6"/>
<circle cx="-118" cy="10" r="22" fill="#F2B98A" stroke="#111" stroke-width="6"/><circle cx="118" cy="10" r="22" fill="#F2B98A" stroke="#111" stroke-width="6"/>
<circle r="124" fill="#F2B98A" stroke="#111" stroke-width="6"/>
<g transform="rotate(-6)"><path d="M-112 -62 L112 -62 L96 -150 Q0 -176 -96 -140 Z" fill="url(#dh)" stroke="#111" stroke-width="6" stroke-linejoin="round"/></g>
<g transform="translate(-50 -52) scale(0.62)"><path d="M-30 -40 C-30 -76 32 -76 32 -40 C32 -14 2 -12 2 16" fill="none" stroke="#111" stroke-width="22" stroke-linecap="round"/><circle cx="2" cy="42" r="11" fill="#111"/></g>
<path d="M-84 -44 Q-50 -60 -18 -46 M18 -46 Q50 -60 84 -44" fill="none" stroke="#111" stroke-width="10" stroke-linecap="round"/>
<circle cx="-48" cy="4" r="40" fill="#fff" stroke="#111" stroke-width="9"/><circle cx="48" cy="4" r="40" fill="#fff" stroke="#111" stroke-width="9"/>
<circle cx="-48" cy="6" r="15" fill="#111"/><circle cx="48" cy="6" r="15" fill="#111"/><circle cx="-43" cy="0" r="4.5" fill="#fff"/><circle cx="53" cy="0" r="4.5" fill="#fff"/>
<path d="M-8 2 Q0 -6 8 2" fill="none" stroke="#111" stroke-width="8"/>
<circle cx="-82" cy="56" r="16" fill="#E35D5D" opacity=".55"/><circle cx="82" cy="56" r="16" fill="#E35D5D" opacity=".55"/>
<path d="M-30 60 Q0 86 30 60" fill="none" stroke="#111" stroke-width="9" stroke-linecap="round"/></svg>`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
const shot = async (html, file) => {
  await page.setContent(html, { waitUntil: "load" });
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: file });
  console.log("wrote", path.relative(root, file));
};

await shot(card({ kicker: "@thahathiyo", title: "थाहा थियो?", sub: "नेपालीमा रोचक तथ्य · Facts in Nepali, every day" }), path.join(outDir, "default.png"));
for (const v of videos) {
  await shot(
    card({ kicker: `#${digits(v.number)} · ${topics[v.topic] ?? ""}`, title: v.titleNe, sub: v.titleEn || "" }),
    path.join(outDir, `${v.slug}.png`),
  );
}

// App icons from the built tab icon (थाहा's face, src/pages/favicon.svg.ts); run `npm run build` first.
const face = fs.readFileSync(path.join(root, "dist/favicon.svg"), "utf8");
const faceAt = (s) => face.replace('width="120" height="120"', `width="${s}" height="${s}"`);
for (const [name, size] of [["favicon-32.png", 32], ["apple-touch-icon.png", 180], ["icon-192.png", 192], ["icon-512.png", 512]]) {
  const p = await browser.newPage({ viewport: { width: size, height: size } });
  const pad = name.startsWith("apple") || name.startsWith("icon") ? `background:#1F2A6B;` : "";
  await p.setContent(`<body style="margin:0;${pad}display:grid;place-items:center;width:${size}px;height:${size}px">${faceAt(pad ? Math.round(size * 0.82) : size)}</body>`);
  await p.screenshot({ path: path.join(root, "public", name), omitBackground: !pad });
  await p.close();
  console.log("wrote public/" + name);
}
await browser.close();
