#!/usr/bin/env node
/*
 * Generate or verify the visual-regression baselines inside the Playwright
 * container.
 *
 * Why a container: CI runs ubuntu-latest, and screenshots taken on a host with
 * different font rendering differ from it on essentially every pixel. Pinning
 * the image to the installed @playwright/test version keeps the baselines and
 * the CI run byte-comparable.
 *
 *   node scripts/visual-baseline.mjs            compare against the baselines
 *   node scripts/visual-baseline.mjs --update   rewrite the baselines
 */

import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function fail(message) {
  console.error(message);
  process.exit(1);
}

const manifest = JSON.parse(readFileSync(path.join(root, 'package.json'), 'utf8'));
const declared = manifest.devDependencies?.['@playwright/test'] ?? manifest.dependencies?.['@playwright/test'];
if (!declared) fail('Could not find @playwright/test in package.json.');

const version = declared.replace(/^[^0-9]*/, '');
if (!/^\d+\.\d+\.\d+$/.test(version)) {
  fail(`Expected a pinned Playwright version, found "${declared}". The image tag must match exactly.`);
}
const image = `mcr.microsoft.com/playwright:v${version}-noble`;

// `docker --version` only proves the CLI exists; `docker info` proves the daemon is reachable.
if (spawnSync('docker', ['info'], { stdio: 'ignore' }).status !== 0) {
  fail(
    'Cannot reach the Docker daemon, which is required to generate visual\n' +
      'baselines that match CI. Start Docker Desktop (or your daemon) and retry,\n' +
      'or let the CI run regenerate them on a pull request.'
  );
}

const update = process.argv.includes('--update');
const playwright = [
  'PLAYWRIGHT_VISUAL=1',
  'npx playwright test --project=visual',
  update ? '--update-snapshots' : ''
]
  .filter(Boolean)
  .join(' ');

/*
 * node_modules is masked with an anonymous volume so the container's Linux
 * install never overwrites the host's. Without it, `npm ci` in here leaves the
 * host with Linux-only binaries and sharp stops working outside Docker.
 */
const args = [
  'run',
  '--rm',
  '--init',
  '-v',
  `${root}:/work`,
  '-v',
  '/work/node_modules',
  '-w',
  '/work',
  image,
  'bash',
  '-lc',
  `npm ci && npm run build && ${playwright}`
];

console.log(`${update ? 'Updating' : 'Checking'} visual baselines in ${image}…`);
const run = spawnSync('docker', args, { stdio: 'inherit' });
process.exit(run.status ?? 1);
