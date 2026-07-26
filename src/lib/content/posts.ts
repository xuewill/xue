import type { MarkdownModule, Post, PostMetadata, PostSummary } from '$lib/types/content';
import { extractContentHeadings } from './headings';
import { validateContentSlug, validatePostMetadata } from './validation';

const modules = import.meta.glob<MarkdownModule<PostMetadata>>('/src/content/posts/*.md', {
  eager: true
});
const sources = import.meta.glob<string>('/src/content/posts/*.md', {
  eager: true,
  import: 'default',
  query: '?raw'
});

function slugFromPath(path: string): string {
  return path.split('/').at(-1)?.replace(/\.md$/, '') ?? '';
}

const allPosts: Post[] = Object.entries(modules).map(([path, module]) => {
  const slug = slugFromPath(path);
  validateContentSlug('Post', slug);
  validatePostMetadata(slug, module.metadata);
  return {
    ...module.metadata,
    slug,
    headings: extractContentHeadings(sources[path]),
    component: module.default
  };
});

export const posts: Post[] = allPosts
  .filter((post) => !import.meta.env.PROD || !post.draft)
  .sort((a, b) => b.date.localeCompare(a.date));

export const postSummaries: PostSummary[] = posts.map(
  ({ component: _component, headings: _headings, ...post }) => post
);

export function getPost(slug: string): Post | undefined {
  return posts.find((post) => post.slug === slug);
}
