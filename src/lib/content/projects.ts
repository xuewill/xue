import type {
  MarkdownModule,
  Project,
  ProjectMetadata,
  ProjectSummary
} from '$lib/types/content';

const modules = import.meta.glob<MarkdownModule<ProjectMetadata>>('/src/content/projects/*.md', {
  eager: true
});

function slugFromPath(path: string): string {
  return path.split('/').at(-1)?.replace(/\.md$/, '') ?? '';
}

function validateProject(slug: string, metadata: ProjectMetadata): void {
  if (!metadata || typeof metadata !== 'object') throw new Error(`Project ${slug} has no metadata`);
  if (!metadata.title?.trim()) throw new Error(`Project ${slug} is missing title`);
  if (!metadata.description?.trim()) throw new Error(`Project ${slug} is missing description`);
  if (!metadata.year?.trim()) throw new Error(`Project ${slug} is missing year`);
  if (!metadata.category?.trim()) throw new Error(`Project ${slug} is missing category`);
  if (!metadata.cover?.trim()) throw new Error(`Project ${slug} is missing cover`);
  if (!Number.isFinite(metadata.order)) throw new Error(`Project ${slug} is missing order`);
  if (typeof metadata.draft !== 'boolean') throw new Error(`Project ${slug} is missing draft`);
}

const allProjects: Project[] = Object.entries(modules).map(([path, module]) => {
  const slug = slugFromPath(path);
  validateProject(slug, module.metadata);
  return { slug, ...module.metadata, component: module.default };
});

export const projects: Project[] = allProjects
  .filter((project) => !import.meta.env.PROD || !project.draft)
  .sort((a, b) => a.order - b.order || b.year.localeCompare(a.year));

export const projectSummaries: ProjectSummary[] = projects.map(
  ({ component: _component, ...project }) => project
);

export function getProject(slug: string): Project | undefined {
  return projects.find((project) => project.slug === slug);
}
