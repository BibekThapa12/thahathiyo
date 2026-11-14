// Reads a video's production MD file ("10 MD Files/NN - Name.md") into the fields the site needs.
// Shared by the /admin importer (browser) and the build (guessTopic). No Node or DOM imports.
import type { TopicId } from "../data/site";

export type VideoMd = {
  number?: number;
  titleEn: string;
  titleNe: string;
  description: string; // Nepali lines of the YouTube description
  descriptionEn: string; // English lines
  facts: { ne: string; en: string }[];
  sources: { title: string; url: string }[];
  topic: TopicId;
  topicFromFile: boolean; // set in the file's header, so it wins over the topic already picked in the form
  skipped: string[]; // fact lines left out on purpose (imagination / background notes)
  warnings: string[];
};

export function guessTopic(text: string): TopicId {
  const s = text.toLowerCase();
  if (/(तिहार|दशैं|दशैँ|चाड|पर्व|पूजा|टीका|तीज|देउसी|भैलो|tihar|dashain|festival|holi|chhath|losar|tika|teej|deusi|bhailo)/.test(s)) return "festivals";
  if (/(धर्म|संस्कृति|मन्दिर|देवता|भगवान|religion|religious|culture|temple|deity|mythology)/.test(s)) return "religion";
  if (/(ब्रान्ड|ब्यापार|व्यापार|कम्पनी|business|brand|company|market|case study)/.test(s)) return "business";
  if (/(विज्ञान|दिमाग|science|brain|space|planet|lake|earthquake|भूकम्प)/.test(s)) return "science";
  return "history";
}

const EMOJI = /[\p{Extended_Pictographic}\u{1F1E6}-\u{1F1FF}\u{FE0F}\u{200D}\u{20E3}]/gu;
const DEVANAGARI = /[ऀ-ॿ]/;

