// node --test tools/video-md.test.mjs  (Node 22.18+ loads the .ts module directly)
import { test } from "node:test";
import assert from "node:assert/strict";
import { parseVideoMd, cleanLink, cleanTitle } from "../src/lib/videoMd.ts";

const md = `# 12 — यदि नेपालमा समुद्र भएको भए? (What If Nepal Had a Sea?)
Style: **Folk v3**

## Facts
- Nepal is a landlocked country; it has no coastline.
- **Religious belief:** Hindus worship shaligram as a form of Lord Vishnu.
- Imagination, not fact: surfing in Pokhara is a "what if" story.
- Background (not said in the video): sea freight comes through Kolkata.

## Voice-over (plain text)
- not a fact

## Sources
- How to Build the World's Highest Mountain (Eos, American Geophysical Union): https://eos.org/features/how-to-build
- [Wikipedia](https://en.wikipedia.org/wiki/Nepal)

## Post kit
**YouTube Shorts**
Title: यदि नेपालमा समुद्र भएको भए? 🌊🇳🇵 | What If Nepal Had a Sea? #shorts
Description:
नेपालमा समुद्र भएको भए कस्तो हुन्थ्यो? 👆
What if landlocked Nepal had a sea? It once did.
📚 स्रोत: Eos (AGU)
🔔 Subscribe: @thahathiyo

**TikTok**
Title: not this one
`;

test("reads number, titles, facts, sources and description", () => {
  const v = parseVideoMd(md);
  assert.equal(v.number, 12);
  assert.equal(v.titleEn, "यदि नेपालमा समुद्र भएको भए? | What If Nepal Had a Sea?");
  assert.equal(v.titleNe, "यदि नेपालमा समुद्र भएको भए?");
  assert.deepEqual(v.facts.map((f) => f.en), [
    "Nepal is a landlocked country; it has no coastline.",
    "Religious belief: Hindus worship shaligram as a form of Lord Vishnu.",
  ]);
  assert.equal(v.skipped.length, 2);
  assert.deepEqual(v.sources, [
    { title: "How to Build the World's Highest Mountain (Eos, American Geophysical Union)", url: "https://eos.org/features/how-to-build" },
    { title: "Wikipedia", url: "https://en.wikipedia.org/wiki/Nepal" },
  ]);
  assert.equal(v.description, "नेपालमा समुद्र भएको भए कस्तो हुन्थ्यो?");
  assert.equal(v.descriptionEn, "What if landlocked Nepal had a sea? It once did.");
  assert.deepEqual(v.warnings, []);
});

test("falls back to the heading when the YouTube title is unfinished", () => {
  const v = parseVideoMd(md.replace(/Title: यदि[^\n]*/, "Title: c"));
  assert.equal(v.titleEn, "यदि नेपालमा समुद्र भएको भए? | What If Nepal Had a Sea?");
  assert.match(v.warnings[0], /unfinished/);
});

test("the header sets number, topic and title", () => {
  const head = "---\nnumber: 12\ntopic: Science\nyoutube_title: यदि नेपालमा समुद्र भएको भए? 🌊 | What If Nepal Had a Sea? #shorts\n---\n\n";
  const v = parseVideoMd(head + md.replace(/Title: यदि[^\n]*/, "Title: c"));
  assert.equal(v.number, 12);
  assert.equal(v.topic, "science");
  assert.equal(v.topicFromFile, true);
  assert.equal(v.titleEn, "यदि नेपालमा समुद्र भएको भए? | What If Nepal Had a Sea?");
  assert.equal(v.facts.length, 2);
});

test("header problems become warnings, not wrong data", () => {
  const v = parseVideoMd("---\nnumber: 13\ntopic: sports\n---\n" + md);
  assert.equal(v.number, 13);
  assert.equal(v.topicFromFile, false);
  assert.ok(v.warnings.some((w) => /#13 but the heading says #12/.test(w)));
  assert.ok(v.warnings.some((w) => /“sports” isn't one of/.test(w)));
});

test("files without a header still work", () => {
  const v = parseVideoMd(md);
  assert.equal(v.topicFromFile, false);
  assert.equal(v.number, 12);
});

test("religion: accepted in the header and guessed from the text", () => {
  assert.equal(parseVideoMd("---\ntopic: religion\n---\n" + md).topic, "religion");
  for (const t of ["Religion & Culture", "religion and culture", "Festivals", "festival", "SCIENCE"])
    assert.equal(parseVideoMd(`---\ntopic: ${t}\n---\n` + md).topicFromFile, true, t);
  assert.equal(parseVideoMd("---\ntopic: Religion & Culture\n---\n" + md).topic, "religion");
  assert.equal(parseVideoMd("# 14 — पशुपतिनाथ मन्दिर (Pashupatinath Temple)\n## Facts\n- A Hindu temple of Shiva.").topic, "religion");
});

test("guesses the festivals topic from the text", () => {
  assert.equal(parseVideoMd("# 9 — भाइटीका (Bhai Tika)\n## Facts\n- Bhai Tika is the last day of Tihar.").topic, "festivals");
});

test("cleanLink drops tracking codes from app links only", () => {
  assert.equal(cleanLink("https://www.tiktok.com/@thahathiyo/video/77?is_from_webapp=1&sender_device=pc"), "https://www.tiktok.com/@thahathiyo/video/77");
  assert.equal(cleanLink(" https://www.instagram.com/reel/Dfo9/?utm_source=ig_web_copy_link "), "https://www.instagram.com/reel/Dfo9/");
  assert.equal(cleanLink("https://www.facebook.com/share/r/1FPruNu7bH/"), "https://www.facebook.com/share/r/1FPruNu7bH/");
  assert.equal(cleanLink("https://youtube.com/shorts/abc?si=x"), "https://youtube.com/shorts/abc?si=x");
  assert.equal(cleanLink("not a url"), "not a url");
});

test("cleanTitle removes emoji and hashtags", () => {
  assert.equal(cleanTitle("नेपालको समय किन ५:४५? ⏰🇳🇵 संसारभन्दा १५ मिनेट फरक! | Why Nepal Time Is UTC+5:45 #shorts"), "नेपालको समय किन ५:४५? संसारभन्दा १५ मिनेट फरक! | Why Nepal Time Is UTC+5:45");
});
