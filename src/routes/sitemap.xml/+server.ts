import type { RequestHandler } from './$types';
import {
  album,
  posts,
  projects,
  site as siteConfig,
  tagConfig
} from '$lib/generated/content/index.js';
import { absoluteUrl, escapeXml } from '$lib/server/xml';

export const prerender = true;

function mostRecent(values: Array<string | undefined>): string | undefined {
  return values
    .filter((value): value is string => value !== undefined && /^\d{4}-\d{2}-\d{2}$/.test(value))
    .sort((a, b) => b.localeCompare(a))[0];
}

export const GET: RequestHandler = () => {
  const blogLastmod = mostRecent(posts.map((post) => post.updated ?? post.date));
  const projectLastmod = mostRecent(projects.map((project) => project.updated));
  const urls: Array<{ path: string; lastmod?: string }> = [
    { path: '/', lastmod: mostRecent([blogLastmod, projectLastmod, album.updated]) },
    { path: '/blog', lastmod: blogLastmod },
    { path: '/blog/tags', lastmod: blogLastmod },
    { path: '/album', lastmod: album.updated },
    ...tagConfig.tags
      .map((tag) => {
        const taggedPosts = posts.filter((post) => post.tags.includes(tag.slug));
        return {
          path: `/blog/tags/${tag.slug}`,
          lastmod: mostRecent(taggedPosts.map((post) => post.updated ?? post.date)),
          count: taggedPosts.length
        };
      })
      .filter(({ count }) => count > 0),
    ...posts.map((post) => ({
      path: `/blog/${post.slug}`,
      lastmod: post.updated ?? post.date
    })),
    ...projects.map((project) => ({
      path: `/home/${project.slug}`,
      lastmod: project.updated
    }))
  ];

  const body = `<?xml version="1.0" encoding="UTF-8" ?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    ({ path, lastmod }) =>
      `  <url><loc>${escapeXml(absoluteUrl(siteConfig.url, path))}</loc>${lastmod ? `<lastmod>${lastmod}</lastmod>` : ''}</url>`
  )
  .join('\n')}
</urlset>`;

  return new Response(body, {
    headers: { 'content-type': 'application/xml; charset=utf-8' }
  });
};
