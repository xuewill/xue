#!/usr/bin/env node

import { randomInt } from 'node:crypto';

const shapePrompts = {
  square: 'compact square seal with an uneven hand-carved outer border',
  circle: 'round or subtly oval seal with a continuous worn carved rim',
  'vertical-rectangle': 'tall vertical rectangular seal with compressed but clearly separated glyph groups',
  'irregular-stone': 'organic asymmetrical seal outline derived from a naturally broken stone face, still compact and readable'
};

function parseArgs(argv) {
  const args = {};
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

function candidatesFor(count) {
  if (count <= 2) return ['circle', 'vertical-rectangle', 'square', 'irregular-stone'];
  if (count === 3) return ['vertical-rectangle', 'square', 'circle', 'irregular-stone'];
  if (count === 4) return ['square', 'circle', 'vertical-rectangle', 'irregular-stone'];
  return ['vertical-rectangle', 'square', 'irregular-stone'];
}

try {
  const args = parseArgs(process.argv.slice(2));
  const count = Number(args.count);
  if (!Number.isInteger(count) || count < 1 || count > 6) {
    throw new Error('--count must be an integer between 1 and 6.');
  }
  const candidates = candidatesFor(count);
  const shape = candidates[randomInt(candidates.length)];
  console.log(JSON.stringify({
    characterCount: count,
    shape,
    prompt: shapePrompts[shape],
    candidates,
    selection: 'fresh cryptographic random sample for this invocation; repeats are possible by chance'
  }, null, 2));
} catch (error) {
  console.error(`Error: ${error.message}`);
  process.exitCode = 1;
}
