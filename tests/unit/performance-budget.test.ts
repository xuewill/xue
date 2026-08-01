import { gzipSync } from 'node:zlib';
import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  collectBuildReport,
  collectImageReport,
  runPerformanceBudget
} from '../../scripts/check-performance-budget.mjs';

function fixtureRoot() {
  const root = mkdtempSync(path.join(tmpdir(), 'xue-performance-'));
  mkdirSync(path.join(root, 'build', '_app'), { recursive: true });
  mkdirSync(path.join(root, '.svelte-kit/output/client/.vite'), { recursive: true });
  mkdirSync(path.join(root, 'static/generated/media/hero'), { recursive: true });
  writeFileSync(path.join(root, 'build', 'index.html'), '<script src="./_app/main.js"></script><link href="./_app/main.css" rel="stylesheet">');
  writeFileSync(path.join(root, 'build/_app/main.js'), 'console.log("fixture");');
  writeFileSync(path.join(root, 'build/_app/main.css'), 'body{color:red}');
  writeFileSync(path.join(root, 'static/generated/media/hero/sample.webp'), Buffer.alloc(12));
  writeFileSync(path.join(root, '.svelte-kit/output/client/.vite/manifest.json'), JSON.stringify({
    entry: { file: '_app/main.js', isEntry: true, name: 'main' },
    style: { file: '_app/main.css', name: 'style' }
  }));
  return root;
}

describe('performance budget reports', () => {
  it('collects generated image sizes and semantic build resources', () => {
    const root = fixtureRoot();
    expect(collectImageReport({ root })).toEqual([{ file: 'static/generated/media/hero/sample.webp', bytes: 12 }]);
    const report = collectBuildReport({ root });
    const routes = report.routes as Record<
      string,
      { js: number; resources: Array<{ key: string }> }
    >;
    expect(routes['/'].js).toBe(gzipSync('console.log("fixture");', { level: 9 }).length);
    expect(routes['/'].resources.map((resource) => resource.key)).toEqual([
      'css:chunk:style',
      'js:entry:main'
    ]);
  });

  it('reports the exact image and semantic chunk that exceed a budget', () => {
    const root = fixtureRoot();
    writeFileSync(
      path.join(root, 'performance-budget.json'),
      JSON.stringify({
        imageBytes: { 'generated/media/hero/': 1 },
        gzip: {
          perResource: { js: 1, css: 1 },
          routes: { '/': { js: 1, css: 1 } }
        }
      })
    );
    const report = runPerformanceBudget({
      projectRoot: root,
      baselinePath: path.join(root, 'missing-baseline.json')
    });

    expect(report.imageFailures[0]).toContain('static/generated/media/hero/sample.webp');
    expect(report.buildFailures.join('\n')).toContain('js:entry:main');
    expect(report.buildFailures.join('\n')).toContain('/_app/main.js');
  });
});
