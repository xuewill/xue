import { describe, expect, it } from 'vitest';
import { existsSync } from 'node:fs';
import {
  getAlbumPage,
  getArchiveEntries,
  getPostPage,
  getProject,
  getProjectPage,
  getTagPage,
  postSummaries,
  projectSummaries,
  tagSummaries
} from '../../src/lib/server/content';

describe('server content boundary', () => {
  it('keeps content loads in server-only route modules', () => {
    for (const route of [
      'src/routes/+page',
      'src/routes/blog/+page',
      'src/routes/blog/[slug]/+page',
      'src/routes/home/[slug]/+page'
    ]) {
      expect(existsSync(`${route}.server.ts`)).toBe(true);
      expect(existsSync(`${route}.ts`)).toBe(false);
    }
  });

  it('exposes post summaries without compiled content or table-of-contents data', () => {
    expect(postSummaries.length).toBeGreaterThan(0);

    for (const post of postSummaries) {
      expect(post).not.toHaveProperty('content');
      expect(post).not.toHaveProperty('toc');
    }
  });

  it('exposes project summaries without compiled content or table-of-contents data', () => {
    expect(projectSummaries.length).toBeGreaterThan(0);

    for (const project of projectSummaries) {
      expect(project).not.toHaveProperty('content');
      expect(project).not.toHaveProperty('toc');
    }
  });

  it('keeps full HTML on the active article but sends only summaries for navigation', () => {
    const page = getPostPage('building-this-site');

    expect(page?.post.content).toContain('<p>');
    expect(page?.post.toc).toBeDefined();
    expect(page?.previous).not.toHaveProperty('content');
    expect(page?.previous).not.toHaveProperty('toc');
    expect(page?.next).not.toHaveProperty('content');
    expect(page?.next).not.toHaveProperty('toc');
  });

  it('returns undefined for unknown content slugs', () => {
    expect(getPostPage('missing-post')).toBeUndefined();
    expect(getProject('missing-project')).toBeUndefined();
  });

  it('resolves tags, series, projects, and Album works without sending related HTML', () => {
    const post = getPostPage('mixed-media-city-studies');
    const project = getProjectPage('art');
    const album = getAlbumPage();
    const tag = getTagPage('art');

    expect(tagSummaries.find(({ slug }) => slug === 'art')?.count).toBeGreaterThanOrEqual(2);
    expect(tag?.posts.map(({ slug }) => slug)).toContain('mixed-media-city-studies');
    expect(post?.relatedProjects.map(({ slug }) => slug)).toContain('art');
    expect(post?.relatedAlbum).toHaveLength(10);
    expect(project?.relatedPosts.map(({ slug }) => slug)).toContain('mixed-media-city-studies');
    expect(project?.relatedAlbum).toHaveLength(10);
    expect(album.photos[0].relatedPosts[0]).not.toHaveProperty('content');
    expect(album.photos[0].relatedProjects[0]).not.toHaveProperty('content');
    expect(post?.post.locations).toEqual([]);
    expect(project?.project.locations).toEqual([{ slug: 'taipei', label: 'Taipei' }]);
    expect(project?.project.roles).toEqual([{ slug: 'artist', label: 'Artist' }]);
    expect(project?.project.media).toEqual([{ slug: 'mixed-media', label: 'Mixed media' }]);
    expect(album.photos.find(({ id }) => id === 'lane-737')?.locations).toEqual([
      { slug: 'taipei', label: 'Taipei' }
    ]);
  });

  it('sorts series navigation by its explicit order', () => {
    const page = getPostPage('writing-in-markdown');

    expect(page?.seriesPosts.map(({ slug }) => slug)).toEqual([
      'building-this-site',
      'writing-in-markdown',
      'typed-content-media-pipeline'
    ]);
  });

  it('builds compact archive entries across all three content types', () => {
    const entries = getArchiveEntries();
    expect(entries).toHaveLength(21);
    expect(entries[0]).toMatchObject({
      kind: 'post',
      year: 2026,
      href: '/blog/typed-content-media-pipeline'
    });
    expect(entries).toContainEqual(
      expect.objectContaining({ kind: 'album', year: 2024, href: '/album#photo-fragments' })
    );
    expect(entries.every((entry) => !('content' in entry))).toBe(true);
  });
});
