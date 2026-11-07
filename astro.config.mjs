// @ts-check
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";

// SITE_URL / BASE_PATH are set by the GitHub Pages workflow (or your host).
// Custom domain later (e.g. thahathiyo.com): SITE_URL=https://thahathiyo.com BASE_PATH=/
const site = process.env.SITE_URL || "https://thahathiyo.github.io";
const base = process.env.BASE_PATH || "/";

export default defineConfig({
  site,
  base,
  output: "static",
  trailingSlash: "ignore",
  // forwarding pages (about, videos index, topics) stay out of the sitemap
  integrations: [react(), sitemap({ filter: (p) => !/\/(about|videos|topics\/[a-z]+)\/$/.test(p) })],
  build: { inlineStylesheets: "auto" },
});
