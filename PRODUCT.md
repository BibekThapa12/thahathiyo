# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary: Nepali viewers who just watched a थाहा थियो? Short (YouTube, TikTok, Instagram or Facebook) and tapped through, usually on a phone. They come to see the video again, check its facts and sources, or find more videos.

Other audiences (diaspora, sponsors, students) are not confirmed as design targets.

## Product Purpose

The public website for the Nepali fact-video channel @thahathiyo, which posts one-minute explainers in Nepali about Nepal and the world (festivals, history, science, business), about one a day.

The site's main job is to **grow followers**: turn a visitor from one Short into a follower of the channel on the platforms. Success means a visitor leaves following @thahathiyo.

## Positioning

A Nepali-language fact channel where every video has its own page listing the key facts and source links, narrated by the mascot थाहा and drawn in the same folk-art style as the videos.

## Operating Context

- One page per video (player, facts, sources), topic pages, an about page, an upcoming-festivals strip.
- Videos come from `src/data/videos.json` plus the YouTube RSS feed; the site rebuilds daily, so new uploads appear without manual work.
- Visitors arrive mostly from short-video apps on phones.

## Capabilities and Constraints

- Static Astro site on Vercel (https://thahathiyo.vercel.app), built from GitHub on every push; no server, no accounts, no comments.
- Folk-art drawings are React SVG components shared with the video kit, rendered to static SVG at build time (no React in the browser).
- YouTube embeds load only on tap (click-to-load player).
- The site is English-only (decided 2026-11-07): site text and video titles, descriptions and facts use the English versions; the brand name थाहा थियो? stays in Devanagari. The videos themselves are in Nepali.
- Current copy labels traditions as “भनिन्छ / मान्यता” (belief) rather than proven fact; not confirmed as a binding design rule.

## Brand Commitments

- Name: थाहा थियो? | Thaha Thiyo, handle @thahathiyo on all platforms.
- Mascot **थाहा** (dhaka topi, round glasses, daura suruwal, “?” curl on the forehead) must stay present.
- **Folk-art style** (Mithila/Paubha-inspired illustrations, shared with the videos) must stay.

## Evidence on Hand

- 7 videos in `src/data/videos.json` (6 published), each with facts and sources.
- Folk-art components in `src/components/art/`; OG cards in `public/og/`.
- No follower counts, view numbers, testimonials or press are recorded; do not invent them.

## Product Principles

1. Every page should make following the channel the obvious next step.
2. The video comes first: a visitor from a Short should reach the player instantly.
3. Show the facts and sources behind each video; never present belief as proven fact.
4. The site and the videos are one brand: same mascot, same folk art.
