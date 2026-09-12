import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { mkdirSync, readFileSync, rmSync } from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { parse } from 'yaml';
import {
  album,
  home,
  posts,
  projects,
  site,
  tagConfig
} from '../../src/lib/generated/content/index.js';
import {
  albumConfigSchema,
  calendarDateInTimeZone,
  findDuplicateValues,
  homeConfigSchema,
  isFutureCalendarDate,
  isValidCalendarDate,
  isValidContentSlug,
  postTagsSchema,
  projectFrontmatterSchema,
  prepareCollections,
  readAlbumPhotoMetadata,
  siteConfigSchema,
  tagConfigSchema,
  contentMetadataSchema,
  validateContentMetadata,
  validateContentRelations,
  validateHeroAlbumBackdropDimensions,
  validateHeroImageDimensions
} from '../../velite.config';

const sketchbookFixtureDirectory = path.join('static', 'test-fixtures', 'sketchbook');
const transparentFixture = path.join(sketchbookFixtureDirectory, 'transparent.png');
const undersizedBookFixture = path.join(sketchbookFixtureDirectory, 'undersized-book.png');

beforeAll(async () => {
  mkdirSync(sketchbookFixtureDirectory, { recursive: true });
  await sharp({
    create: { width: 1280, height: 720, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } }
  })
    .png()
    .toFile(transparentFixture);
  await sharp({
    create: { width: 1280, height: 720, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } }
  })
    .composite([
      {
        input: Buffer.from(
          '<svg width="320" height="240"><rect width="320" height="240" fill="#f4efe2"/></svg>'
        ),
        left: 400,
        top: 200
      }
    ])
    .png()
    .toFile(undersizedBookFixture);
});

afterAll(() => {
  rmSync(path.join('static', 'test-fixtures'), { recursive: true, force: true });
});

