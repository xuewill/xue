import { error } from '@sveltejs/kit';
import { getProject, projects } from '$lib/content/projects';

export function entries() {
  return projects.map(({ slug }) => ({ slug }));
}

export function load({ params }) {
  const project = getProject(params.slug);
  if (!project) error(404, 'Project not found');
  return { project };
}
