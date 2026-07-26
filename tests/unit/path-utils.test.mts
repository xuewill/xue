import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { resolveStaticAsset } from '../../scripts/path-utils.mjs';

describe('resolveStaticAsset', () => {
  const staticRoot = path.resolve('/workspace/site/static');

  it('resolves a root-relative asset inside static', () => {
    expect(resolveStaticAsset(staticRoot, '/images/cover.webp')).toBe(
      path.join(staticRoot, 'images/cover.webp')
    );
  });

  it.each(['/../static-private/secret.txt', '/images/../../secret.txt']) (
    'rejects an asset that escapes static: %s',
    (asset) => {
      expect(resolveStaticAsset(staticRoot, asset)).toBeUndefined();
    }
  );
});
