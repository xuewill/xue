import { error } from '@sveltejs/kit';
import { getProjectEntries, getProjectPage } from '$lib/server/content';
import type { EntryGenerator, PageServerLoad } from './$types';

export const entries: EntryGenerator = () => getProjectEntries();

export const load: PageServerLoad = ({ params }) => {
  const page = getProjectPage(params.slug);
  if (!page) error(404, 'Project not found');
  return page;
};
