import { existsSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { describe, expect, it } from 'vitest';
import { album, home, posts, projects, site } from '../../src/lib/generated/content/index.js';

function generatedFile(url: string) {
  return path.join('static', url.replace(/^\//, ''));
}

function expectGeneratedImage(
  image: { src: string; srcset: string; width: number; height: number },
  role: string
) {
  expect(image.src).toMatch(
    new RegExp(`^/generated/media/${role}/[a-z0-9-]+\\.[a-f0-9]{12}\\.\\d+\\.webp$`)
  );
  expect(image.width).toBeGreaterThan(0);
  expect(image.height).toBeGreaterThan(0);
  expect(existsSync(generatedFile(image.src))).toBe(true);

  const candidates = image.srcset.split(', ');
  expect(candidates.length).toBeGreaterThan(1);
  for (const candidate of candidates) {
    const [url, width] = candidate.split(' ');
    expect(width).toMatch(/^\d+w$/);
    expect(existsSync(generatedFile(url))).toBe(true);
  }
}

describe('responsive media pipeline', () => {
  it('emits hashed responsive variants for Hero, covers, logos, portraits, and Album roles', () => {
    const postWithCover = posts.find((post) => post.coverImage);

    expect(postWithCover?.coverImage).toBeDefined();
    expectGeneratedImage(home.hero.images[0].responsive, 'hero');
    expectGeneratedImage(site.author.logoImage, 'logo');
    expectGeneratedImage(site.author.portraitImage, 'portrait');
    expectGeneratedImage(projects[0].coverImage, 'cover');
    if (postWithCover?.coverImage) expectGeneratedImage(postWithCover.coverImage, 'cover');
    expectGeneratedImage(album.photos[0].thumbnail, 'album-thumbnail');
    expectGeneratedImage(album.photos[0].lightbox, 'album-lightbox');
    expect(album.photos[0].thumbnail.src).not.toBe(album.photos[0].lightbox.src);
  });

  it('rewrites trusted Markdown images to responsive generated assets', () => {
    const post = posts.find(({ slug }) => slug === 'markdown-format-showcase');
    const project = projects.find(({ slug }) => slug === 'fashion-design');

    expect(post?.content).toMatch(/<img src="\/generated\/media\/content\//);
    expect(post?.content).toContain('srcset="/generated/media/content/');
    expect(post?.content).toContain('loading="lazy"');
    expect(project?.content).not.toContain('<img src="/home/');
  });

  it('publishes immutable caching for content-hashed generated media', () => {
    const headers = readFileSync('static/_headers', 'utf8');
    expect(headers).toMatch(
      /\/generated\/\*\s+Cache-Control: public, max-age=31536000, immutable/
    );
  });

  it('uses local SVG assets for every social icon', () => {
    for (const item of site.social) {
      expect(item.icon).toMatch(/^\/icons\/[a-z0-9-]+\.svg$/);
      expect(existsSync(generatedFile(item.icon))).toBe(true);
    }

    expect(readdirSync('static/icons').filter((file) => file.endsWith('.png'))).toEqual([]);
    expect(readdirSync('static/icons').sort()).toEqual([
      'design-system.svg',
      'github.svg',
      'instagram.svg',
      'linkedin.svg',
      'mail.svg',
      'rss.svg',
      'x.svg'
    ]);
  });

  it('generates hashed 1200 by 630 social images for the site and content pages', async () => {
    const images = [site.ogImage, posts[0].ogImage, projects[0].ogImage];

    for (const image of images) {
      expect(image).toMatch(/^\/generated\/og\/[a-z0-9-]+\.[a-f0-9]{12}\.png$/);
      const file = generatedFile(image);
      expect(existsSync(file)).toBe(true);
      await expect(sharp(file).metadata()).resolves.toMatchObject({ width: 1200, height: 630 });
    }
  });
});
