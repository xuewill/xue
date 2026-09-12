#!/usr/bin/env node

import { existsSync } from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

function parseArgs(argv) {
  if (argv.length !== 2 || argv[0] !== '--input') {
    throw new Error('Usage: node inspect-native-alpha.mjs --input generated.png');
  }
  return path.resolve(argv[1]);
}

function rounded(value, digits = 6) {
  return Number(value.toFixed(digits));
}

async function main() {
  const input = parseArgs(process.argv.slice(2));
  if (!existsSync(input)) throw new Error(`Required image not found: ${input}`);

  const metadata = await sharp(input).metadata();
  if (!metadata.hasAlpha) {
    throw new Error('Native alpha missing: output is RGB-only or has an opaque matte; use reviewed geometric recovery.');
  }

  const { data, info } = await sharp(input)
    .toColourspace('srgb')
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const total = info.width * info.height;
  let transparent = 0;
  let opaque = 0;
  let semitransparent = 0;
  let darkSemitransparent = 0;
  let edgeLumaTotal = 0;

  for (let index = 0; index < data.length; index += info.channels) {
    const alpha = data[index + 3];
    if (alpha <= 1) transparent += 1;
    else if (alpha >= 254) opaque += 1;
    else {
      semitransparent += 1;
      const luma = 0.2126 * data[index] + 0.7152 * data[index + 1] + 0.0722 * data[index + 2];
      edgeLumaTotal += luma;
      if (luma < 96) darkSemitransparent += 1;
    }
  }

  const transparentFraction = transparent / total;
  const opaqueFraction = opaque / total;
  const darkEdgeFraction = semitransparent ? darkSemitransparent / semitransparent : 0;
  const meanEdgeLuma = semitransparent ? edgeLumaTotal / semitransparent : 255;
  const report = {
    input,
    dimensions: { width: info.width, height: info.height },
    transparentPixels: transparent,
    transparentFraction: rounded(transparentFraction),
    opaquePixels: opaque,
    opaqueFraction: rounded(opaqueFraction),
    semitransparentPixels: semitransparent,
    darkSemitransparentPixels: darkSemitransparent,
    darkEdgeFraction: rounded(darkEdgeFraction),
    meanEdgeLuma: rounded(meanEdgeLuma, 2)
  };

  if (transparentFraction < 0.01 || opaqueFraction < 0.5) {
    throw new Error(`Native alpha invalid: expected a substantial opaque paper spread and at least 1% genuinely transparent exterior; measured ${JSON.stringify(report)}.`);
  }
  if (darkEdgeFraction > 0.2 || meanEdgeLuma < 150) {
    throw new Error(`Native alpha edge is matte-contaminated or dark-rimmed; use reviewed geometric recovery. Measured ${JSON.stringify(report)}.`);
  }

  console.log(JSON.stringify({ ...report, status: 'native-alpha-pass' }, null, 2));
}

main().catch((error) => {
  console.error(`Error: ${error.message}`);
  process.exitCode = 1;
});
