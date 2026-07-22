import type { RequestHandler } from './$types';
import { posts } from '$lib/content/posts';
import { projects } from '$lib/content/projects';
import { siteConfig } from '$lib/config/site';

export const prerender = true;

export const GET: RequestHandler = () => {
  const paths = [
    '/',
    '/blog',
    ...posts.map((post) => `/blog/${post.slug}`),
    ...projects.map((project) => `/home/${project.slug}`)
  ];

  const body = `<?xml version="1.0" encoding="UTF-8" ?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${paths.map((path) => `  <url><loc>${siteConfig.url}${path}</loc></url>`).join('\n')}
</urlset>`;

  return new Response(body, {
    headers: { 'content-type': 'application/xml; charset=utf-8' }
  });
};