const plain = (s: string) =>
  s
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1")
    .replace(/\*\*|__|`/g, "")
    .trim();

// YouTube titles carry emoji and #hashtags; the site title doesn't need them (and they'd end up in the page address)
export const cleanTitle = (s: string) =>
  s
    .replace(/#\S+/g, "")
    .replace(EMOJI, "")
    .replace(/\s+([|?!:])/g, (_, p) => (p === "|" ? " |" : p))
    .replace(/\s{2,}/g, " ")
    .trim();

// Tracking codes (?utm_source=, ?is_from_webapp=…) make links long and leak where they were copied from.
export function cleanLink(url: string) {
  const s = url.trim();
  try {
    const u = new URL(s);
    if (/(^|\.)(tiktok|instagram|facebook)\.com$|^fb\.watch$/.test(u.hostname)) {
      u.search = "";
      u.hash = "";
      return u.toString();
    }
  } catch {}
  return s;
}

const TOPICS: TopicId[] = ["festivals", "history", "science", "business", "religion"];

export function parseVideoMd(md: string): VideoMd {
  const text = md.replace(/\r/g, "");
  const warnings: string[] = [];

  // optional header: "---\nnumber: 12\ntopic: science\nyoutube_title: …\n---"
  const fm = text.match(/^﻿?---\n([\s\S]*?)\n---\n/);
  const meta: Record<string, string> = {};
  for (const l of fm?.[1].split("\n") ?? []) {
    const kv = l.match(/^\s*([\w-]+)\s*:\s*(.*?)\s*$/);
    if (kv) meta[kv[1].toLowerCase()] = kv[2].replace(/^["']|["']$/g, "");
  }
  const lines = text.slice(fm?.[0].length ?? 0).split("\n");

  // "# 12 — यदि नेपालमा समुद्र भएको भए? (What If Nepal Had a Sea?)"
  const h1 = lines.find((l) => /^#\s/.test(l)) ?? "";
  const head = h1.match(/^#\s+(\d+)\s*[—–-]+\s*(.+)$/);
  const metaNumber = /^\d+$/.test(meta.number ?? "") ? Number(meta.number) : undefined;
  if (metaNumber && head && Number(head[1]) !== metaNumber) warnings.push(`The header says video #${metaNumber} but the heading says #${head[1]}; used #${metaNumber}.`);
  const number = metaNumber ?? (head ? Number(head[1]) : undefined);
  const heading = (head?.[2] ?? h1.replace(/^#\s+/, "")).trim();
  const paren = heading.match(/^(.*?)\s*\(([^()]+)\)\s*$/);
  const headNe = (paren?.[1] ?? heading).trim();
  const headEn = (paren?.[2] ?? "").trim();
  if (!number) warnings.push("No video number in the first line (expected “# 12 — …”).");

  // bullets of one "## Section"
  const section = (name: RegExp) => {
    const out: string[] = [];
    let on = false;
    for (const l of lines) {
      if (/^##\s/.test(l)) on = name.test(l.replace(/^##\s+/, ""));
      else if (on) {
        const b = l.match(/^\s*[-*]\s+(.*)$/);
        if (b) out.push(b[1].trim());
      }
    }
    return out;
  };

  const skipped: string[] = [];
  const facts = section(/^facts\b/i)
    .map(plain)
    .filter((f) => {
      const skip = /^(imagination|background)\b/i.test(f);
      if (skip) skipped.push(f);
      return !skip && f;
    })
    .map((en) => ({ ne: "", en }));

  const sources = section(/^sources\b/i).flatMap((raw) => {
    const md = raw.match(/^\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/); // "[Name](link)"
    if (md) return [{ title: md[1].trim(), url: md[2] }];
    const b = plain(raw);
    const link = b.match(/^(.*?)\s*[:–—-]?\s*(https?:\/\/\S+?)[).,]*$/);
    if (!link) return [];
    return [{ title: link[1].replace(/[\s:–—-]+$/, "").trim() || link[2], url: link[2] }];
  });

  // "**YouTube Shorts**" block of the post kit: "Title: …" then "Description:" lines up to the "📚 स्रोत" line
  const yt = lines.findIndex((l) => /^\*\*YouTube/i.test(l.trim()));
  let ytTitle = "";
  const desc: string[] = [];
  if (yt >= 0) {
    for (let i = yt + 1; i < lines.length; i++) {
      const l = lines[i].trim();
      if (/^\*\*/.test(l)) break; // next platform
      const t = l.match(/^Title:\s*(.*)$/i);
      if (t) ytTitle = t[1];
      if (/^Description:/i.test(l)) {
        for (let j = i + 1; j < lines.length; j++) {
          const d = lines[j].trim();
          if (!d || /^(📚|🔔|#|Tags:|\*\*)/u.test(d)) break;
          desc.push(d.replace(/👆/gu, "").trim());
        }
        break;
      }
    }
  } else warnings.push("No “**YouTube Shorts**” post kit found, so the description is empty.");

  // title: the header's youtube_title, else the post kit's Title line, else the heading
  let titleEn = "";
  for (const [t, where] of [[meta.youtube_title ?? "", "header's youtube_title"], [ytTitle, "post kit's Title line"]]) {
    if (titleEn) break;
    if (cleanTitle(t).length >= 4) titleEn = cleanTitle(t);
    else if (t) warnings.push(`The ${where} looks unfinished (“${t}”), so it was skipped.`);
  }
  if (meta.youtube_title && ytTitle && cleanTitle(ytTitle).length >= 4 && cleanTitle(ytTitle) !== titleEn)
    warnings.push("The header's youtube_title and the post kit's Title line differ; used the header's.");
  if (!titleEn) titleEn = cleanTitle(headEn ? `${headNe} | ${headEn}` : heading);

  // the id ("religion") or its label as written ("Religion & Culture", "Festival"): matched on the first word
  const first = (meta.topic ?? "").toLowerCase().match(/[a-z]+/)?.[0] ?? "";
  const metaTopic = (first.length >= 4 ? TOPICS.find((id) => id.startsWith(first)) : undefined) as TopicId;
  const topicFromFile = !!metaTopic;
  if (meta.topic && !topicFromFile) warnings.push(`The header's topic “${meta.topic}” isn't one of ${TOPICS.join(", ")}, so the topic was guessed.`);

  const isNe = (s: string) => DEVANAGARI.test(s) && (s.match(/[ऀ-ॿ]/g)?.length ?? 0) > (s.match(/[a-z]/gi)?.length ?? 0);
  if (!facts.length) warnings.push("No facts found under “## Facts”.");
  if (!sources.length) warnings.push("No sources found under “## Sources”.");

  return {
    number,
    titleEn,
    titleNe: headNe,
    description: desc.filter(isNe).join("\n"),
    descriptionEn: desc.filter((d) => !isNe(d)).join("\n"),
    facts,
    sources,
    topic: topicFromFile ? metaTopic : guessTopic(`${heading} ${ytTitle} ${desc.join(" ")} ${facts.map((f) => f.en).join(" ")}`),
    topicFromFile,
    skipped,
    warnings,
  };
}
