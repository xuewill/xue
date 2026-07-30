import { getAlbumPage } from '$lib/server/content';

export function load() {
  return getAlbumPage();
}
