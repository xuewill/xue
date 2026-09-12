#!/usr/bin/env node

import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

import { paperPath, inspectSpread } from './spread-geometry.mjs';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const layout = JSON.parse(readFileSync(path.join(scriptDir, '..', 'assets', 'layout.json'), 'utf8'));
const targetBounds = layout.book.bounds;
const silhouette = layout.book.silhouette;

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

function parseGeometry(value) {
  const match = /^(\d+)x(\d+)\+(\d+)\+(\d+)$/.exec(value);
  if (!match) throw new Error(`Could not parse book bounds: ${value}`);
  return { width: Number(match[1]), height: Number(match[2]), left: Number(match[3]), top: Number(match[4]) };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.input) throw new Error('Missing required --input.');
  if (!args.output) throw new Error('Missing required --output.');

  const input = path.resolve(args.input);
  const output = path.resolve(args.output);
  if (!existsSync(input)) throw new Error(`Required image not found: ${input}`);
  if (runMagick(['identify', '-format', '%[opaque]', input], true) === 'True') {
    throw new Error('Input must retain a genuinely transparent exterior around the full-book silhouette.');
  }

  if (input === output) throw new Error('Keep the original base image; use a separate output.');
  const fit = args.fit ?? 'strict';
  if (!['strict', 'cover'].includes(fit)) throw new Error('--fit must be strict or cover.');
  mkdirSync(path.dirname(output), { recursive: true });
  const workDir = mkdtempSync(path.join(os.tmpdir(), 'sketchbook-full-book-'));
  try {
    const trimmed = path.join(workDir, 'trimmed.png');
    const normalized = path.join(workDir, 'normalized.png');
    const silhouetteMask = path.join(workDir, 'silhouette-mask.png');
    const shaped = path.join(workDir, 'shaped.png');
    runMagick([
      input,
      '-alpha', 'on',
      '-trim', '+repage',
      trimmed
    ]);
    const [sourceWidth, sourceHeight] = runMagick(['identify', '-format', '%w %h', trimmed], true).split(/\s+/).map(Number);
    const aspectError = Math.abs((sourceWidth / sourceHeight) / (targetBounds.width / targetBounds.height) - 1);
    if (fit === 'strict' && aspectError > 0.05) throw new Error('Aspect mismatch exceeds 5%; recompose or explicitly use --fit cover after reviewing crop safety.');
    runMagick([
      trimmed,
      '-alpha', 'on',
      '-resize', `${targetBounds.width}x${targetBounds.height}^`,
      '-gravity', 'center', '-extent', `${targetBounds.width}x${targetBounds.height}`,
      '-background', 'none',
      '-gravity', 'center',
      '-extent', `${layout.canvas.width}x${layout.canvas.height}`,
      '-colorspace', 'sRGB',
      '-depth', '8',
      normalized
    ]);
    runMagick([
      '-size', `${layout.canvas.width}x${layout.canvas.height}`,
      'xc:none',
      '-fill', 'white',
      '-draw', `path '${paperPath()}'`,
      silhouetteMask
    ]);
    runMagick([
      normalized,
      silhouetteMask,
      '-compose', 'DstIn',
      '-composite',
      shaped
    ]);
    const bounds = parseGeometry(runMagick(['identify', '-format', '%@', shaped], true));
    if (
      bounds.width !== targetBounds.width ||
      bounds.height !== targetBounds.height ||
      bounds.left !== targetBounds.left ||
      bounds.top !== targetBounds.top
    ) {
      throw new Error(
        `Book silhouette normalized to ${bounds.width}x${bounds.height}+${bounds.left}+${bounds.top}; expected ${targetBounds.width}x${targetBounds.height}+${targetBounds.left}+${targetBounds.top}.`
      );
    }
    const inspection = await inspectSpread(shaped);
    runMagick([shaped, output]);
    console.log(JSON.stringify({
      output,
      canvas: layout.canvas,
      bookBounds: bounds,
      operation: 'normalized-uniform-transparent-exterior-full-book',
      silhouette,
      fit, aspectError, geometryCheck: inspection.status, edgeMatte: inspection.edgeMatte,
      requirements: 'The generated image must visibly contain one full open paper spread, both pages, one center binding, clean bare-paper outer edges without a cover, and transparent exterior canvas with no corner or gutter halos.'
    }, null, 2));
  } finally {
    rmSync(workDir, { recursive: true, force: true });
  }
}

main().catch(error => {
  console.error(`Error: ${error.message}`);
  process.exitCode = 1;
});
