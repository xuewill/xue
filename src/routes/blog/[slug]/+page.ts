import { error } from '@sveltejs/kit';
import { getPost, posts } from '$lib/content/posts';

export function entries() {
  return posts.map(({ slug }) => ({ slug }));
}

export function load({ params }) {
  const post = getPost(params.slug);
  if (!post) error(404, 'Post not found');

  const index = posts.findIndex(({ slug }) => slug === post.slug);
  return {
    post,
    previous: posts[index - 1] ?? null,
    next: posts[index + 1] ?? null
  };
}
