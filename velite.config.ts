import { createHash } from 'node:crypto';
import { existsSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import exifr from 'exifr';
import rehypePrettyCode from 'rehype-pretty-code';
import rehypeSlug from 'rehype-slug';
import sharp from 'sharp';
import { defineCollection, defineConfig, s } from 'velite';

const root = process.cwd();
const staticRoot = path.join(root, 'static');
const generatedMediaRoot = path.join(staticRoot, 'generated', 'media');
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const unknownMetadata = '—';
const mediaPipelineVersion = 1;
type SharpMetadata = Awaited<ReturnType<ReturnType<typeof sharp>['metadata']>>;

export interface ResponsiveImage {
  src: string;
  srcset: string;
  width: number;
  height: number;
}

interface ResponsiveImageSpec {
  role: 'album-lightbox' | 'album-thumbnail' | 'content' | 'cover' | 'hero' | 'logo' | 'portrait';
  widths: readonly number[];
  quality: number;
}

interface OgImageInput {
  slug: string;
  title: string;
  eyebrow: string;
  meta: string;
}

interface HastNode {
  tagName?: string;
  properties?: Record<string, unknown>;
  children?: HastNode[];
}

interface TocEntry {
  title: string;
  url: string;
  items: TocEntry[];
}

interface ContentHeading {
  id: string;
  label: string;
  level: number;
}

interface AlbumPhotoMetadata {
  width: number;
  height: number;
  camera: string;
  lens: string;
  focalLength: string;
  aperture: string;
  shutterSpeed: string;
  iso: string;
}

interface AlbumPhotoInput {
  src: string;
}

interface HeroImageInput extends AlbumPhotoInput {
  width: number;
  height: number;
}

interface ExifMetadata {
  Make?: string;
  Model?: string;
  LensModel?: string;
  FocalLength?: number;
  FNumber?: number;
  ExposureTime?: number;
  ISO?: number;
}

const responsiveImageSpecs = {
  hero: { role: 'hero', widths: [480, 768, 1024, 1280], quality: 80 },
  albumThumbnail: { role: 'album-thumbnail', widths: [320, 480, 640], quality: 76 },
  albumLightbox: { role: 'album-lightbox', widths: [960, 1280, 1600], quality: 84 },
  cover: { role: 'cover', widths: [320, 640, 960, 1200], quality: 78 },
  logo: { role: 'logo', widths: [48, 96, 144], quality: 88 },
  portrait: { role: 'portrait', widths: [160, 320, 640], quality: 78 },
  content: { role: 'content', widths: [480, 768, 1200, 1600], quality: 82 }
} as const satisfies Record<string, ResponsiveImageSpec>;

const responsiveImageCache = new Map<string, Promise<ResponsiveImage>>();
const ogImageCache = new Map<string, Promise<string>>();

function resolveStaticAssetTarget(value: string): string | undefined {
  if (!value.startsWith('/')) return undefined;

  const target = path.resolve(staticRoot, `.${value}`);
  const relative = path.relative(staticRoot, target);
  if (relative.startsWith('..') || path.isAbsolute(relative)) return undefined;
  return target;
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

export function isValidCalendarDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;

  const parsed = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

export function isFutureCalendarDate(
  value: string,
  today = new Date().toISOString().slice(0, 10)
): boolean {
  return isValidCalendarDate(value) && value > today;
}

export function isValidTimeZone(value: string): boolean {
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: value }).format();
    return true;
  } catch {
    return false;
  }
}

export function calendarDateInTimeZone(timeZone: string, date = new Date()): string {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  return `${values.year}-${values.month}-${values.day}`;
}

export function isValidContentSlug(value: string): boolean {
  return slugPattern.test(value);
}

export function findDuplicateValues<T>(values: readonly T[]): T[] {
  const seen = new Set<T>();
  const duplicates = new Set<T>();

  for (const value of values) {
    if (seen.has(value)) duplicates.add(value);
    seen.add(value);
  }

  return [...duplicates];
}

export async function readStaticImageDimensions(
  src: string
): Promise<{ width: number; height: number }> {
  const target = resolveStaticAssetTarget(src);
  if (!target || !existsSync(target)) {
    throw new Error(`${src}: image file does not exist under static/`);
  }

  let image: SharpMetadata;
  try {
    image = await sharp(target).metadata();
  } catch (error) {
    throw new Error(`${src}: could not read a valid image (${errorMessage(error)})`, {
      cause: error
    });
  }

  if (!image.width || !image.height) {
    throw new Error(`${src}: could not read image dimensions; replace it with a valid image`);
  }

  return { width: image.width, height: image.height };
}

function fallbackResponsiveImage(src: string): ResponsiveImage {
  return { src, srcset: '', width: 1, height: 1 };
}

function responsiveImageFilesExist(image: ResponsiveImage): boolean {
  const urls = [image.src, ...image.srcset.split(', ').map((candidate) => candidate.split(' ')[0])];
  return urls.every((url) => {
    const target = resolveStaticAssetTarget(url);
    return target !== undefined && existsSync(target);
  });
}

