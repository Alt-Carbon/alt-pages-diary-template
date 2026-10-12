// The notebook is one page; its sections and pieces are places in it, not addresses, so this is one entry.
import type { APIRoute } from "astro";
import { freshness, origin } from "../lib/content";

export const GET: APIRoute = async ({ url }) => {
  const base = origin(url);
  const fresh = await freshness();
  const urls: [string, string | undefined][] = [["/", fresh.date]];
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(([path, mod]) => `<url><loc>${base}${path}</loc>${mod ? `<lastmod>${mod}</lastmod>` : ""}</url>`).join("\n")}
</urlset>`;
  return new Response(xml, { headers: { "content-type": "application/xml; charset=utf-8" } });
};
