#!/usr/bin/env node

import { existsSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

function parseArgs(argv) {
  const args = {};
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (!token.startsWith('--')) throw new Error(`Unexpected argument: ${token}`);
    const value = argv[index + 1];
    if (!value || value.startsWith('--')) throw new Error(`Missing value for ${token}`);
    args[token.slice(2)] = value;
    index += 1;
  }
  return args;
}

function runMagick(args, capture = false) {
  const result = spawnSync('magick', args, {
    encoding: 'utf8',
    stdio: capture ? ['ignore', 'pipe', 'pipe'] : ['ignore', 'inherit', 'inherit']
  });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error((result.stderr || `ImageMagick exited with ${result.status}`).trim());
  return result.stdout?.trim() ?? '';
}

function integerArg(args, key, min, max) {
  const value = Number(args[key]);
  if (!Number.isInteger(value) || value < min || value > max) {
    throw new Error(`--${key} must be an integer between ${min} and ${max}.`);
  }
  return value;
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  for (const key of ['input', 'output', 'left', 'top', 'right', 'bottom', 'radius']) {
    if (!args[key]) throw new Error(`Missing required --${key}.`);
  }

  const input = path.resolve(args.input);
  const output = path.resolve(args.output);
  if (!existsSync(input)) throw new Error(`Required image not found: ${input}`);
  if (input === output) throw new Error('Keep the original generated image; use a separate output.');
  const [width, height] = runMagick(['identify', '-format', '%w %h', input], true)
    .split(/\s+/)
    .map(Number);
  const left = integerArg(args, 'left', 0, width - 2);
  const top = integerArg(args, 'top', 0, height - 2);
  const right = integerArg(args, 'right', left + 1, width - 1);
  const bottom = integerArg(args, 'bottom', top + 1, height - 1);
  const radius = integerArg(args, 'radius', 0, Math.floor(Math.min(right - left, bottom - top) / 2));
  const inset = args.inset === undefined ? 3 : integerArg(
    args,
    'inset',
    0,
    Math.floor(Math.min(right - left, bottom - top) / 4)
  );
  const applied = {
    left: left + inset,
    top: top + inset,
    right: right - inset,
    bottom: bottom - inset,
    radius: Math.max(0, radius - inset)
  };
  if (applied.left >= applied.right || applied.top >= applied.bottom) {
    throw new Error('--inset leaves no usable paper interior.');
  }

  mkdirSync(path.dirname(output), { recursive: true });
  runMagick([
    input,
    '(', '-size', `${width}x${height}`, 'xc:none', '-fill', 'white',
    '+antialias',
    '-draw', `roundrectangle ${applied.left},${applied.top} ${applied.right},${applied.bottom} ${applied.radius},${applied.radius}`,
    ')',
    '-alpha', 'off', '-compose', 'CopyOpacity', '-composite', '-depth', '8', output
  ]);
  console.log(JSON.stringify({
    output,
    dimensions: { width, height },
    reviewedBounds: { left, top, right, bottom, radius },
    inset,
    bookBounds: applied,
    operation: 'applied-inset-hard-book-alpha-seed-mask',
    edgeStrategy: 'The hard seed mask excludes the baked matte; normalize-book-spread reconstructs the final antialiased silhouette from opaque interior paper pixels.',
    safety: 'The mask follows explicit reviewed geometry and never color-keys paper, highlights, sky, snow or painted pixels.'
  }, null, 2));
}

try {
  main();
} catch (error) {
  console.error(`Error: ${error.message}`);
  process.exitCode = 1;
}