export async function generateResponsiveImage(
  src: string,
  spec: ResponsiveImageSpec
): Promise<ResponsiveImage> {
  const cacheKey = `${src}:${JSON.stringify(spec)}`;
  const cached = responsiveImageCache.get(cacheKey);
  if (cached) {
    const image = await cached;
    if (responsiveImageFilesExist(image)) return image;
    responsiveImageCache.delete(cacheKey);
  }

  const task = (async () => {
    const target = resolveStaticAssetTarget(src);
    if (!target || !existsSync(target)) {
      throw new Error(`${src}: image file does not exist under static/`);
    }

    const [source, dimensions] = await Promise.all([
      readFile(target),
      readStaticImageDimensions(src)
    ]);
    const widths = [
      ...new Set(
        spec.widths
          .filter((width) => Number.isInteger(width) && width > 0)
          .map((width) => Math.min(width, dimensions.width))
      )
    ].sort((a, b) => a - b);

    if (widths.length === 0) widths.push(dimensions.width);

    const sourceHash = createHash('sha256')
      .update(source)
      .update(
        JSON.stringify({
          version: mediaPipelineVersion,
          role: spec.role,
          widths,
          quality: spec.quality
        })
      )
      .digest('hex')
      .slice(0, 12);
    const basename = path.parse(target).name.replace(/[^a-z0-9-]+/gi, '-').toLowerCase();
    const outputDirectory = path.join(generatedMediaRoot, spec.role);
    await mkdir(outputDirectory, { recursive: true });

    const variants = await Promise.all(
      widths.map(async (width) => {
        const filename = `${basename}.${sourceHash}.${width}.webp`;
        const output = path.join(outputDirectory, filename);
        const buffer = await sharp(source)
          .resize({ width, withoutEnlargement: true })
          .webp({ quality: spec.quality, effort: 4 })
          .toBuffer();
        await writeFile(output, buffer);
        return {
          src: `/generated/media/${spec.role}/${filename}`,
          width
        };
      })
    );

    return {
      src: variants.at(-1)?.src ?? src,
      srcset: variants.map((variant) => `${variant.src} ${variant.width}w`).join(', '),
      width: dimensions.width,
      height: dimensions.height
    };
  })();

  responsiveImageCache.set(cacheKey, task);
  task.catch(() => responsiveImageCache.delete(cacheKey));
  return task;
}

