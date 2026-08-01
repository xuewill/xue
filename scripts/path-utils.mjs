// @ts-nocheck -- The Node helper is covered by its dedicated unit test.

import path from 'node:path';

export function resolveStaticAsset(staticRoot, asset) {
  const target = path.resolve(staticRoot, asset.replace(/^[/\\]+/, ''));
  const relative = path.relative(staticRoot, target);
  const isInside =
    relative === '' ||
    (relative !== '..' && !relative.startsWith(`..${path.sep}`) && !path.isAbsolute(relative));

  return isInside ? target : undefined;
}
