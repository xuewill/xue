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
export type PostSummary = Omit<Post, 'content' | 'toc'>;
export type ProjectSummary = Omit<Project, 'content' | 'toc'>;
export type TagDefinition = TagConfig['tags'][number];
export type TagSummary = TagDefinition & { count: number };
export type AlbumPhotoSummary = Pick<
  AlbumPhoto,
  'id' | 'alt' | 'width' | 'height' | 'thumbnail'
>;
export type AlbumPhotoView = Omit<AlbumPhoto, 'relatedPosts' | 'relatedProjects'> & {
  relatedPosts: PostSummary[];
  relatedProjects: ProjectSummary[];
};
