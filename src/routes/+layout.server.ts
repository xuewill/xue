import { getSocialData } from '$lib/server/social';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ fetch }) => ({
  socialData: await getSocialData(fetch)
});
