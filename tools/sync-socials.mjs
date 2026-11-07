#!/usr/bin/env node
// Fills tiktokUrl / instagramUrl / facebookUrl in src/data/videos.json from a Metricool export (sync.json),
// written by the daily Claude task. One video goes to every platform on the same day, so a post belongs to
// the video published on the same Nepal date; if two videos share a date, the caption decides.
// Existing links are never overwritten, so hand-fixed links stay.
//
// Usage: node tools/sync-socials.mjs sync.json
// sync.json: { "tiktok": [{ "date", "url", "caption" }], "instagram": [...], "facebook": [...], "youtube": [...] }
//   date: "YYYY-MM-DD", "YYYYMMDDhhmmss" (Metricool, already Nepal time) or an ISO timestamp.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const FIELDS = { tiktok: "tiktokUrl", instagram: "instagramUrl", facebook: "facebookUrl" };

export const nepalDate = (d) => {
  const s = String(d);
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  if (/^\d{8}(\d{6})?$/.test(s)) return `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)}`;
  return new Date(Date.parse(s) + (5 * 60 + 45) * 60000).toISOString().slice(0, 10);
};

// tracking params (?utm_…) are dropped; the post link itself is all the site needs
const cleanUrl = (u) => String(u).split("?")[0];

const words = (s) => new Set(String(s ?? "").toLowerCase().match(/[\p{L}\p{N}]{3,}/gu) ?? []);
const overlap = (a, b) => [...words(b)].filter((w) => words(a).has(w)).length;

export function sync(videos, data) {
  const log = [];
  for (const [net, field] of Object.entries(FIELDS)) {
    for (const post of data[net] ?? []) {
      const day = nepalDate(post.date);
      const title = (v) => `${v.titleNe} ${v.titleEn}`;
      const [v] = videos.filter((x) => x.date === day).sort((a, b) => overlap(post.caption, title(b)) - overlap(post.caption, title(a)));
      if (!v) log.push(`skip ${net} ${day}: no video published that day (${cleanUrl(post.url)})`);
      else if (!v[field]) (v[field] = cleanUrl(post.url)), log.push(`${v.slug}: ${field} = ${v[field]}`);
    }
  }
  return log;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const input = process.argv[2];
  if (!input) {
    console.error("Usage: node tools/sync-socials.mjs sync.json");
    process.exit(1);
  }
  const file = path.join(path.dirname(fileURLToPath(import.meta.url)), "../src/data/videos.json");
  const videos = JSON.parse(fs.readFileSync(file, "utf8"));
  const log = sync(videos, JSON.parse(fs.readFileSync(input, "utf8")));
  fs.writeFileSync(file, JSON.stringify(videos, null, 2) + "\n");
  console.log(log.join("\n") || "nothing new");
}
