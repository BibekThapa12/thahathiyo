// The tab icon is the header's LogoMark (थाहा's face), rendered to a static SVG at build time.
import type { APIRoute } from "astro";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { LogoMark } from "../components/art/scenes";

export const GET: APIRoute = () =>
  new Response(renderToStaticMarkup(createElement(LogoMark, { size: 120 })), { headers: { "Content-Type": "image/svg+xml" } });
