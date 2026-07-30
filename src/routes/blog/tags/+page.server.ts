import { tagSummaries } from '$lib/server/content';

export function load() {
  return { tags: tagSummaries };
}
