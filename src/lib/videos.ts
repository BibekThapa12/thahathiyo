// Single source of truth = src/data/videos.json, plus the public YouTube RSS feed merged in at build time.
// A new Short uploaded to the channel appears on the next build (the GitHub Action rebuilds daily).
import fs from "node:fs";
import path from "node:path";
import raw from "../data/videos.json";
import { CHANNEL, SOCIALS, TOPICS, type Platform, type TopicId } from "../data/site";
import { guessTopic } from "./videoMd";

export type Fact = { ne: string; en: string };
export type Source = { title: string; url: string };
export type VideoEntry = {
  slug: string;
  number: number;
  titleNe: string;
  titleEn: string;
  date: string;
  topic: TopicId;
  art?: string;
  youtubeId: string;
  tiktokUrl: string;
  instagramUrl: string;
  facebookUrl: string;
  matchTitle?: string[];
  description: string;
  descriptionEn?: string;
  facts: Fact[];
  sources: Source[];
};
export type Video = VideoEntry & {
  status: "published" | "coming-soon";
  thumbnail: string;
  origin: "data" | "rss";
};

type RssItem = { id: string; title: string; published: string; description: string };

const RSS_URL = `https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL.youtubeChannelId}`;

const decode = (s: string) =>
  s
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)));

export function parseRss(xml: string): RssItem[] {
  const items: RssItem[] = [];
  for (const m of xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)) {
    const e = m[1];
    const pick = (re: RegExp) => decode(e.match(re)?.[1] ?? "").trim();
    const id = pick(/<yt:videoId>([^<]+)<\/yt:videoId>/);
    if (!id) continue;
    items.push({
      id,
      title: pick(/<title>([\s\S]*?)<\/title>/),
      published: pick(/<published>([^<]+)<\/published>/),
      description: pick(/<media:description>([\s\S]*?)<\/media:description>/),
    });
  }
  return items;
}

