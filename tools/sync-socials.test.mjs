// node --test tools/sync-socials.test.mjs
import test from "node:test";
import assert from "node:assert/strict";
import { sync, nepalDate } from "./sync-socials.mjs";

test("dates: Metricool, plain and ISO (converted to Nepal time)", () => {
  assert.equal(nepalDate("20261106093000"), "2026-11-06");
  assert.equal(nepalDate("2026-11-06"), "2026-11-06");
  assert.equal(nepalDate("2026-11-05T20:00:00Z"), "2026-11-06"); // 01:45 next day in Nepal
});

test("posts attach by date, keep existing links, strip tracking, report misses", () => {
  const videos = [
    { slug: "kag", date: "2026-11-06", titleNe: "काग तिहार", titleEn: "Kag Tihar", tiktokUrl: "", instagramUrl: "", facebookUrl: "https://fb/manual" },
    { slug: "dog", date: "2026-11-03", titleNe: "कुकुर तिहार", titleEn: "Kukur Tihar", tiktokUrl: "", instagramUrl: "", facebookUrl: "" },
  ];
  const log = sync(videos, {
    tiktok: [{ date: "20261106093000", url: "https://tt/1?utm_source=x", caption: "Kag Tihar" }],
    facebook: [{ date: "2026-11-06", url: "https://fb/auto", caption: "" }],
    instagram: [{ date: "2026-11-09", url: "https://ig/9", caption: "" }],
  });
  assert.equal(videos[0].tiktokUrl, "https://tt/1");
  assert.equal(videos[0].facebookUrl, "https://fb/manual");
  assert.equal(videos[1].tiktokUrl, "");
  assert.ok(log.some((l) => l.startsWith("skip instagram 2026-11-09")));
});

test("two videos on one day: the caption picks the right one", () => {
  const videos = [
    { slug: "a", date: "2026-11-06", titleNe: "", titleEn: "Nepal flag explained", tiktokUrl: "" },
    { slug: "b", date: "2026-11-06", titleNe: "", titleEn: "Red Bull business story", tiktokUrl: "" },
  ];
  sync(videos, { tiktok: [{ date: "2026-11-06", url: "https://tt/rb", caption: "the Red Bull story" }] });
  assert.equal(videos[1].tiktokUrl, "https://tt/rb");
  assert.equal(videos[0].tiktokUrl, "");
});
