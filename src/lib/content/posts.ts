import type { MarkdownModule, Post, PostMetadata, PostSummary } from '$lib/types/content';

const modules = import.meta.glob<MarkdownModule<PostMetadata>>('/src/content/posts/*.md', {
  eager: true
});

function slugFromPath(path: string): string {
  return path.split('/').at(-1)?.replace(/\.md$/, '') ?? '';
}

function validatePost(slug: string, metadata: PostMetadata): void {
  if (!metadata || typeof metadata !== 'object') throw new Error(`Post ${slug} has no metadata`);
  if (!metadata.title?.trim()) throw new Error(`Post ${slug} is missing title`);
  if (!metadata.description?.trim()) throw new Error(`Post ${slug} is missing description`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(metadata.date)) {
    throw new Error(`Post ${slug} has an invalid date; expected YYYY-MM-DD`);
  }
  if (typeof metadata.draft !== 'boolean') throw new Error(`Post ${slug} is missing draft`);
  if (!Array.isArray(metadata.tags) || metadata.tags.length === 0) {
    throw new Error(`Post ${slug} must define at least one tag`);
  }
}

const allPosts: Post[] = Object.entries(modules).map(([path, module]) => {
  const slug = slugFromPath(path);
  validatePost(slug, module.metadata);
  return { slug, ...module.metadata, component: module.default };
});

export const posts: Post[] = allPosts
  .filter((post) => !import.meta.env.PROD || !post.draft)
  .sort((a, b) => b.date.localeCompare(a.date));

export const postSummaries: PostSummary[] = posts.map(({ component: _component, ...post }) => post);

export function getPost(slug: string): Post | undefined {
  return posts.find((post) => post.slug === slug);
}