describe('Velite content layer', () => {
  it('generates sorted post and project collections from file-based slugs', () => {
    expect(posts.map(({ slug }) => slug)).toEqual([
      'typed-content-media-pipeline',
      'travel-sketchbook-process',
      'mixed-media-city-studies',
      'markdown-format-showcase',
      'building-this-site',
      'writing-in-markdown'
    ]);
    expect(projects.map(({ slug }) => slug)).toEqual([
      'wemail',
      'art'
    ]);
  });

  it('generates matching GitHub-style heading anchors and TOC entries', () => {
    const showcase = posts.find(({ slug }) => slug === 'markdown-format-showcase');

    expect(showcase?.toc).toContainEqual({ id: 'text-styles', label: 'Text styles', level: 2 });
    expect(showcase?.content).toContain('<h2 id="text-styles">Text styles</h2>');
  });

  it('highlights fenced code blocks during the Velite build', () => {
    const showcase = posts.find(({ slug }) => slug === 'markdown-format-showcase');

    expect(showcase?.content).toContain('data-rehype-pretty-code-figure');
    expect(showcase?.content).toContain('data-language="js"');
    expect(showcase?.content).toContain('data-theme="github-light github-dark"');
    expect(showcase?.content).toContain('--shiki-light:');
    expect(showcase?.content).toContain('--shiki-dark:');
  });

  it('loads site, home, and album configuration from YAML', () => {
    expect(site.url).toBe('https://willxue.com');
    expect(site.navigation.map(({ label }) => label)).toEqual(['blog', 'archive', 'album']);
    expect(home.hero).not.toHaveProperty('shell');
    expect(home.hero.albumBackdrops.light.src).toBe(
      '/home/sketchbook/album-backdrop-light.png'
    );
    expect(home.hero.albumBackdrops.dark.src).toBe(
      '/home/sketchbook/album-backdrop-dark.png'
    );
    expect(home.hero.images.map(({ id, date }) => ({ id, date }))).toEqual([
      { id: 'changsha-orange-isle-watercolor', date: '2022-01-01' },
      { id: 'dali-ancient-town-watercolor', date: '2023-04-09' },
      { id: 'erhai-distilled-scene-2023-04-11', date: '2023-04-11' },
      {
        id: 'lijiang-ancient-town-gathered-memory-2023-04-11',
        date: '2023-04-11'
      },
      { id: 'pudacuo-chinese-ink-2023-04-13', date: '2023-04-13' },
      {
        id: 'tiger-leaping-gorge-chinese-ink-2023-04-13',
        date: '2023-04-13'
      },
      { id: 'napahai-chinese-ink-2023-04-14', date: '2023-04-14' },
      { id: 'west-lake-watercolor', date: '2026-09-18' }
    ]);
    expect(album.photos).toHaveLength(10);
    expect(tagConfig.tags.map(({ slug }) => slug)).toEqual([
      'engineering',
      'design',
      'art',
      'field-notes',
      'publishing',
      'reference'
    ]);
  });

  it('reads album dimensions and camera metadata from image EXIF data', () => {
    expect(album.photos[0]).toMatchObject({
      width: 1179,
      height: 1600,
      camera: 'NIKON Z 50',
      lens: 'NIKKOR Z MC 50mm f/2.8',
      focalLength: '50 mm',
      aperture: 'ƒ/3',
      shutterSpeed: '1/40 s',
      iso: '200'
    });
    expect(album.photos[8]).toMatchObject({
      camera: 'Apple iPhone 13',
      focalLength: '5.1 mm',
      aperture: 'ƒ/1.6',
      iso: '250'
    });
  });

  it('generates the browser manifest from the YAML source', () => {
    const manifest = JSON.parse(readFileSync('static/site.webmanifest', 'utf8'));

    expect(manifest).toMatchObject({
      name: site.manifest.name,
      short_name: site.manifest.shortName,
      theme_color: site.manifest.themeColor
    });
  });

  it('rejects invalid dates, unsafe slugs, and empty post tags', () => {
    expect(isValidCalendarDate('2026-07-30')).toBe(true);
    expect(isValidCalendarDate('2026-02-30')).toBe(false);
    expect(isValidContentSlug('valid-article-2')).toBe(true);
    expect(isValidContentSlug('../unsafe_article')).toBe(false);
    expect(postTagsSchema.safeParse(['notes']).success).toBe(true);
    expect(postTagsSchema.safeParse(['Notes']).success).toBe(false);
    expect(postTagsSchema.safeParse(['  ']).success).toBe(false);
    expect(postTagsSchema.safeParse([]).success).toBe(false);
  });

  it('requires real Hero dates and emits chronological page-turn order', async () => {
    const input = parse(readFileSync('src/content/config/home.yaml', 'utf8'));
    const reversedImages = [...input.hero.images].reverse();
    const invalidDate = await homeConfigSchema.safeParseAsync({
      ...input,
      hero: {
        ...input.hero,
        images: reversedImages.map((image, index) =>
          index === 0 ? { ...image, date: '2026-02-30' } : image
        )
      }
    });
    const chronological = await homeConfigSchema.safeParseAsync({
      ...input,
      hero: { ...input.hero, images: reversedImages }
    });
    const sameDate = await homeConfigSchema.safeParseAsync({
      ...input,
      hero: {
        ...input.hero,
        images: reversedImages.map((image) => ({ ...image, date: '2026-01-01' }))
      }
    });

    expect(invalidDate.success).toBe(false);
    expect(chronological.success).toBe(true);
    expect(sameDate.success).toBe(true);
    if (chronological.success) {
      expect(chronological.data.hero.images.map(({ date }) => date)).toEqual([
        '2022-01-01',
        '2023-04-09',
        '2023-04-11',
        '2023-04-11',
        '2023-04-13',
        '2023-04-13',
        '2023-04-14',
        '2026-09-18'
      ]);
    }
    if (sameDate.success) {
      expect(sameDate.data.hero.images.map(({ id }) => id)).toEqual([
        'changsha-orange-isle-watercolor',
        'dali-ancient-town-watercolor',
        'erhai-distilled-scene-2023-04-11',
        'lijiang-ancient-town-gathered-memory-2023-04-11',
        'napahai-chinese-ink-2023-04-14',
        'pudacuo-chinese-ink-2023-04-13',
        'tiger-leaping-gorge-chinese-ink-2023-04-13',
        'west-lake-watercolor'
      ]);
    }
  }, 15_000);

  it('requires future-dated published posts to remain drafts', () => {
    expect(isFutureCalendarDate('2026-07-31', '2026-07-30')).toBe(true);
    expect(isFutureCalendarDate('2026-07-30', '2026-07-30')).toBe(false);
    expect(isFutureCalendarDate('not-a-date', '2026-07-30')).toBe(false);
    expect(calendarDateInTimeZone('Asia/Shanghai', new Date('2026-07-29T16:30:00Z'))).toBe(
      '2026-07-30'
    );

    expect(() =>
      prepareCollections(
        [{ slug: 'future-post', date: '2026-07-31', draft: false }],
        [],
        false,
        '2026-07-30'
      )
    ).toThrow(/future-post.*future date 2026-07-31.*draft: true/);
  });

  it('rejects unknown YAML fields at top-level and nested boundaries', async () => {
    const topLevel = await siteConfigSchema.safeParseAsync({ ...site, unexpected: true });
    const nested = await siteConfigSchema.safeParseAsync({
      ...site,
      author: { ...site.author, nickname: 'Will' }
    });
    const invalidTimezone = await siteConfigSchema.safeParseAsync({
      ...site,
      timezone: 'Mars/Olympus_Mons'
    });

    expect(topLevel.success).toBe(false);
    expect(nested.success).toBe(false);
    expect(invalidTimezone.success).toBe(false);
  });

  it('rejects duplicate Hero and Album identifiers', async () => {
    const duplicateHome = structuredClone(home);
    duplicateHome.hero.images[1].id = duplicateHome.hero.images[0].id;

    const albumInputs = album.photos.map(
      ({ width: _width, height: _height, camera: _camera, lens: _lens,
        focalLength: _focalLength, aperture: _aperture, shutterSpeed: _shutterSpeed,
        iso: _iso, ...photo }) => photo
    );
    albumInputs[1].id = albumInputs[0].id;

    const [homeResult, albumResult] = await Promise.all([
      homeConfigSchema.safeParseAsync(duplicateHome),
      albumConfigSchema.safeParseAsync({ updated: album.updated, photos: albumInputs })
    ]);

    expect(homeResult.success).toBe(false);
    expect(albumResult.success).toBe(false);
    expect(findDuplicateValues(['one', 'two', 'one', 'two'])).toEqual(['one', 'two']);
  }, 15_000);

  it('validates declared Hero dimensions against the source file', async () => {
    const image = home.hero.images[0];

    await expect(
      validateHeroAlbumBackdropDimensions(home.hero.albumBackdrops.light)
    ).resolves.toBeUndefined();
    await expect(
      validateHeroAlbumBackdropDimensions(home.hero.albumBackdrops.dark)
    ).resolves.toBeUndefined();
    await expect(validateHeroImageDimensions(image)).resolves.toBeUndefined();
    await expect(
      validateHeroImageDimensions({ ...image, width: image.width + 1 })
    ).rejects.toThrow(/declares .* but the source is .* update width and height/);
    await expect(
      validateHeroImageDimensions({
        src: '/home/projects/wemail/cover.jpg',
        width: 1600,
        height: 900
      })
    ).rejects.toThrow(/full-book image must have an alpha channel/);
    await expect(
      validateHeroImageDimensions({
        src: '/test-fixtures/sketchbook/transparent.png',
        width: 1280,
        height: 720
      })
    ).rejects.toThrow(/full-book image cannot be fully transparent/);
    await expect(
      validateHeroImageDimensions({
        src: '/test-fixtures/sketchbook/undersized-book.png',
        width: 1280,
        height: 720
      })
    ).rejects.toThrow(/full-book bounds are/);
  });

  it('reports invalid Album image data instead of emitting incomplete metadata', async () => {
    await expect(readAlbumPhotoMetadata({ src: '/site.webmanifest' })).rejects.toThrow(
      /could not read (?:a valid image|EXIF metadata)/
    );
  });

  it('sorts collections and removes drafts for production output', () => {
    const postFixtures = [
      { date: '2026-01-01', draft: false },
      { date: '2026-03-01', draft: true },
      { date: '2026-02-01', draft: false }
    ];
    const projectFixtures = [
      { order: 2, startYear: 2025, draft: false },
      { order: 3, startYear: 2026, draft: true },
      { order: 1, startYear: 2025, draft: false }
    ];

    prepareCollections(postFixtures, projectFixtures, true);

    expect(postFixtures).toEqual([
      { date: '2026-02-01', draft: false },
      { date: '2026-01-01', draft: false }
    ]);
    expect(projectFixtures).toEqual([
      { order: 1, startYear: 2025, draft: false },
      { order: 2, startYear: 2025, draft: false }
    ]);
  });

  it('rejects duplicate project order values before sorting', () => {
    expect(() =>
      prepareCollections(
        [{ date: '2026-01-01', draft: false }],
        [
          { slug: 'first-project', order: 1, startYear: 2026, draft: false },
          { slug: 'second-project', order: 1, startYear: 2025, draft: false }
        ],
        false
      )
    ).toThrow(/Project order values must be unique.*first-project, second-project/);
  });

  it('rejects unknown tags, invalid relations, and repeated series order values', () => {
    const tags = [{ slug: 'engineering' }];
    const projectsFixture = [
      {
        slug: 'project-one',
        draft: false,
        relatedPosts: [],
        relatedAlbum: [],
        locations: [],
        roles: [],
        media: []
      }
    ];
    const photos = [
      {
        id: 'photo-one',
        relatedPosts: [],
        relatedProjects: [],
        locations: [],
        media: []
      }
    ];
    const basePost = {
      slug: 'post-one',
      date: '2026-07-20',
      updated: '2026-07-21',
      draft: false,
      tags: ['engineering'],
      series: { slug: 'site-notes', title: 'Site Notes', order: 1 },
      related: [],
      relatedProjects: ['project-one'],
      relatedAlbum: ['photo-one'],
      locations: []
    };

    expect(() =>
      validateContentRelations(
        [{ ...basePost, tags: ['unknown-tag'] }],
        projectsFixture,
        photos,
        tags,
        '2026-07-30'
      )
    ).toThrow(/unknown tag: unknown-tag/);

    expect(() =>
      validateContentRelations(
        [{ ...basePost, related: ['missing-post'] }],
        projectsFixture,
        photos,
        tags,
        '2026-07-30'
      )
    ).toThrow(/references missing post: missing-post/);

    expect(() =>
      validateContentRelations(
        [
          basePost,
          {
            ...basePost,
            slug: 'post-two',
            relatedProjects: [],
            relatedAlbum: []
          }
        ],
        projectsFixture,
        photos,
        tags,
        '2026-07-30'
      )
    ).toThrow(/Series site-notes repeats order 1/);
  });

  it('requires unique stable tag slugs', async () => {
    const duplicateTags = {
      tags: [tagConfig.tags[0], { ...tagConfig.tags[0], label: 'Duplicate' }]
    };

    await expect(tagConfigSchema.safeParseAsync(duplicateTags)).resolves.toMatchObject({
      success: false
    });
  });

  it('validates taxonomy definitions and content references', async () => {
    const metadata = {
      locations: [{ slug: 'taipei', label: 'Taipei' }],
      roles: [{ slug: 'artist', label: 'Artist' }],
      media: [{ slug: 'mixed-media', label: 'Mixed media' }]
    };
    await expect(contentMetadataSchema.safeParseAsync(metadata)).resolves.toMatchObject({
      success: true
    });
    await expect(
      contentMetadataSchema.safeParseAsync({
        ...metadata,
        locations: [{ ...metadata.locations[0] }, { ...metadata.locations[0] }]
      })
    ).resolves.toMatchObject({ success: false });
    expect(() =>
      validateContentMetadata(
        [
          {
            slug: 'post',
            date: '2026-01-01',
            draft: false,
            tags: [],
            related: [],
            relatedProjects: [],
            relatedAlbum: [],
            locations: ['unknown']
          }
        ],
        [],
        [],
        metadata
      )
    ).toThrow(/unknown locations value/);
  });

  it('requires coherent project year ranges and status', async () => {
    const project = {
      title: 'Fixture project',
      description: 'A project schema fixture.',
      startYear: 2026,
      endYear: 2026,
      status: 'completed',
      category: 'design',
      locations: [],
      roles: ['designer'],
      media: ['mixed-media'],
      cover: '/seal.png',
      order: 1,
      draft: true,
      relatedPosts: [],
      relatedAlbum: []
    } as const;

    await expect(projectFrontmatterSchema.safeParseAsync(project)).resolves.toMatchObject({
      success: true
    });
    await expect(
      projectFrontmatterSchema.safeParseAsync({ ...project, endYear: 2025 })
    ).resolves.toMatchObject({ success: false });
    await expect(
      projectFrontmatterSchema.safeParseAsync({ ...project, status: 'ongoing' })
    ).resolves.toMatchObject({ success: false });
  });
});
