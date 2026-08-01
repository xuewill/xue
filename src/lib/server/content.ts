import { album, contentMetadata, posts, projects, tagConfig } from '../generated/content/index.js';
import type {
  AlbumPhotoSummary,
  AlbumPhotoView,
  ArchiveEntry,
  PostSummary,
  ProjectSummary,
  TagSummary
} from '../types/content';

type MetadataGroup = 'locations' | 'roles' | 'media';
const metadataMaps = Object.fromEntries(
  (['locations', 'roles', 'media'] as const).map((group) => [
    group,
    new Map(contentMetadata[group].map((item) => [item.slug, item]))
  ])
) as Record<MetadataGroup, Map<string, { slug: string; label: string }>>;

function summarizeMetadata(group: MetadataGroup, values: readonly string[]) {
  return values
    .map((slug) => metadataMaps[group].get(slug))
    .filter((item): item is { slug: string; label: string } => item !== undefined);
}

function summarizePost({ content: _content, toc: _toc, ...post }: (typeof posts)[number]): PostSummary {
  return { ...post, locations: summarizeMetadata('locations', post.locations) };
}

function presentPost(post: (typeof posts)[number]) {
  return { ...post, locations: summarizeMetadata('locations', post.locations) };
}

function summarizeProject(
  { content: _content, toc: _toc, ...project }: (typeof projects)[number]
): ProjectSummary {
  return {
    ...project,
    locations: summarizeMetadata('locations', project.locations),
    roles: summarizeMetadata('roles', project.roles),
    media: summarizeMetadata('media', project.media)
  };
}

function presentProject(project: (typeof projects)[number]) {
  return {
    ...project,
    locations: summarizeMetadata('locations', project.locations),
    roles: summarizeMetadata('roles', project.roles),
    media: summarizeMetadata('media', project.media)
  };
}

export const postSummaries: PostSummary[] = posts.map(summarizePost);
export const projectSummaries: ProjectSummary[] = projects.map(summarizeProject);
const postSummaryBySlug = new Map(postSummaries.map((post) => [post.slug, post]));
const projectSummaryBySlug = new Map(projectSummaries.map((project) => [project.slug, project]));
const albumPhotoById = new Map(album.photos.map((photo) => [photo.id, photo]));
const tagBySlug = new Map(tagConfig.tags.map((tag) => [tag.slug, tag]));

export const tagSummaries: TagSummary[] = tagConfig.tags
  .map((tag) => ({
    ...tag,
    count: postSummaries.filter((post) => post.tags.includes(tag.slug)).length
  }))
  .filter((tag) => tag.count > 0);

function uniqueValues(values: readonly string[]): string[] {
  return [...new Set(values)];
}

function resolvePostSummaries(slugs: readonly string[]): PostSummary[] {
  return uniqueValues(slugs)
    .map((slug) => postSummaryBySlug.get(slug))
    .filter((post): post is PostSummary => post !== undefined);
}

function resolveProjectSummaries(slugs: readonly string[]): ProjectSummary[] {
  return uniqueValues(slugs)
    .map((slug) => projectSummaryBySlug.get(slug))
    .filter((project): project is ProjectSummary => project !== undefined);
}

function summarizeAlbumPhoto(photo: (typeof album.photos)[number]): AlbumPhotoSummary {
  return {
    id: photo.id,
    alt: photo.alt,
    width: photo.width,
    height: photo.height,
    thumbnail: photo.thumbnail,
    date: photo.date,
    dateKind: photo.dateKind,
    locations: summarizeMetadata('locations', photo.locations),
    media: summarizeMetadata('media', photo.media)
  };
}

function resolveAlbumPhotos(ids: readonly string[]): AlbumPhotoSummary[] {
  return uniqueValues(ids)
    .map((id) => albumPhotoById.get(id))
    .filter((photo): photo is (typeof album.photos)[number] => photo !== undefined)
    .map(summarizeAlbumPhoto);
}

