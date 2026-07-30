import type { RequestHandler } from './$types';
import { site as siteConfig } from '$lib/generated/content/index.js';

export const prerender = true;

export const GET: RequestHandler = () => {
  const sitemapUrl = new URL('/sitemap.xml', siteConfig.url);
  const body = `User-agent: *\nAllow: /\n\nSitemap: ${sitemapUrl}\n`;

  return new Response(body, {
    headers: { 'content-type': 'text/plain; charset=utf-8' }
  });
};
