import { projectSummaries } from '$lib/server/content';

export function load() {
  return { projects: projectSummaries };
}
