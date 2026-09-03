#!/usr/bin/env node

import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const skillDir = path.resolve(scriptDir, '..');
const layout = JSON.parse(readFileSync(path.join(skillDir, 'assets', 'layout.json'), 'utf8'));

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const calendarDatePattern = /^\d{4}-\d{2}-\d{2}$/;

function parseArgs(argv) {
  const args = { config: 'src/content/config/home.yaml', dryRun: false };
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (token === '--dry-run') {
      args.dryRun = true;
      continue;
    }
    if (!token.startsWith('--')) throw new Error(`Unexpected argument: ${token}`);
    const key = token.slice(2);
    const value = argv[index + 1];
    if (!value || value.startsWith('--')) throw new Error(`Missing value for ${token}`);
    args[key] = value;
    index += 1;
  }
  return args;
}

function yamlString(value) {
  return `'${value.replaceAll("'", "''")}'`;
}

function isValidCalendarDate(value) {
  if (!calendarDatePattern.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

function readPngMetadata(file) {
  const buffer = readFileSync(file);
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  if (buffer.length < 33 || !buffer.subarray(0, 8).equals(signature)) {
    throw new Error('Image must be a valid PNG file.');
  }
  if (buffer.subarray(12, 16).toString('ascii') !== 'IHDR') {
    throw new Error('PNG is missing its IHDR header.');
  }
  const colorType = buffer[25];
  let offset = 8;
  let hasTransparencyChunk = false;
  while (offset + 12 <= buffer.length) {
    const length = buffer.readUInt32BE(offset);
    const type = buffer.subarray(offset + 4, offset + 8).toString('ascii');
    if (type === 'tRNS') hasTransparencyChunk = true;
    offset += length + 12;
    if (type === 'IEND') break;
  }
  return {
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20),
    hasAlpha: colorType === 4 || colorType === 6 || hasTransparencyChunk
  };
}

function unquoteYamlScalar(value) {
  const trimmed = value.trim();
  if (trimmed.startsWith("'") && trimmed.endsWith("'")) {
    return trimmed.slice(1, -1).replaceAll("''", "'");
  }
  if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
    return JSON.parse(trimmed);
  }
  return trimmed;
}

function listedScalars(source, key) {
  const pattern = new RegExp(`^\\s+(?:-\\s+)?${key}:\\s*(.+)$`, 'gm');
  return [...source.matchAll(pattern)].map((match) => unquoteYamlScalar(match[1]));
}

function heroImagesRange(source) {
  const hero = /^hero:\s*$/m.exec(source);
  if (!hero) throw new Error('home.yaml hero section is missing or invalid.');

  const nextTopLevel = /^\S.*$/gm;
  nextTopLevel.lastIndex = hero.index + hero[0].length;
  const nextSection = nextTopLevel.exec(source);
  const heroEnd = nextSection?.index ?? source.length;
  const heroSource = source.slice(hero.index, heroEnd);
  const images = /^ {2}images:\s*$/m.exec(heroSource);
  if (!images) throw new Error('home.yaml hero.images is missing or invalid.');

  const headerEnd = hero.index + images.index + images[0].length;
  const remainder = source.slice(headerEnd, heroEnd);
  const boundary = /\n(?=(?:\S| {2}\S))/.exec(remainder);
  const end = boundary ? headerEnd + boundary.index : heroEnd;
  return { end, source: source.slice(headerEnd, end) };
}

function normalizeImage(projectRoot, value) {
  const staticRoot = path.join(projectRoot, 'static');
  const sketchbookRoot = path.join(staticRoot, 'home', 'sketchbook');
  let file;

  if (path.isAbsolute(value) && !value.startsWith('/home/')) {
    file = path.resolve(value);
  } else if (value.startsWith('/')) {
    file = path.resolve(staticRoot, `.${value}`);
  } else {
    file = path.resolve(projectRoot, value);
  }

  const relative = path.relative(sketchbookRoot, file);
  if (!relative || relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error('Image must be stored under static/home/sketchbook/.');
  }
  const src = `/home/sketchbook/${relative.split(path.sep).join('/')}`;
  return { file, src };
}