function escapeSvgText(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

function wrapOgTitle(title: string): string[] {
  const words = title.trim().split(/\s+/);
  const lines: string[] = [];

  for (const word of words) {
    const current = lines.at(-1);
    if (!current || current.length + word.length + 1 > 28) lines.push(word);
    else lines[lines.length - 1] = `${current} ${word}`;
  }

  if (lines.length <= 3) return lines;
  return [...lines.slice(0, 2), `${lines.slice(2).join(' ').slice(0, 25).trim()}…`];
}

export async function generateOgImage(input: OgImageInput): Promise<string> {
  const cacheKey = JSON.stringify(input);
  const cached = ogImageCache.get(cacheKey);
  if (cached) {
    const url = await cached;
    const target = resolveStaticAssetTarget(url);
    if (target && existsSync(target)) return url;
    ogImageCache.delete(cacheKey);
  }

  const task = (async () => {
    const hash = createHash('sha256')
      .update(JSON.stringify({ version: 1, ...input }))
      .digest('hex')
      .slice(0, 12);
    const slug = input.slug.replace(/[^a-z0-9-]+/gi, '-').toLowerCase();
    const filename = `${slug}.${hash}.png`;
    const outputDirectory = path.join(staticRoot, 'generated', 'og');
    const output = path.join(outputDirectory, filename);
    const lines = wrapOgTitle(input.title);
    const title = lines
      .map(
        (line, index) =>
          `<text x="92" y="${260 + index * 92}" fill="#141413" font-family="Georgia, serif" font-size="76" font-weight="600">${escapeSvgText(line)}</text>`
      )
      .join('');
    const svg = `
      <svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
        <rect width="1200" height="630" fill="#f5f4ed"/>
        <path d="M0 72H1200" stroke="#1b365d" stroke-width="3" stroke-dasharray="3 9"/>
        <path d="M92 166H1108" stroke="#d8d5c9"/>
        <text x="92" y="126" fill="#1b365d" font-family="Arial, sans-serif" font-size="22" letter-spacing="5">${escapeSvgText(input.eyebrow.toUpperCase())}</text>
        ${title}
        <text x="92" y="566" fill="#6b6a64" font-family="Arial, sans-serif" font-size="22" letter-spacing="3">${escapeSvgText(input.meta.toUpperCase())}</text>
        <text x="1108" y="566" fill="#1b365d" font-family="Georgia, serif" font-size="34" font-style="italic" text-anchor="end">Will Xue</text>
      </svg>`;

    await mkdir(outputDirectory, { recursive: true });
    await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toFile(output);
    return `/generated/og/${filename}`;
  })();

  ogImageCache.set(cacheKey, task);
  task.catch(() => ogImageCache.delete(cacheKey));
  return task;
}

function collectResponsiveImageNodes(node: HastNode, output: HastNode[]): void {
  if (node.tagName === 'img' && node.properties) output.push(node);
  for (const child of node.children ?? []) collectResponsiveImageNodes(child, output);
}

function rehypeResponsiveImages() {
  return async (tree: HastNode) => {
    const nodes: HastNode[] = [];
    collectResponsiveImageNodes(tree, nodes);

    await Promise.all(
      nodes.map(async (node) => {
        const src = node.properties?.src;
        if (typeof src !== 'string' || !src.startsWith('/')) return;

        const image = await generateResponsiveImage(src, responsiveImageSpecs.content);
        node.properties = {
          ...node.properties,
          src: image.src,
          srcSet: image.srcset,
          sizes: '(max-width: 800px) calc(100vw - 40px), 760px',
          width: image.width,
          height: image.height,
          loading: 'lazy',
          decoding: 'async'
        };
      })
    );
  };
}

export async function validateHeroImageDimensions(image: HeroImageInput): Promise<void> {
  const actual = await readStaticImageDimensions(image.src);
  if (image.width === actual.width && image.height === actual.height) return;

  throw new Error(
    `${image.src}: declares ${image.width}x${image.height}, but the source is ${actual.width}x${actual.height}; update width and height`
  );
}

export function validateUniqueProjectOrders(
  projects: readonly { order: number; slug?: string }[]
): void {
  const duplicateOrders = findDuplicateValues(projects.map(({ order }) => order));
  if (duplicateOrders.length === 0) return;

  const details = duplicateOrders
    .map((order) => {
      const names = projects
        .filter((project) => project.order === order)
        .map((project) => project.slug ?? '(unknown project)')
        .join(', ');
      return `${order} (${names})`;
    })
    .join('; ');

  throw new Error(`Project order values must be unique; duplicates: ${details}`);
}

function staticAsset() {
  return s.string().min(1).transform((value, { addIssue }) => {
    const target = resolveStaticAssetTarget(value);

    if (!target) {
      addIssue({
        fatal: true,
        code: 'custom',
        message: `Invalid static asset path: ${value}; use an absolute path inside static/`
      });
    } else if (!existsSync(target)) {
      addIssue({
        fatal: true,
        code: 'custom',
        message: `Missing static asset: ${value}; add the file under static/ or update the path`
      });
    }

    return value;
  });
}

function calendarDate() {
  return s.string().transform((value, { addIssue }) => {
    if (!isValidCalendarDate(value)) {
      addIssue({
        fatal: true,
        code: 'custom',
        message: 'Expected a real YYYY-MM-DD calendar date; correct the frontmatter date'
      });
    }

    return value;
  });
}

function contentSlug() {
  return s.path().transform((value, { addIssue }) => {
    const slug = value.split('/').at(-1) ?? '';
    if (!isValidContentSlug(slug)) {
      addIssue({
        fatal: true,
        code: 'custom',
        message: `Invalid content slug: ${slug}; rename the file using lowercase kebab-case`
      });
    }
    return slug;
  });
}

function referenceSlug() {
  return s.string().regex(slugPattern, 'Expected a lowercase kebab-case slug');
}

const referenceList = () => s.array(referenceSlug()).default([]);

const requiredReferenceList = () => s.array(referenceSlug()).min(1);

const taxonomyDefinition = s
  .object({
    slug: referenceSlug(),
    label: s.string().min(1)
  })
  .strict();

function validateUniqueTaxonomyDefinitions(
  group: string,
  values: readonly { slug: string }[],
  addIssue: (issue: { code: 'custom'; path: (string | number)[]; message: string }) => void
): void {
  const duplicates = new Set(findDuplicateValues(values.map(({ slug }) => slug)));
  values.forEach((value, index) => {
    if (!duplicates.has(value.slug)) return;
    addIssue({
      code: 'custom',
      path: [group, index, 'slug'],
      message: `Duplicate ${group} slug: ${value.slug}`
    });
  });
}

function projectYearLabel(project: {
  startYear: number;
  endYear?: number;
  status: 'completed' | 'ongoing';
}): string {
  if (project.status === 'ongoing') return `${project.startYear}–present`;
  return project.endYear === project.startYear
    ? project.startYear.toString()
    : `${project.startYear}–${project.endYear}`;
}

const seriesSchema = s
  .object({
    slug: referenceSlug(),
    title: s.string().min(1),
    order: s.number().int().positive()
  })
  .strict();

function flattenToc(items: TocEntry[], level = 2): ContentHeading[] {
  return items.flatMap((item) => [
    { id: item.url.replace(/^#/, ''), label: item.title, level },
    ...flattenToc(item.items, Math.min(level + 1, 6))
  ]);
}

export function prepareCollections<
  TPost extends { date: string; draft: boolean; slug?: string },
  TProject extends { order: number; startYear: number; draft: boolean }
>(
  posts: TPost[],
  projects: TProject[],
  production: boolean,
  today = new Date().toISOString().slice(0, 10)
): void {
  validateUniqueProjectOrders(projects);
  for (const post of posts) {
    if (post.draft || !isFutureCalendarDate(post.date, today)) continue;
    throw new Error(
      `Published post ${post.slug ?? '(unknown post)'} uses future date ${post.date}; set draft: true or use ${today} or earlier`
    );
  }
  posts.sort((a, b) => b.date.localeCompare(a.date));
  projects.sort((a, b) => a.order - b.order || b.startYear - a.startYear);

  if (!production) return;

  for (let index = posts.length - 1; index >= 0; index -= 1) {
    if (posts[index].draft) posts.splice(index, 1);
  }
  for (let index = projects.length - 1; index >= 0; index -= 1) {
    if (projects[index].draft) projects.splice(index, 1);
  }
}

interface RelationPost {
  slug: string;
  date: string;
  updated?: string;
  draft: boolean;
  tags: string[];
  series?: { slug: string; title: string; order: number };
  related: string[];
  relatedProjects: string[];
  relatedAlbum: string[];
  locations: string[];
}

interface RelationProject {
  slug: string;
  draft: boolean;
  relatedPosts: string[];
  relatedAlbum: string[];
  locations: string[];
  roles: string[];
  media: string[];
}

interface RelationAlbumPhoto {
  id: string;
  relatedPosts: string[];
  relatedProjects: string[];
  locations: string[];
  media: string[];
}

interface ContentMetadataTaxonomy {
  locations: readonly { slug: string }[];
  roles: readonly { slug: string }[];
  media: readonly { slug: string }[];
}

function assertNoDuplicateReferences(owner: string, field: string, values: string[]): void {
  const duplicates = findDuplicateValues(values);
  if (duplicates.length > 0) {
    throw new Error(`${owner} repeats ${field}: ${duplicates.join(', ')}`);
  }
}

export function validateContentRelations(
  posts: RelationPost[],
  projects: RelationProject[],
  photos: RelationAlbumPhoto[],
  tags: readonly { slug: string }[],
  today = new Date().toISOString().slice(0, 10)
): void {
  const tagSlugs = new Set(tags.map(({ slug }) => slug));
  const postMap = new Map(posts.map((post) => [post.slug, post]));
  const projectMap = new Map(projects.map((project) => [project.slug, project]));
  const photoIds = new Set(photos.map(({ id }) => id));
  const seriesOrders = new Map<string, Map<number, string>>();
  const seriesTitles = new Map<string, string>();

  const requirePost = (owner: string, slug: string, sourceDraft: boolean) => {
    const target = postMap.get(slug);
    if (!target) throw new Error(`${owner} references missing post: ${slug}`);
    if (!sourceDraft && target.draft) {
      throw new Error(`${owner} references draft post from published content: ${slug}`);
    }
  };
  const requireProject = (owner: string, slug: string, sourceDraft: boolean) => {
    const target = projectMap.get(slug);
    if (!target) throw new Error(`${owner} references missing project: ${slug}`);
    if (!sourceDraft && target.draft) {
      throw new Error(`${owner} references draft project from published content: ${slug}`);
    }
  };
  const requirePhoto = (owner: string, id: string) => {
    if (!photoIds.has(id)) throw new Error(`${owner} references missing Album photo: ${id}`);
  };

  for (const post of posts) {
    const owner = `Post ${post.slug}`;
    for (const field of [
      ['tags', post.tags],
      ['related', post.related],
      ['relatedProjects', post.relatedProjects],
      ['relatedAlbum', post.relatedAlbum]
    ] as const) {
      assertNoDuplicateReferences(owner, field[0], field[1]);
    }
    for (const tag of post.tags) {
      if (!tagSlugs.has(tag)) throw new Error(`${owner} uses unknown tag: ${tag}`);
    }
    if (post.updated && post.updated < post.date) {
      throw new Error(`${owner} has updated ${post.updated} before published date ${post.date}`);
    }
    if (!post.draft && post.updated && isFutureCalendarDate(post.updated, today)) {
      throw new Error(`${owner} uses future updated date ${post.updated}`);
    }
    for (const slug of post.related) {
      if (slug === post.slug) throw new Error(`${owner} cannot relate to itself`);
      requirePost(owner, slug, post.draft);
    }
    for (const slug of post.relatedProjects) requireProject(owner, slug, post.draft);
    for (const id of post.relatedAlbum) requirePhoto(owner, id);

    if (post.series) {
      const knownTitle = seriesTitles.get(post.series.slug);
      if (knownTitle && knownTitle !== post.series.title) {
        throw new Error(
          `Series ${post.series.slug} uses conflicting titles: ${knownTitle}, ${post.series.title}`
        );
      }
      seriesTitles.set(post.series.slug, post.series.title);

      const orders = seriesOrders.get(post.series.slug) ?? new Map<number, string>();
      const existing = orders.get(post.series.order);
      if (existing) {
        throw new Error(
          `Series ${post.series.slug} repeats order ${post.series.order}: ${existing}, ${post.slug}`
        );
      }
      orders.set(post.series.order, post.slug);
      seriesOrders.set(post.series.slug, orders);
    }
  }

  for (const project of projects) {
    const owner = `Project ${project.slug}`;
    assertNoDuplicateReferences(owner, 'relatedPosts', project.relatedPosts);
    assertNoDuplicateReferences(owner, 'relatedAlbum', project.relatedAlbum);
    for (const slug of project.relatedPosts) requirePost(owner, slug, project.draft);
    for (const id of project.relatedAlbum) requirePhoto(owner, id);
  }

  for (const photo of photos) {
    const owner = `Album photo ${photo.id}`;
    assertNoDuplicateReferences(owner, 'relatedPosts', photo.relatedPosts);
    assertNoDuplicateReferences(owner, 'relatedProjects', photo.relatedProjects);
    for (const slug of photo.relatedPosts) requirePost(owner, slug, false);
    for (const slug of photo.relatedProjects) requireProject(owner, slug, false);
  }
}

export function validateContentMetadata(
  posts: RelationPost[],
  projects: RelationProject[],
  photos: RelationAlbumPhoto[],
  metadata: ContentMetadataTaxonomy
): void {
  const knownLocations = new Set(metadata.locations.map(({ slug }) => slug));
  const knownRoles = new Set(metadata.roles.map(({ slug }) => slug));
  const knownMedia = new Set(metadata.media.map(({ slug }) => slug));

  const validateReferences = (
    owner: string,
    field: string,
    values: string[],
    known: Set<string>
  ) => {
    assertNoDuplicateReferences(owner, field, values);
    for (const value of values) {
      if (!known.has(value)) throw new Error(`${owner} uses unknown ${field} value: ${value}`);
    }
  };

  for (const post of posts) {
    validateReferences(`Post ${post.slug}`, 'locations', post.locations, knownLocations);
  }
  for (const project of projects) {
    const owner = `Project ${project.slug}`;
    validateReferences(owner, 'locations', project.locations, knownLocations);
    validateReferences(owner, 'roles', project.roles, knownRoles);
    validateReferences(owner, 'media', project.media, knownMedia);
  }
  for (const photo of photos) {
    const owner = `Album photo ${photo.id}`;
    validateReferences(owner, 'locations', photo.locations, knownLocations);
    validateReferences(owner, 'media', photo.media, knownMedia);
  }
}

function isProductionBuild(): boolean {
  return process.env.NODE_ENV === 'production' || process.argv.slice(2).includes('build');
}

function cleanText(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const cleaned = value.trim();
  return cleaned.length > 0 ? cleaned : undefined;
}

function formatNumber(value: number): string {
  return Number.isInteger(value) ? value.toString() : Number(value.toFixed(2)).toString();
}

function formatShutterSpeed(seconds: number): string | undefined {
  if (!Number.isFinite(seconds) || seconds <= 0) return undefined;
  if (seconds >= 1) return `${formatNumber(seconds)} s`;

  const denominator = Math.round(1 / seconds);
  return denominator > 0 ? `1/${denominator} s` : undefined;
}

function formatCamera(make: unknown, model: unknown): string | undefined {
  const cameraMake = cleanText(make);
  const cameraModel = cleanText(model);
  if (!cameraModel) return cameraMake;
  if (!cameraMake || cameraModel.toLowerCase().includes(cameraMake.toLowerCase())) return cameraModel;
  if (cameraMake.toLowerCase() === 'apple') return `Apple ${cameraModel}`;
  return cameraModel;
}

export async function readAlbumPhotoMetadata(
  photo: AlbumPhotoInput
): Promise<AlbumPhotoMetadata> {
  const target = resolveStaticAssetTarget(photo.src);
  if (!target || !existsSync(target)) {
    throw new Error(`${photo.src}: image file does not exist under static/`);
  }

  const [image, exif] = await Promise.all([
    readStaticImageDimensions(photo.src),
    exifr
      .parse(target, {
        ifd0: {},
        exif: true,
        gps: false,
        interop: false,
        xmp: false,
        icc: false,
        iptc: false
      })
      .catch((error) => {
        throw new Error(`${photo.src}: could not read EXIF metadata (${errorMessage(error)})`, {
          cause: error
        });
      }) as Promise<ExifMetadata | undefined>
  ]);

  return {
    width: image.width,
    height: image.height,
    camera: formatCamera(exif?.Make, exif?.Model) ?? unknownMetadata,
    lens: cleanText(exif?.LensModel) ?? unknownMetadata,
    focalLength:
      typeof exif?.FocalLength === 'number' ? `${formatNumber(exif.FocalLength)} mm` : unknownMetadata,
    aperture: typeof exif?.FNumber === 'number' ? `ƒ/${formatNumber(exif.FNumber)}` : unknownMetadata,
    shutterSpeed:
      typeof exif?.ExposureTime === 'number'
        ? (formatShutterSpeed(exif.ExposureTime) ?? unknownMetadata)
        : unknownMetadata,
    iso: typeof exif?.ISO === 'number' ? formatNumber(exif.ISO) : unknownMetadata
  };
}

const navigationItem = s
  .object({
    label: s.string().min(1),
    href: s.string().min(1)
  })
  .strict();

const site = defineCollection({
  name: 'SiteConfig',
  pattern: 'config/site.yaml',
  single: true,
  schema: s.object({
    title: s.string().min(1),
    description: s.string().min(1),
    url: s.string().url(),
    locale: s.string().min(1),
    timezone: s
      .string()
      .refine(isValidTimeZone, 'Expected an IANA timezone such as Asia/Shanghai'),
    author: s
      .object({
        name: s.string().min(1),
        email: s.string().email(),
        logo: staticAsset(),
        portrait: staticAsset()
      })
      .strict()
      .transform(async (author) => ({
        ...author,
        logoImage: await generateResponsiveImage(author.logo, responsiveImageSpecs.logo),
        portraitImage: await generateResponsiveImage(author.portrait, responsiveImageSpecs.portrait)
      })),
    head: s
      .object({
        icons: s
          .array(
            s
              .object({
                rel: s.enum(['icon', 'apple-touch-icon']),
                type: s.string().min(1).optional(),
                sizes: s.string().min(1),
                href: staticAsset()
              })
              .strict()
          )
          .min(1),
        manifest: s.string().min(1)
      })
      .strict(),
    manifest: s
      .object({
        name: s.string().min(1),
        shortName: s.string().min(1),
        icons: s
          .array(
            s
              .object({
                src: staticAsset(),
                sizes: s.string().min(1),
                type: s.string().min(1)
              })
              .strict()
          )
          .min(1),
        themeColor: s.string().regex(/^#[0-9a-fA-F]{6}$/),
        backgroundColor: s.string().regex(/^#[0-9a-fA-F]{6}$/),
        display: s.enum(['browser', 'standalone', 'minimal-ui', 'fullscreen'])
      })
      .strict(),
    pages: s
      .object({
        blog: s
          .object({ title: s.string().min(1), description: s.string().min(1) })
          .strict(),
        album: s
          .object({ title: s.string().min(1), description: s.string().min(1) })
          .strict()
      })
      .strict(),
    homeNavigation: s
      .object({
        label: s.string().min(1),
        href: s.string().min(1),
        items: s.array(navigationItem).min(1)
      })
      .strict(),
    navigation: s.array(navigationItem).min(1),
    social: s
      .array(
        s
          .object({
            label: s.string().min(1),
            href: s.string().min(1),
            icon: staticAsset(),
            handle: s.string().min(1),
            preview: s.enum(['profile', 'github', 'email', 'rss'])
          })
          .strict()
      )
      .min(1),
    socialFallback: s
      .object({
        x: s
          .object({
            name: s.string().min(1),
            username: s.string().min(1),
            bio: s.string().min(1),
            avatarUrl: staticAsset(),
            followers: s.number().int().nonnegative().nullable(),
            following: s.number().int().nonnegative().nullable()
          })
          .strict(),
        github: s
          .object({
            username: s.string().min(1),
            followers: s.number().int().nonnegative().nullable(),
            totalContributions: s.number().int().nonnegative().nullable(),
            levels: s.array(s.number().int().min(0).max(4))
          })
          .strict()
      })
      .strict()
  })
    .strict()
    .transform(async (siteConfig) => ({
      ...siteConfig,
      ogImage: await generateOgImage({
        slug: 'site',
        title: siteConfig.title,
        eyebrow: 'Portfolio / Journal',
        meta: siteConfig.description
      })
    }))
});
export const siteConfigSchema = site.schema;

const tagConfig = defineCollection({
  name: 'TagConfig',
  pattern: 'config/tags.yaml',
  single: true,
  schema: s
    .object({
      tags: s
        .array(
          s
            .object({
              slug: referenceSlug(),
              label: s.string().min(1),
              description: s.string().min(1)
            })
            .strict()
        )
        .min(1)
        .superRefine((tags, { addIssue }) => {
          const duplicateSlugs = new Set(findDuplicateValues(tags.map(({ slug }) => slug)));
          tags.forEach((tag, index) => {
            if (!duplicateSlugs.has(tag.slug)) return;
            addIssue({
              code: 'custom',
              path: [index, 'slug'],
              message: `Duplicate tag slug: ${tag.slug}`
            });
          });
        })
    })
    .strict()
});
export const tagConfigSchema = tagConfig.schema;

const contentMetadata = defineCollection({
  name: 'ContentMetadata',
  pattern: 'config/metadata.yaml',
  single: true,
  schema: s
    .object({
      locations: s.array(taxonomyDefinition).min(1),
      roles: s.array(taxonomyDefinition).min(1),
      media: s.array(taxonomyDefinition).min(1)
    })
    .strict()
    .superRefine((metadata, { addIssue }) => {
      validateUniqueTaxonomyDefinitions('locations', metadata.locations, addIssue);
      validateUniqueTaxonomyDefinitions('roles', metadata.roles, addIssue);
      validateUniqueTaxonomyDefinitions('media', metadata.media, addIssue);
    })
});
export const contentMetadataSchema = contentMetadata.schema;

const home = defineCollection({
  name: 'HomeConfig',
  pattern: 'config/home.yaml',
  single: true,
  schema: s.object({
    hero: s
      .object({
        kicker: s.string().min(1),
        title: s.string().min(1),
        images: s
          .array(
            s
              .object({
                id: s.string().regex(slugPattern),
                src: staticAsset(),
                alt: s.string().min(1),
                caption: s.string().min(1),
                width: s.number().int().positive(),
                height: s.number().int().positive(),
                enabled: s.boolean()
              })
              .strict()
              .transform(async (image, { addIssue }) => {
                try {
                  await validateHeroImageDimensions(image);
                  return {
                    ...image,
                    responsive: await generateResponsiveImage(image.src, responsiveImageSpecs.hero)
                  };
                } catch (error) {
                  addIssue({
                    fatal: true,
                    code: 'custom',
                    path: ['src'],
                    message: errorMessage(error)
                  });
                  return { ...image, responsive: fallbackResponsiveImage(image.src) };
                }
              })
          )
          .min(1)
          .superRefine((images, { addIssue }) => {
            const duplicateIds = new Set(findDuplicateValues(images.map(({ id }) => id)));
            images.forEach((image, index) => {
              if (!duplicateIds.has(image.id)) return;
              addIssue({
                code: 'custom',
                path: [index, 'id'],
                message: `Duplicate hero image id: ${image.id}; choose a unique id`
              });
            });
          })
      })
      .strict(),
    about: s
      .object({
        body: s
          .array(
            s.object({ text: s.string().min(1), href: s.string().url().optional() }).strict()
          )
          .min(1),
        portraitAlt: s.string().min(1)
      })
      .strict(),
    projects: s.object({ heading: s.string().min(1) }).strict()
  }).strict()
});
export const homeConfigSchema = home.schema;

const album = defineCollection({
  name: 'AlbumConfig',
  pattern: 'config/album.yaml',
  single: true,
  schema: s.object({
    updated: calendarDate(),
    photos: s
      .array(
        s
          .object({
            id: s.string().regex(slugPattern),
            src: staticAsset(),
            alt: s.string().min(1),
            tilt: s.number().min(-1).max(1),
            date: calendarDate(),
            dateKind: s.enum(['created', 'photographed']),
            locations: referenceList(),
            media: requiredReferenceList(),
            relatedPosts: referenceList(),
            relatedProjects: referenceList()
          })
          .strict()
          .transform(async (photo, { addIssue }) => {
            try {
              const [metadata, thumbnail, lightbox] = await Promise.all([
                readAlbumPhotoMetadata(photo),
                generateResponsiveImage(photo.src, responsiveImageSpecs.albumThumbnail),
                generateResponsiveImage(photo.src, responsiveImageSpecs.albumLightbox)
              ]);
              return { ...photo, ...metadata, thumbnail, lightbox };
            } catch (error) {
              addIssue({
                fatal: true,
                code: 'custom',
                path: ['src'],
                message: errorMessage(error)
              });
              return {
                ...photo,
                width: 1,
                height: 1,
                camera: unknownMetadata,
                lens: unknownMetadata,
                focalLength: unknownMetadata,
                aperture: unknownMetadata,
                shutterSpeed: unknownMetadata,
                iso: unknownMetadata,
                thumbnail: fallbackResponsiveImage(photo.src),
                lightbox: fallbackResponsiveImage(photo.src)
              };
            }
          })
      )
      .min(1)
      .superRefine((photos, { addIssue }) => {
        const duplicateIds = new Set(findDuplicateValues(photos.map(({ id }) => id)));
        photos.forEach((photo, index) => {
          if (!duplicateIds.has(photo.id)) return;
          addIssue({
            code: 'custom',
            path: [index, 'id'],
            message: `Duplicate album photo id: ${photo.id}; choose a unique id`
          });
        });
      })
  }).strict()
});
export const albumConfigSchema = album.schema;

export const postTagsSchema = s.array(referenceSlug()).min(1);

export const postFrontmatterSchema = s
  .object({
    title: s.string().min(1),
    description: s.string().min(1),
    date: calendarDate(),
    updated: calendarDate().optional(),
    locations: referenceList(),
    draft: s.boolean(),
    tags: postTagsSchema,
    cover: staticAsset().optional(),
    series: seriesSchema.optional(),
    related: referenceList(),
    relatedProjects: referenceList(),
    relatedAlbum: referenceList()
  })
  .strict();

const posts = defineCollection({
  name: 'Post',
  pattern: 'posts/*.md',
  schema: postFrontmatterSchema
    .extend({
      slug: contentSlug(),
      toc: s.toc({ minDepth: 2, maxDepth: 6 }).transform((items) => flattenToc(items)),
      content: s.markdown()
    })
    .strict()
    .transform(async (post) => {
      const [coverImage, ogImage] = await Promise.all([
        post.cover
          ? generateResponsiveImage(post.cover, responsiveImageSpecs.cover)
          : Promise.resolve(undefined),
        generateOgImage({
          slug: post.slug,
          title: post.title,
          eyebrow: post.series?.title ?? 'Blog',
          meta: `${post.date} / ${post.tags[0]}`
        })
      ]);
      return { ...post, coverImage, ogImage };
    })
});

const projectFrontmatterFields = s
  .object({
    title: s.string().min(1),
    description: s.string().min(1),
    startYear: s.number().int().min(1900).max(2100),
    endYear: s.number().int().min(1900).max(2100).optional(),
    status: s.enum(['completed', 'ongoing']),
    category: s.string().min(1),
    locations: referenceList(),
    roles: requiredReferenceList(),
    media: requiredReferenceList(),
    cover: staticAsset(),
    order: s.number().int(),
    updated: calendarDate().optional(),
    draft: s.boolean(),
    relatedPosts: referenceList(),
    relatedAlbum: referenceList()
  })
  .strict();

function validateProjectYears(
  project: { startYear: number; endYear?: number; status: 'completed' | 'ongoing' },
  addIssue: (issue: { code: 'custom'; path: (string | number)[]; message: string }) => void
): void {
    if (project.status === 'ongoing' && project.endYear !== undefined) {
      addIssue({
        code: 'custom',
        path: ['endYear'],
        message: 'Ongoing projects must omit endYear'
      });
    }
    if (project.status === 'completed' && project.endYear === undefined) {
      addIssue({
        code: 'custom',
        path: ['endYear'],
        message: 'Completed projects require endYear'
      });
    }
    if (project.endYear !== undefined && project.endYear < project.startYear) {
      addIssue({
        code: 'custom',
        path: ['endYear'],
        message: 'endYear must be greater than or equal to startYear'
      });
    }
}

export const projectFrontmatterSchema = projectFrontmatterFields.superRefine((project, { addIssue }) => {
  validateProjectYears(project, addIssue);
});

const projects = defineCollection({
  name: 'Project',
  pattern: 'projects/*.md',
  schema: projectFrontmatterFields
    .extend({
      slug: contentSlug(),
      toc: s.toc({ minDepth: 2, maxDepth: 6 }).transform((items) => flattenToc(items)),
      content: s.markdown()
    })
    .strict()
    .superRefine((project, { addIssue }) => {
      validateProjectYears(project, addIssue);
    })
    .transform(async (project) => {
      const [coverImage, ogImage] = await Promise.all([
        generateResponsiveImage(project.cover, responsiveImageSpecs.cover),
        generateOgImage({
          slug: project.slug,
          title: project.title,
          eyebrow: 'Project',
          meta: `${projectYearLabel(project)} / ${project.category}`
        })
      ]);
      return { ...project, year: projectYearLabel(project), coverImage, ogImage };
    })
});

export default defineConfig({
  root: 'src/content',
  strict: true,
  output: {
    data: 'src/lib/generated/content',
    assets: 'static/generated',
    base: '/generated/',
    clean: true
  },
  collections: { site, home, album, tagConfig, contentMetadata, posts, projects },
  markdown: {
    rehypePlugins: [
      rehypeSlug,
      rehypeResponsiveImages,
      [
        rehypePrettyCode,
        {
          theme: {
            light: 'github-light',
            dark: 'github-dark'
          },
          keepBackground: false,
          bypassInlineCode: true,
          defaultLang: { block: 'text' }
        }
      ]
    ]
  },
  prepare: ({ site, album, tagConfig, contentMetadata, posts, projects }) => {
    const today = calendarDateInTimeZone(site.timezone);
    validateContentRelations(posts, projects, album.photos, tagConfig.tags, today);
    validateContentMetadata(posts, projects, album.photos, contentMetadata);
    prepareCollections(
      posts,
      projects,
      isProductionBuild(),
      today
    );
  },
  complete: async ({ site }) => {
    const source = site.manifest;
    const manifest = {
      name: source.name,
      short_name: source.shortName,
      icons: source.icons,
      theme_color: source.themeColor,
      background_color: source.backgroundColor,
      display: source.display
    };

    await writeFile(
      path.join(staticRoot, 'site.webmanifest'),
      `${JSON.stringify(manifest, null, 2)}\n`,
      'utf8'
    );
  }
});
