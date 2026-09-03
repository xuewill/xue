#!/usr/bin/env node

import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const layout = JSON.parse(
  readFileSync(path.join(scriptDir, '..', 'assets', 'layout.json'), 'utf8')
);

function parseArgs(argv) {
  const args = {
    left: String(layout.artwork.safeArea.left),
    top: String(layout.artwork.safeArea.top),
    right: String(layout.artwork.safeArea.right),
    bottom: String(layout.artwork.safeArea.bottom)
  };
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (!token.startsWith('--')) throw new Error(`Unexpected argument: ${token}`);
    const key = token.slice(2);
    const value = argv[index + 1];
    if (!value || value.startsWith('--')) throw new Error(`Missing value for ${token}`);
    args[key] = value;
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
  if (result.status !== 0) {
    throw new Error((result.stderr || `ImageMagick exited with ${result.status}`).trim());
  }
  return result.stdout?.trim() ?? '';
}

function integerArg(value, label, min, max) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < min || parsed > max) {
    throw new Error(`${label} must be an integer between ${min} and ${max}.`);
  }
  return parsed;
}

function parseGeometry(value) {
  const match = /^(\d+)x(\d+)\+(\d+)\+(\d+)$/.exec(value);
  if (!match) throw new Error(`Could not parse artwork geometry: ${value}`);
  return {
    width: Number(match[1]),
    height: Number(match[2]),
    left: Number(match[3]),
    top: Number(match[4])
  };
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.input) throw new Error('Missing required --input.');
  if (!args.output) throw new Error('Missing required --output.');

  const input = path.resolve(args.input);
  const output = path.resolve(args.output);
  if (!existsSync(input)) throw new Error(`Required image not found: ${input}`);

  const left = integerArg(args.left, '--left', 0, 1279);
  const top = integerArg(args.top, '--top', 0, 719);
  const right = integerArg(args.right, '--right', left + 1, 1280);
  const bottom = integerArg(args.bottom, '--bottom', top + 1, 720);
  const safeWidth = right - left;
  const safeHeight = bottom - top;

  const opaque = runMagick(['identify', '-format', '%[opaque]', input], true);
  if (opaque === 'True') {
    throw new Error('Input is fully opaque; regenerate it as a genuine transparent artwork layer.');
  }

  const workDir = mkdtempSync(path.join(os.tmpdir(), 'sketchbook-artwork-'));
  mkdirSync(path.dirname(output), { recursive: true });

  try {
    const fitted = path.join(workDir, 'fitted.png');
    const inputDimensions = runMagick(['identify', '-format', '%w %h', input], true);
    const inputGeometry = parseGeometry(runMagick(['identify', '-format', '%@', input], true));
    const inputRight = inputGeometry.left + inputGeometry.width;
    const inputBottom = inputGeometry.top + inputGeometry.height;
    const alreadyNormalized =
      inputDimensions === `${layout.canvas.width} ${layout.canvas.height}` &&
      inputGeometry.left >= left &&
      inputGeometry.top >= top &&
      inputRight <= right &&
      inputBottom <= bottom;

    const fitArgs = [input, '-alpha', 'on'];
    if (!alreadyNormalized) fitArgs.push('-resize', `${safeWidth}x${safeHeight}`);
    fitArgs.push('-colorspace', 'sRGB', fitted);
    runMagick(fitArgs);
    const fittedSize = runMagick(['identify', '-format', '%w %h', fitted], true);
    const [width, height] = fittedSize.split(/\s+/).map(Number);
    const x = alreadyNormalized ? 0 : left + Math.round((safeWidth - width) / 2);
    const y = alreadyNormalized ? 0 : top + Math.round((safeHeight - height) / 2);

    runMagick([
      '-size', `${layout.canvas.width}x${layout.canvas.height}`,
      'xc:none',
      fitted,
      '-gravity', 'northwest',
      '-geometry', `+${x}+${y}`,
      '-compose', 'over',
      '-composite',
      '-depth', '8',
      output
    ]);

    const geometry = parseGeometry(runMagick(['identify', '-format', '%@', output], true));
    const artworkRight = geometry.left + geometry.width;
    const artworkBottom = geometry.top + geometry.height;
    if (
      geometry.left < left ||
      geometry.top < top ||
      artworkRight > right ||
      artworkBottom > bottom
    ) {
      throw new Error(
        `Normalized artwork ${geometry.width}x${geometry.height}+${geometry.left}+${geometry.top} exceeds the safe area ${safeWidth}x${safeHeight}+${left}+${top}.`
      );
    }

    console.log(
      JSON.stringify(
        {
          output,
          canvas: layout.canvas,
          safeArea: { left, top, right, bottom, width: safeWidth, height: safeHeight },
          artworkBounds: geometry,
          operation: alreadyNormalized ? 'preserved' : 'fitted',
          shell: 'not included; the homepage renders /home/sketchbook/book-shell.png once beneath all artwork layers'
        },
        null,
        2
      )
    );
  } finally {
    rmSync(workDir, { recursive: true, force: true });
  }
}

try {
  main();
} catch (error) {
  console.error(`Error: ${error.message}`);
  process.exitCode = 1;
}
