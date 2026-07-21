import { error } from '@sveltejs/kit';
import { getPost, posts } from '$lib/content/posts';

export function entries() {
  return posts.map(({ slug }) => ({ slug }));
}

export function load({ params }) {
  const post = getPost(params.slug);
  if (!post) error(404, 'Post not found');
  return { post };
}
