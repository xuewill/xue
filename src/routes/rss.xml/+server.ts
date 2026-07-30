import type { RequestHandler } from './$types';
import { posts, site as siteConfig, tagConfig } from '$lib/generated/content/index.js';
import { absoluteUrl, escapeXml } from '$lib/server/xml';

export const prerender = true;

export const GET: RequestHandler = () => {
  const tagLabels = new Map(tagConfig.tags.map((tag) => [tag.slug, tag.label]));
  const items = posts
    .map(
      (post) => `
    <item>
      <title>${escapeXml(post.title)}</title>
      <description>${escapeXml(post.description)}</description>
      <link>${escapeXml(absoluteUrl(siteConfig.url, `/blog/${post.slug}`))}</link>
      <guid isPermaLink="true">${escapeXml(absoluteUrl(siteConfig.url, `/blog/${post.slug}`))}</guid>
      <pubDate>${new Date(`${post.date}T00:00:00Z`).toUTCString()}</pubDate>
      ${post.tags
        .map((tag) => `<category>${escapeXml(tagLabels.get(tag) ?? tag)}</category>`)
        .join('\n      ')}
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
