import { error } from '@sveltejs/kit';
import { getTagEntries, getTagPage } from '$lib/server/content';
import type { EntryGenerator, PageServerLoad } from './$types';

export const entries: EntryGenerator = () => getTagEntries();

export const load: PageServerLoad = ({ params }) => {
  const page = getTagPage(params.tag);
  if (!page) error(404, 'Tag not found');
  return page;
};
