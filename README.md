# थाहा थियो? | Thaha Thiyo — website

The public website for the Nepali fact-video channel **@thahathiyo**: a home page with the mascot थाहा, one page per video (player, facts, sources) and a 404. The home page is a single scrolling page: hero, latest video, all videos with a topic filter, about and support. Static HTML built with [Astro](https://astro.build); the folk-art drawings are the same React SVG components the videos use, rendered to plain SVG at build time (no React runs in the browser).

## Quick start

```bash
npm install
npm run dev        # http://localhost:4321
npm run check      # type-check
npm run build      # → dist/ (static files you can host anywhere)
npm run preview    # serve dist/
```

Node 22 or newer.

## Where things live

| Path | What it is |
|---|---|
| `src/data/videos.json` | **The single source of truth for videos.** One object per video (see below). |
| `src/data/festivals.json` | Festival dates; a coming-soon video linked by `video` shows "भोलि आउँदैछ"-style timing. |
| `src/data/site.ts` | Channel name, tagline, social links, contact email, topics. |
| `src/lib/videos.ts` | Loads `videos.json` and merges the YouTube RSS feed at build time. |
| `src/components/art/` | Folk-art drawings ported from the video kit (mascot, dog, crow, pagoda, houses, mountains, prayer flags, diyas …) and composed scenes. |
| `src/pages/` | `index` (the one-page home), `videos/[slug]`, `404`, `robots.txt`. `about`, `videos/` and `topics/[topic]` only forward old links to home sections. |
| `public/og/*.png` | Brand Open Graph cards (made by `npm run og`). |
| `tools/add-video.mjs` | Adds or updates a video in `videos.json` from a script doc. |
| `tools/make-og.mjs` | Renders the OG cards and app icons with headless Chromium. |
| `tools/screenshot.mjs` | QA screenshots at phone and desktop widths. |
| `.github/workflows/deploy.yml` | Builds and deploys to GitHub Pages on every push and every day at 02:15 UTC. |

### A video entry

```json
{
  "slug": "kukur-tihar",            // URL: /videos/kukur-tihar/
  "number": 4,
  "titleNe": "तिहारमा कुकुरलाई किन पूजा गरिन्छ?",
  "titleEn": "Kukur Tihar Explained",
  "date": "2026-11-03",             // empty = not posted yet ("coming soon")
  "topic": "festivals",             // festivals | history | science | business
  "art": "dog",                     // fallback illustration: mascot, dog, crow, lake, diya, flag, calendar, cans
  "youtubeId": "_VQJmCZUQmM",
  "tiktokUrl": "", "instagramUrl": "…", "facebookUrl": "…",
  "matchTitle": ["कुकुर", "Kukur"], // words that let a new YouTube upload claim this entry automatically
  "description": "…", "descriptionEn": "…",
  "facts":   [{ "ne": "…", "en": "…" }],
  "sources": [{ "title": "…", "url": "https://…" }]
}
```

An entry with no YouTube id and no post links shows as **छिट्टै आउँदैछ / Coming soon**. Missing TikTok/Instagram/Facebook links fall back to the channel profile.

## How the site updates itself

1. **YouTube RSS merge (no API key).** Every build reads `https://www.youtube.com/feeds/videos.xml?channel_id=UCB00VCoCfdHd6oAa0iIwtdQ` (the 15 newest uploads).
   - Upload already in `videos.json` (same `youtubeId`) → fills a missing date.
   - Upload whose title contains a `matchTitle` word of a "coming soon" entry → that entry gets the YouTube id and goes live with its facts and sources.
   - Anything else → a new page is created from the upload's title, date, thumbnail and first description line (topic guessed from keywords). Add facts later with `tools/add-video.mjs`.
   - If the feed can't be reached, the build continues with `videos.json` only.
2. **Daily rebuild.** The GitHub Action runs every day at 02:15 UTC (08:00 in Nepal), so a new Short appears within a day without editing anything; the festival strip also rolls forward.
3. **Adding facts and sources from the video pipeline.**
   ```bash
   node tools/add-video.mjs --file ../scripts/07-kag-tihar.md --youtube https://youtube.com/shorts/XXXXXXXXXXX --date 2026-11-06
   node tools/add-video.mjs --slug kag-tihar --instagram https://www.instagram.com/reel/… --facebook https://www.facebook.com/reel/…
   ```
   It reads the title line, the YouTube Shorts title/description, the `## Fact notes` bullets and the `## Sources` URLs. Existing hand-written text is kept (add `--replace` to overwrite). Fact bullets come in English; add the Nepali line for each fact in `videos.json`. Commit and push, and the site rebuilds.
4. **OG cards** for new entries: `npm run og` (needs `npx playwright install chromium` once). Until then the page uses the YouTube thumbnail as its share image.

## Hosting

**GitHub Pages (free, default)**
1. Create a GitHub repository (e.g. `thaha-thiyo-website`) and push this folder to `main`.
2. Repository → Settings → Pages → Source: **GitHub Actions**.
3. The workflow publishes to `https://<user>.github.io/thaha-thiyo-website/` (base path handled automatically).

**Custom domain (e.g. thahathiyo.com, about US$10–15/year)**
- Buy the domain at any registrar (Cloudflare, Namecheap, Porkbun …).
- GitHub Pages: Settings → Pages → Custom domain, add the DNS records GitHub shows, then set repository variables `SITE_URL=https://thahathiyo.com` and `BASE_PATH=/` (Settings → Secrets and variables → Actions → Variables) so canonical links, sitemap and OG URLs use the domain.

**Cloudflare Pages or Netlify (free alternatives)**
- Connect the GitHub repo; build command `npm run build`, output directory `dist`, environment variable `SITE_URL=https://your-domain`.
- For the daily RSS refresh, add a build hook URL and call it daily (Cloudflare: a Cron Trigger worker; Netlify: a scheduled function), or keep the GitHub Action just for the cron.

## Brand rules (from STYLE-FOLK.md)

Palette only: indigo `#1F2A6B/#2E3F8F`, vermilion `#D4372C/#A8261F`, saffron `#F28C28`, gold `#F7C948`, teal `#2D7A6B`, cream `#FBF3DF`, black outlines `#111`. Font Mukta 500/700/800 (self-hosted via @fontsource), never letter-spacing on Devanagari. Nepali first, English second. Never change the mascot's design.

## To fill in

- `src/data/site.ts` → `contactEmail` (placeholder) and the Facebook vanity URL if the page has one.
- TikTok post URLs in `videos.json` when known.
- `festivals.json` dates for 2083/2084 (lunar dates marked `approx`).