export function getPostPage(slug: string) {
  const index = posts.findIndex((post) => post.slug === slug);
  if (index === -1) return undefined;

  const post = posts[index];
  const relatedProjectSlugs = [
    ...post.relatedProjects,
    ...projects
      .filter((project) => project.relatedPosts.includes(post.slug))
      .map((project) => project.slug)
  ];
  const relatedAlbumIds = [
    ...post.relatedAlbum,
    ...album.photos.filter((photo) => photo.relatedPosts.includes(post.slug)).map((photo) => photo.id)
  ];

  return {
    post: presentPost(post),
    previous: index > 0 ? postSummaries[index - 1] : null,
    next: index < posts.length - 1 ? postSummaries[index + 1] : null,
    tags: post.tags
      .map((tag) => tagBySlug.get(tag))
      .filter((tag): tag is (typeof tagConfig.tags)[number] => tag !== undefined),
    seriesPosts: post.series
      ? postSummaries
          .filter((candidate) => candidate.series?.slug === post.series?.slug)
          .sort((a, b) => (a.series?.order ?? 0) - (b.series?.order ?? 0))
      : [],
    relatedPosts: resolvePostSummaries(post.related),
    relatedProjects: resolveProjectSummaries(relatedProjectSlugs),
    relatedAlbum: resolveAlbumPhotos(relatedAlbumIds)
  };
}

export function getProject(slug: string) {
  return projects.find((project) => project.slug === slug);
}

export function getProjectPage(slug: string) {
  const project = getProject(slug);
  if (!project) return undefined;

  const relatedPostSlugs = [
    ...project.relatedPosts,
    ...posts.filter((post) => post.relatedProjects.includes(project.slug)).map((post) => post.slug)
  ];
  const relatedAlbumIds = [
    ...project.relatedAlbum,
    ...album.photos
      .filter((photo) => photo.relatedProjects.includes(project.slug))
      .map((photo) => photo.id)
  ];

  return {
    project: presentProject(project),
    relatedPosts: resolvePostSummaries(relatedPostSlugs),
    relatedAlbum: resolveAlbumPhotos(relatedAlbumIds)
  };
}

export function getAlbumPage() {
  const photos: AlbumPhotoView[] = album.photos.map((photo) => {
    const relatedPostSlugs = [
      ...photo.relatedPosts,
      ...posts.filter((post) => post.relatedAlbum.includes(photo.id)).map((post) => post.slug)
    ];
    const relatedProjectSlugs = [
      ...photo.relatedProjects,
      ...projects
        .filter((project) => project.relatedAlbum.includes(photo.id))
        .map((project) => project.slug)
    ];

    return {
      ...photo,
      locations: summarizeMetadata('locations', photo.locations),
      media: summarizeMetadata('media', photo.media),
      relatedPosts: resolvePostSummaries(relatedPostSlugs),
      relatedProjects: resolveProjectSummaries(relatedProjectSlugs)
    };
  });

  return { photos, updated: album.updated };
}

export function getTagPage(slug: string) {
  const tag = tagSummaries.find((candidate) => candidate.slug === slug);
  if (!tag) return undefined;
  return {
    tag,
    posts: postSummaries.filter((post) => post.tags.includes(slug))
  };
}

export function getPostEntries() {
  return postSummaries.map(({ slug }) => ({ slug }));
}

export function getProjectEntries() {
  return projectSummaries.map(({ slug }) => ({ slug }));
}

export function getTagEntries() {
  return tagSummaries.map(({ slug }) => ({ tag: slug }));
}

export function getArchiveEntries(): ArchiveEntry[] {
  const postEntries = postSummaries.map((post) => ({
    kind: 'post' as const,
    slug: post.slug,
    title: post.title,
    description: post.description,
    date: post.date,
    dateLabel: post.date,
    year: Number(post.date.slice(0, 4)),
    href: `/blog/${post.slug}`,
    image: post.coverImage,
    metadata: post.locations
  }));
  const projectEntries = projectSummaries.map((project) => ({
    kind: 'project' as const,
    slug: project.slug,
    title: project.title,
    description: project.description,
    date: `${project.startYear}-01-01`,
    dateLabel: project.year,
    year: project.startYear,
    href: `/home/${project.slug}`,
    image: project.coverImage,
    metadata: [...project.locations, ...project.roles, ...project.media]
  }));
  const albumEntries = album.photos.map((photo) => ({
    kind: 'album' as const,
    slug: photo.id,
    title: photo.alt,
    date: photo.date,
    dateLabel: photo.date,
    year: Number(photo.date.slice(0, 4)),
    href: `/album#photo-${photo.id}`,
    image: photo.thumbnail,
    metadata: [...summarizeMetadata('locations', photo.locations), ...summarizeMetadata('media', photo.media)]
  }));
  return [...postEntries, ...projectEntries, ...albumEntries].sort((a, b) =>
    b.date.localeCompare(a.date) || a.kind.localeCompare(b.kind) || a.slug.localeCompare(b.slug)
  );
}
