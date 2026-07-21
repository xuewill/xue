import { postSummaries } from '$lib/content/posts';

export function load() {
  return { posts: postSummaries };
}
