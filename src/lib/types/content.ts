import type {
  AlbumConfig,
  HomeConfig,
  Post,
  Project,
  TagConfig
} from '$lib/generated/content/index.js';

export type ResponsiveImage = HomeConfig['hero']['images'][number]['responsive'];
export type HeroImage = HomeConfig['hero']['images'][number];
export type TextSegment = HomeConfig['about']['body'][number];
export type ContentHeading = Post['toc'][number];
export type AlbumPhoto = AlbumConfig['photos'][number];
export type MetadataSummary = { slug: string; label: string };
export type ArchiveEntry = {
  kind: 'post' | 'project' | 'album';
  slug: string;
  title: string;
  description?: string;
  date: string;
  dateLabel: string;
  year: number;
  href: string;
  image?: ResponsiveImage;
  metadata: MetadataSummary[];
};
export type PostSummary = Omit<Post, 'content' | 'toc' | 'locations'> & {
  locations: MetadataSummary[];
};
export type ProjectSummary = Omit<Project, 'content' | 'toc' | 'locations' | 'roles' | 'media'> & {
  locations: MetadataSummary[];
  roles: MetadataSummary[];
  media: MetadataSummary[];
};
export type TagDefinition = TagConfig['tags'][number];
export type TagSummary = TagDefinition & { count: number };
export type AlbumPhotoSummary = Pick<
  AlbumPhoto,
  'id' | 'alt' | 'width' | 'height' | 'thumbnail'
> & {
  date: string;
  dateKind: 'created' | 'photographed';
  locations: MetadataSummary[];
  media: MetadataSummary[];
};
export type AlbumPhotoView = Omit<AlbumPhoto, 'relatedPosts' | 'relatedProjects' | 'locations' | 'media'> & {
  locations: MetadataSummary[];
  media: MetadataSummary[];
  relatedPosts: PostSummary[];
  relatedProjects: ProjectSummary[];
};
