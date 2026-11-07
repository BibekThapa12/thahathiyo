// @ts-check
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";

// The main site is https://thahathiyo.vercel.app (Vercel builds it with no env vars, so that is the default).
// The GitHub Pages copy sets SITE_URL / BASE_PATH in its workflow. Custom domain later: set SITE_URL=https://thahathiyo.com.
const site = process.env.SITE_URL || "https://thahathiyo.vercel.app";
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
