#!/usr/bin/env node
// Add (or update) a video in src/data/videos.json from a script doc of the video pipeline
// (claude/scripts/NN-*.md in the "Ai Video Editing" project).
//
// Usage:
//   node tools/add-video.mjs --file path/to/07-kag-tihar.md [--youtube ID_or_URL] [--date 2026-11-06]
//        [--topic festivals|history|science|business] [--slug kag-tihar] [--art crow]
//        [--instagram URL] [--facebook URL] [--tiktok URL] [--postkit path/to/07-postkit.md] [--replace] [--dry]
//
// What it reads from the markdown:
//   "# Video 07: <Nepali title> (<English title>)"   → number, titleNe, titleEn
//   "**YouTube Shorts**" → "Title: …"                 → better ne | en titles when present
//   "## Fact notes" bullets                          → facts[] (English; Nepali left empty for you to add)
//   "## Sources" URLs                                → sources[]
// Run it again with only --slug and link flags to fill in post URLs later.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dataFile = path.join(root, "src/data/videos.json");

const args = {};
const argv = process.argv.slice(2);
for (let i = 0; i < argv.length; i++) {
  const a = argv[i];
  if (!a.startsWith("--")) continue;
  const key = a.slice(2);
  const next = argv[i + 1];
  if (!next || next.startsWith("--")) args[key] = true;
  else (args[key] = next), i++;
}
if (args.help || (!args.file && !args.slug)) {
  console.log(fs.readFileSync(fileURLToPath(import.meta.url), "utf8").split("\n").slice(1, 17).map((l) => l.replace(/^\/\/ ?/, "")).join("\n"));
  process.exit(args.help ? 0 : 1);
}

const videos = JSON.parse(fs.readFileSync(dataFile, "utf8"));

const ytId = (s) => {
  if (!s || s === true) return "";
  const m = String(s).match(/(?:shorts\/|v=|youtu\.be\/|embed\/)([\w-]{11})/);
  return m ? m[1] : String(s).trim();
};
const clean = (s) =>
  s
    .replace(/#\S+/g, "")
    .replace(/[\p{Extended_Pictographic}\u{1F1E6}-\u{1F1FF}️‍]/gu, "")
    .replace(/\*\*/g, "")
    .replace(/\s+/g, " ")
    .trim();
const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60);
const guessTopic = (s) => {
  s = s.toLowerCase();
  if (/(तिहार|दशैं|दशैँ|चाड|पर्व|पूजा|tihar|dashain|festival|holi|chhath)/.test(s)) return "festivals";
  if (/(ब्रान्ड|ब्यापार|व्यापार|business|brand|company|case study)/.test(s)) return "business";
  if (/(विज्ञान|दिमाग|science|brain|lake|earthquake|भूकम्प|ताल)/.test(s)) return "science";
  return "history";
};
const section = (md, name) => {
  const m = md.match(new RegExp(`^##\\s+${name}[^\\n]*\\n([\\s\\S]*?)(?=^##\\s|(?![\\s\\S]))`, "mi"));
  return m ? m[1] : "";
};

