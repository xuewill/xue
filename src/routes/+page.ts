import { projectSummaries } from '$lib/content/projects';

export function load() {
  return { projects: projectSummaries };
}
