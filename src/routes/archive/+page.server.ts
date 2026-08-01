import { getArchiveEntries } from '$lib/server/content';

export function load() {
  return { entries: getArchiveEntries() };
}
