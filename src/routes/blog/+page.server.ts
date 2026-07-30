import { postSummaries, tagSummaries } from '$lib/server/content';

export function load() {
  return { posts: postSummaries, tags: tagSummaries };
}
