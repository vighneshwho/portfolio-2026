import type { APIRoute } from 'astro';

export const GET: APIRoute = ({ site }) => {
  const base = import.meta.env.BASE_URL;
  return new Response(`User-agent: *\nAllow: /\n\nSitemap: ${new URL(`${base.replace(/\/$/, '')}/sitemap-index.xml`, site)}\n`, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
