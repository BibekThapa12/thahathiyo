// Screenshots for QA: node tools/screenshot.mjs [baseUrl] [outDir]
import { chromium } from "playwright";
const base = process.argv[2] || "http://localhost:4321/";
const out = process.argv[3] || "screens";
const pages = [["home", ""], ["video", "videos/kukur-tihar/"], ["soon", "videos/kag-tihar/"], ["about", "about/"], ["404", "nope/"]];
const sizes = [["phone", 390, 844], ["desktop", 1366, 900]];
const browser = await chromium.launch();
for (const [sn, w, h] of sizes) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: sn === "phone" ? 2 : 1 });
  const page = await ctx.newPage();
  for (const [pn, p] of pages) {
    await page.goto(base + p, { waitUntil: "networkidle" }).catch(() => {});
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    await page.screenshot({ path: `${out}/${pn}-${sn}.png`, fullPage: true });
    console.log(pn, sn, "h-overflow:", overflow);
  }
  await ctx.close();
}
await browser.close();
