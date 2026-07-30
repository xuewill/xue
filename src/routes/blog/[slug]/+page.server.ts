import { error } from '@sveltejs/kit';
import { getPostEntries, getPostPage } from '$lib/server/content';
import type { EntryGenerator, PageServerLoad } from './$types';

export const entries: EntryGenerator = () => getPostEntries();

export const load: PageServerLoad = ({ params }) => {
  const page = getPostPage(params.slug);
  if (!page) error(404, 'Post not found');
  return page;
};
