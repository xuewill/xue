import type { RequestHandler } from './$types';
import { posts } from '$lib/content/posts';
import { siteConfig } from '$lib/config/site';
import { absoluteUrl, escapeXml } from '$lib/server/xml';

export const prerender = true;

export const GET: RequestHandler = () => {
  const items = posts
    .map(
      (post) => `
    <item>
      <title>${escapeXml(post.title)}</title>
      <description>${escapeXml(post.description)}</description>
      <link>${escapeXml(absoluteUrl(siteConfig.url, `/blog/${post.slug}`))}</link>
      <guid isPermaLink="true">${escapeXml(absoluteUrl(siteConfig.url, `/blog/${post.slug}`))}</guid>
      <pubDate>${new Date(`${post.date}T00:00:00Z`).toUTCString()}</pubDate>
    </item>`
    )
    .join('');

  const body = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0">
  <channel>
    <title>${escapeXml(siteConfig.title)}</title>
    <description>${escapeXml(siteConfig.description)}</description>
    <link>${escapeXml(absoluteUrl(siteConfig.url, '/'))}</link>
    <language>${escapeXml(siteConfig.locale)}</language>${items}
  </channel>
</rss>`;

  return new Response(body, {
    headers: { 'content-type': 'application/rss+xml; charset=utf-8' }
  });
};