async function fetchRss(): Promise<RssItem[]> {
  if (process.env.SKIP_RSS === "1") return [];
  // Offline testing: RSS_FILE=path/to/feed.xml npm run build
  if (process.env.RSS_FILE) return parseRss(fs.readFileSync(process.env.RSS_FILE, "utf8"));
  // Daily Claude task: YouTube uploads from Metricool (sync.json) instead of the sometimes-down RSS feed.
  if (process.env.FEED_JSON) {
    const yt: { id: string; title: string; date: string }[] = JSON.parse(fs.readFileSync(process.env.FEED_JSON, "utf8")).youtube ?? [];
    // Metricool dates look like 20261103084605 (Nepal time); the merge below wants YYYY-MM-DD first
    return yt.map((y) => ({ id: y.id, title: y.title, published: String(y.date).replace(/^(\d{4})(\d{2})(\d{2})\d*$/, "$1-$2-$3"), description: "" }));
  }
  try {
    const res = await fetch(RSS_URL, { signal: AbortSignal.timeout(10000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const items = parseRss(await res.text());
    console.log(`[videos] YouTube RSS: ${items.length} uploads`);
    return items;
  } catch (err) {
    console.warn(`[videos] YouTube RSS unavailable (${(err as Error).message}); using videos.json only.`);
    return [];
  }
}

/** "संसारमा ... 🇳🇵 | Nepal's Flag Explained #shorts" → { ne, en } without hashtags/emoji. */
export function splitTitle(title: string): { ne: string; en: string } {
  const clean = title
    .replace(/#\S+/g, "")
    .replace(/[\p{Extended_Pictographic}\u{1F1E6}-\u{1F1FF}️‍]/gu, "")
    .replace(/\s+/g, " ")
    .trim();
  const [a, ...rest] = clean.split("|").map((s) => s.trim());
  const b = rest.join(" | ");
  const isDev = (s: string) => /[ऀ-ॿ]/.test(s);
  if (b) return isDev(a) ? { ne: a, en: b } : { ne: b, en: a };
  return isDev(a) ? { ne: a, en: "" } : { ne: a, en: a };
}

const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);

// The admin form takes a full YouTube link; keep only the 11-character video ID.
const ytId = (s = "") => s.match(/(?:shorts\/|v=|youtu\.be\/|embed\/)([\w-]{11})/)?.[1] ?? s.trim();

// oar2 is the Short's own 1080x1920 frame; hqdefault is 480x360 with the Short as a ~200px-wide strip.
const thumb = (id: string) => (id ? `https://i.ytimg.com/vi/${id}/oar2.jpg` : "");

let cache: Promise<Video[]> | null = null;
export function getVideos(): Promise<Video[]> {
  cache ??= build();
  return cache;
}

async function build(): Promise<Video[]> {
  // slug may be left empty in the admin form: it then comes from the title
  const entries = (raw as VideoEntry[]).map((v) => ({ ...v, youtubeId: ytId(v.youtubeId), slug: v.slug || slugify(v.titleEn || v.titleNe) }));
  const rss = await fetchRss();
  const added: VideoEntry[] = [];

  for (const item of rss) {
    let v = entries.find((e) => e.youtubeId === item.id);
    if (!v) {
      // A "coming soon" entry whose keywords match the upload title claims it.
      v = entries.find((e) => !e.youtubeId && (e.matchTitle ?? []).some((k) => item.title.toLowerCase().includes(k.toLowerCase())));
      if (v) v.youtubeId = item.id;
    }
    if (v) {
      if (!v.date && item.published) v.date = item.published.slice(0, 10);
      continue;
    }
    const { ne, en } = splitTitle(item.title);
    const slugBase = slugify(en) || `video-${item.id.toLowerCase()}`;
    const slug = [...entries, ...added].some((e) => e.slug === slugBase) ? `${slugBase}-${item.id.toLowerCase()}` : slugBase;
    const firstLine = item.description.split("\n").find((l) => l.trim()) ?? "";
    added.push({
      slug,
      number: 0,
      titleNe: ne,
      titleEn: en,
      date: item.published.slice(0, 10),
      topic: guessTopic(item.title + " " + item.description),
      youtubeId: item.id,
      tiktokUrl: "",
      instagramUrl: "",
      facebookUrl: "",
      description: firstLine.replace(/#\S+/g, "").trim(),
      facts: [],
      sources: [],
    });
  }

  // Number RSS-only uploads after the highest known number, oldest first.
  let n = Math.max(0, ...entries.map((e) => e.number));
  added.sort((a, b) => a.date.localeCompare(b.date)).forEach((e) => (e.number = ++n));

  // The feed only lists the latest 15 uploads, so CI (WRITE_BACK=1) saves matches to videos.json before they drop out.
  if (process.env.WRITE_BACK === "1") {
    const saved = [...entries, ...added].sort((a, b) => a.number - b.number);
    const file = path.join(process.cwd(), "src", "data", "videos.json");
    if (JSON.stringify(saved) !== JSON.stringify(raw)) {
      fs.writeFileSync(file, JSON.stringify(saved, null, 2) + "\n");
      console.log(`[videos] Saved YouTube matches to src/data/videos.json`);
    }
  }

  const all: Video[] = [
    ...entries.map((e) => ({ ...e, origin: "data" as const })),
    ...added.map((e) => ({ ...e, origin: "rss" as const })),
  ].map((e) => {
    const published = Boolean(e.youtubeId || e.instagramUrl || e.facebookUrl || e.tiktokUrl);
    return { ...e, status: published ? ("published" as const) : ("coming-soon" as const), thumbnail: thumb(e.youtubeId) };
  });

  // Published newest first, then coming-soon by number.
  return all.sort((a, b) => {
    if (a.status !== b.status) return a.status === "published" ? -1 : 1;
    if (a.status === "coming-soon") return a.number - b.number;
    return (b.date || "").localeCompare(a.date || "") || b.number - a.number;
  });
}

/** Links to this exact video on every platform it is on (filled by tools/sync-socials.mjs). */
export const platformLinks = (v: Video): { id: Platform; name: string; nameNe: string; url: string }[] =>
  SOCIALS.map((s) => ({
    id: s.id,
    name: s.name,
    nameNe: s.nameNe,
    url: { youtube: v.youtubeId ? `https://www.youtube.com/shorts/${v.youtubeId}` : "", tiktok: v.tiktokUrl, instagram: v.instagramUrl, facebook: v.facebookUrl }[s.id],
  })).filter((l) => l.url);

export const topicOf = (id: string) => TOPICS.find((t) => t.id === id) ?? TOPICS[1];

export function relatedTo(v: Video, all: Video[], n = 3): Video[] {
  const others = all.filter((x) => x.slug !== v.slug);
  const same = others.filter((x) => x.topic === v.topic);
  const rest = others.filter((x) => x.topic !== v.topic && x.status === "published");
  return [...same, ...rest].slice(0, n);
}

/** Per-video Open Graph image: generated brand card if present (npm run og), else the YouTube thumbnail, else the default card. */
export function ogImageFor(v: Video): string {
  const file = path.join(process.cwd(), "public", "og", `${v.slug}.png`);
  if (fs.existsSync(file)) return `og/${v.slug}.png`;
  if (v.youtubeId) return `https://i.ytimg.com/vi/${v.youtubeId}/hqdefault.jpg`;
  return "og/default.png";
}