async function validateArtworkPixels(imagePath) {
  const { default: sharp } = await import('sharp');
  const metadata = await sharp(imagePath).metadata();
  if (!metadata.hasAlpha) throw new Error('Image must have an alpha channel.');

  const alpha = await sharp(imagePath).extractChannel('alpha').stats();
  if ((alpha.channels[0]?.max ?? 0) === 0) {
    throw new Error('Sketchbook artwork layer cannot be fully transparent.');
  }

  const { info } = await sharp(imagePath)
    .trim({ background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer({ resolveWithObject: true });
  const bounds = {
    width: info.width,
    height: info.height,
    left: Math.abs(info.trimOffsetLeft ?? 0),
    top: Math.abs(info.trimOffsetTop ?? 0)
  };
  const safe = layout.artwork.safeArea;
  if (
    bounds.left < safe.left ||
    bounds.top < safe.top ||
    bounds.left + bounds.width > safe.right ||
    bounds.top + bounds.height > safe.bottom
  ) {
    throw new Error(
      `Sketchbook artwork bounds are ${bounds.width}x${bounds.height}+${bounds.left}+${bounds.top}; keep all pixels inside x=${safe.left}..${safe.right}, y=${safe.top}..${safe.bottom} and exclude the fixed book shell.`
    );
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  for (const key of ['id', 'image', 'caption', 'alt', 'date']) {
    if (!args[key]) throw new Error(`Missing required --${key}.`);
  }
  if (!slugPattern.test(args.id)) {
    throw new Error(`Invalid id "${args.id}"; use lowercase kebab-case.`);
  }
  if (!isValidCalendarDate(args.date)) {
    throw new Error(`Invalid date "${args.date}"; use a real YYYY-MM-DD calendar date.`);
  }
  for (const key of ['caption', 'alt']) {
    if (args[key].includes('\n') || !args[key].trim()) {
      throw new Error(`--${key} must be one non-empty line.`);
    }
  }

  const projectRoot = process.cwd();
  const configPath = path.resolve(projectRoot, args.config);
  if (!existsSync(configPath)) throw new Error(`Config not found: ${configPath}`);

  const { file: imagePath, src } = normalizeImage(projectRoot, args.image);
  if (!existsSync(imagePath)) throw new Error(`Image not found: ${imagePath}`);

  const metadata = readPngMetadata(imagePath);
  if (metadata.width !== 1280 || metadata.height !== 720) {
    throw new Error(`Image must be exactly 1280x720; received ${metadata.width}x${metadata.height}.`);
  }
  if (!metadata.hasAlpha) throw new Error('Image must have an alpha channel.');
  await validateArtworkPixels(imagePath);

  const source = readFileSync(configPath, 'utf8');
  const images = heroImagesRange(source);
  if (listedScalars(images.source, 'id').includes(args.id)) {
    throw new Error(`Duplicate hero image id: ${args.id}.`);
  }
  if (listedScalars(images.source, 'src').includes(src)) {
    throw new Error(`Duplicate hero image src: ${src}.`);
  }

  const entry = [
    `    - id: ${args.id}`,
    `      src: ${src}`,
    `      alt: ${yamlString(args.alt.trim())}`,
    `      caption: ${yamlString(args.caption.trim())}`,
    `      date: ${yamlString(args.date)}`,
    '      width: 1280',
    '      height: 720',
    '      enabled: true'
  ].join('\n');
  const nextSource = `${source.slice(0, images.end)}\n${entry}${source.slice(images.end)}`;

  if (!args.dryRun) writeFileSync(configPath, nextSource);
  console.log(`${args.dryRun ? 'Validated' : 'Registered'} ${args.id} -> ${src}`);
}

main().catch((error) => {
  console.error(`Error: ${error.message}`);
  process.exitCode = 1;
});
