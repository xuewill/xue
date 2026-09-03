#!/usr/bin/env node

import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const skillDir = path.resolve(scriptDir, '..');
const canonicalSeal = path.join(skillDir, 'assets', 'seal.png');
const layout = JSON.parse(readFileSync(path.join(skillDir, 'assets', 'layout.json'), 'utf8'));

function parseArgs(argv) {
  const args = {
    'canonical-x': String(layout.marks.canonical.x),
    'canonical-y': String(layout.marks.canonical.y),
    'canonical-size': String(layout.marks.canonical.size),
    'date-y': String(layout.marks.date.y),
    'date-max-width': String(layout.marks.date.maxWidth),
    'date-max-height': String(layout.marks.date.maxHeight),
    'location-x': String(layout.marks.location.x),
    'location-y': String(layout.marks.location.y),
    'location-size': String(layout.marks.location.size)
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
  if (!args.input) throw new Error('Missing required --input.');
  if (!args['date-image']) throw new Error('Missing required --date-image.');
  if (!args['location-seal']) throw new Error('Missing required --location-seal.');
  if (!args.output) throw new Error('Missing required --output.');

  const input = path.resolve(args.input);
  const dateImage = path.resolve(args['date-image']);
  const locationSeal = path.resolve(args['location-seal']);
  const output = path.resolve(args.output);
  for (const file of [input, dateImage, locationSeal, canonicalSeal]) {
    if (!existsSync(file)) throw new Error(`Required image not found: ${file}`);
  }

  const dimensions = runMagick(['identify', '-format', '%w %h', input], true);
  const expectedDimensions = `${layout.canvas.width} ${layout.canvas.height}`;
  if (dimensions !== expectedDimensions) {
    throw new Error(
      `Input must be exactly ${layout.canvas.width}x${layout.canvas.height}; received ${dimensions}.`
    );
  }

  const canonicalX = integerArg(args, 'canonical-x', 0, layout.canvas.width - 1);
  const canonicalY = integerArg(args, 'canonical-y', 0, layout.canvas.height - 1);
  const canonicalSize = integerArg(args, 'canonical-size', 24, 240);
  const dateY = integerArg(args, 'date-y', 0, layout.canvas.height - 1);
  const dateMaxWidth = integerArg(args, 'date-max-width', 24, 320);
  const dateMaxHeight = integerArg(args, 'date-max-height', 12, 96);
  const locationX = integerArg(args, 'location-x', 0, layout.canvas.width - 1);
  const locationY = integerArg(args, 'location-y', 0, layout.canvas.height - 1);
  const locationSize = integerArg(args, 'location-size', 32, 320);
  if (
    canonicalX + canonicalSize > layout.canvas.width ||
    canonicalY + canonicalSize > layout.canvas.height
  ) {
    throw new Error('Canonical seal placement exceeds the canvas.');
  }
  if (
    locationX + locationSize > layout.canvas.width ||
    locationY + locationSize > layout.canvas.height
  ) {
    throw new Error('Location seal placement exceeds the canvas.');
  }

  const workDir = mkdtempSync(path.join(os.tmpdir(), 'gc-sketchbook-marks-'));
  mkdirSync(path.dirname(output), { recursive: true });
  try {
    const canonicalScaled = path.join(workDir, 'canonical.png');
    const dateScaled = path.join(workDir, 'date.png');
    const locationScaled = path.join(workDir, 'location.png');
    runMagick([canonicalSeal, '-resize', `${canonicalSize}x${canonicalSize}`, canonicalScaled]);
    runMagick([
      dateImage,
      '-trim', '+repage',
      '-resize', `${dateMaxWidth}x${dateMaxHeight}>`,
      dateScaled
    ]);
    runMagick([locationSeal, '-resize', `${locationSize}x${locationSize}`, locationScaled]);
    const [dateWidth, dateHeight] = runMagick(['identify', '-format', '%w %h', dateScaled], true)
      .split(/\s+/)
      .map(Number);
    const dateX = canonicalX + Math.round((canonicalSize - dateWidth) / 2);
    if (
      dateX < 0 ||
      dateX + dateWidth > layout.canvas.width ||
      dateY + dateHeight > layout.canvas.height
    ) {
      throw new Error('Date placement exceeds the canvas.');
    }
    runMagick([
      input,
      canonicalScaled, '-gravity', 'northwest', '-geometry', `+${canonicalX}+${canonicalY}`, '-compose', 'over', '-composite',
      dateScaled, '-gravity', 'northwest', '-geometry', `+${dateX}+${dateY}`, '-compose', 'over', '-composite',
      locationScaled, '-gravity', 'northwest', '-geometry', `+${locationX}+${locationY}`, '-compose', 'over', '-composite',
      output
    ]);
    console.log(JSON.stringify({
      output,
      canonical: { source: 'assets/seal.png', x: canonicalX, y: canonicalY, size: canonicalSize },
      date: { source: dateImage, x: dateX, y: dateY, width: dateWidth, height: dateHeight },
      location: { source: locationSeal, x: locationX, y: locationY, size: locationSize }
    }, null, 2));
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
