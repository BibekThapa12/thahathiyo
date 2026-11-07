// Base-aware links so the site works at https://user.github.io/repo/ and at a custom domain root.
const BASE = import.meta.env.BASE_URL.replace(/\/?$/, "/");

export const u = (p = "") => BASE + p.replace(/^\//, "");

export const abs = (p: string, site: URL | undefined) => {
  if (/^https?:/.test(p)) return p;
  return new URL(u(p), site ?? "https://thahathiyo.github.io").href;
};
