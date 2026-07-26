import type {
  MarkdownModule,
  Project,
  ProjectMetadata,
  ProjectSummary
} from '$lib/types/content';
import { extractContentHeadings } from './headings';
import { validateContentSlug, validateProjectMetadata } from './validation';

const modules = import.meta.glob<MarkdownModule<ProjectMetadata>>('/src/content/projects/*.md', {
  eager: true
});
const sources = import.meta.glob<string>('/src/content/projects/*.md', {
  eager: true,
  import: 'default',
  query: '?raw'
});

function slugFromPath(path: string): string {
  return path.split('/').at(-1)?.replace(/\.md$/, '') ?? '';
}

const allProjects: Project[] = Object.entries(modules).map(([path, module]) => {
  const slug = slugFromPath(path);
  validateContentSlug('Project', slug);
  validateProjectMetadata(slug, module.metadata);
  return {
    ...module.metadata,
    slug,
    headings: extractContentHeadings(sources[path]),
    component: module.default
  };
});

export const projects: Project[] = allProjects
  .filter((project) => !import.meta.env.PROD || !project.draft)
  .sort((a, b) => a.order - b.order || b.year.localeCompare(a.year));

export const projectSummaries: ProjectSummary[] = projects.map(
  ({ component: _component, headings: _headings, ...project }) => project
);

export function getProject(slug: string): Project | undefined {
  return projects.find((project) => project.slug === slug);
}