let parsed = {};
if (args.file) {
  let md = fs.readFileSync(path.resolve(args.file), "utf8");
  if (args.postkit) md += "\n" + fs.readFileSync(path.resolve(args.postkit), "utf8");
  const h = md.match(/^#\s*Video\s*0*(\d+)[^:]*:\s*(.+)$/m);
  if (h) {
    parsed.number = Number(h[1]);
    let t = h[2].replace(/—.*$/, "").trim();
    const en = t.match(/\(([^)]*[A-Za-z][^)]*)\)\s*$/);
    if (en) (parsed.titleEn = en[1].trim()), (t = t.slice(0, en.index).trim());
    parsed.titleNe = clean(t);
  }
  const yt = md.match(/\*\*YouTube Shorts\*\*[\s\S]*?Title:\s*(.+)/);
  if (yt) {
    const [a, b] = clean(yt[1]).split("|").map((s) => s.trim());
    if (b) parsed.titleEn = b;
    if (a && /[ऀ-ॿ]/.test(a)) parsed.titleNe = a;
  }
  const desc = md.match(/\*\*YouTube Shorts\*\*[\s\S]*?Description:\s*\n?(.+)/);
  if (desc) {
    const lines = desc[1].split(" / ");
    parsed.description = clean(lines[0]).replace(/पूरा हेर्नुहोस्.*$/, "").trim();
    if (lines[1] && /[A-Za-z]/.test(lines[1])) parsed.descriptionEn = clean(lines[1]);
  }
  const notes = section(md, "Fact notes");
  parsed.facts = notes
    .split("\n")
    .filter((l) => /^\s*[-*]\s+/.test(l))
    .map((l) => ({ ne: "", en: clean(l.replace(/^\s*[-*]\s+/, "")).replace(/\s*→.*$/, "") }));
  const src = section(md, "Sources") || section(md, "Fact sources");
  parsed.sources = [...src.matchAll(/https?:\/\/[^\s)>\]]+/g)].map((m) => {
    const line = src.split("\n").find((l) => l.includes(m[0])) ?? "";
    const label = clean(line.replace(m[0], "").replace(/^\s*[-*]\s*/, "").replace(/[:–-]\s*$/, ""));
    return { title: label || new URL(m[0]).hostname.replace(/^www\./, ""), url: m[0] };
  });
}

const slug = args.slug || slugify(parsed.titleEn || "") || (parsed.number ? `video-${parsed.number}` : "");
if (!slug) throw new Error("Could not work out a slug; pass --slug");

let entry = videos.find((v) => v.slug === slug) || (parsed.number && videos.find((v) => v.number === parsed.number));
const isNew = !entry;
entry ??= {
  slug,
  number: parsed.number || Math.max(0, ...videos.map((v) => v.number)) + 1,
  titleNe: "",
  titleEn: "",
  date: "",
  topic: "history",
  art: "mascot",
  youtubeId: "",
  tiktokUrl: "",
  instagramUrl: "",
  facebookUrl: "",
  matchTitle: [],
  description: "",
  descriptionEn: "",
  facts: [],
  sources: [],
};

// Existing entries keep hand-edited text; only empty fields are filled (use --replace to overwrite from the doc).
const fill = (k, val) => {
  const empty = Array.isArray(entry[k]) ? !entry[k].length : !entry[k];
  if (val && (!Array.isArray(val) || val.length) && (isNew || empty || args.replace)) entry[k] = val;
};
for (const k of ["titleNe", "titleEn", "description", "descriptionEn", "facts", "sources"]) fill(k, parsed[k]);
if (isNew) entry.topic = guessTopic(`${entry.titleNe} ${entry.titleEn}`);
if (args.topic) entry.topic = args.topic;
if (args.art) entry.art = args.art;
if (args.date) entry.date = args.date;
if (args.youtube) entry.youtubeId = ytId(args.youtube);
if (args.instagram) entry.instagramUrl = args.instagram;
if (args.facebook) entry.facebookUrl = args.facebook;
if (args.tiktok) entry.tiktokUrl = args.tiktok;
if (!entry.matchTitle?.length && entry.titleNe) entry.matchTitle = [entry.titleNe.split(/[?।|]/)[0].trim()].filter(Boolean);

if (isNew) videos.push(entry);
videos.sort((a, b) => a.number - b.number);

if (args.dry) console.log(JSON.stringify(entry, null, 2));
else {
  fs.writeFileSync(dataFile, JSON.stringify(videos, null, 2) + "\n");
  console.log(`${isNew ? "Added" : "Updated"} #${entry.number} ${entry.slug} — ${entry.titleNe} | ${entry.titleEn}`);
  console.log(`facts: ${entry.facts.length}, sources: ${entry.sources.length}, youtube: ${entry.youtubeId || "(none yet)"}`);
  if (entry.facts.some((f) => !f.ne)) console.log("Tip: add the Nepali line (\"ne\") for each fact in src/data/videos.json.");
}
