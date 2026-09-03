import { spawnSync } from 'node:child_process';
import { copyFileSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import sharp from 'sharp';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { parse } from 'yaml';

const skillRoot = path.join('.agents', 'skills', 'sketchbook');
const testArtworkName = `.skill-test-${process.pid}.png`;
const testArtwork = path.join('static', 'home', 'sketchbook', testArtworkName);
const hasImageMagick = spawnSync('magick', ['-version'], { encoding: 'utf8' }).status === 0;
const imageMagickIt = hasImageMagick ? it : it.skip;
let workDirectory: string;

function runScript(name: string, args: string[]) {
  return spawnSync(process.execPath, [path.join(skillRoot, 'scripts', name), ...args], {
    cwd: process.cwd(),
    encoding: 'utf8',
    env: { ...process.env, NO_COLOR: '1' }
  });
}

beforeAll(() => {
  workDirectory = mkdtempSync(path.join(tmpdir(), 'xue-sketchbook-skill-'));
  copyFileSync('static/home/sketchbook/west-lake-watercolor.png', testArtwork);
});

afterAll(() => {
  rmSync(workDirectory, { recursive: true, force: true });
  rmSync(testArtwork, { force: true });
});

describe('Sketchbook skill scripts', () => {
  it('selects only count-compatible seal shapes and rejects unsupported counts', () => {
    const valid = runScript('choose-seal-shape.mjs', ['--count', '4']);
    const invalid = runScript('choose-seal-shape.mjs', ['--count', '0']);

    expect(valid.status).toBe(0);
    const selection = JSON.parse(valid.stdout);
    expect(selection.characterCount).toBe(4);
    expect(selection.candidates).toContain(selection.shape);
    expect(selection.candidates).toEqual([
      'square',
      'circle',
      'vertical-rectangle',
      'irregular-stone'
    ]);
    expect(invalid.status).toBe(1);
    expect(invalid.stderr).toContain('--count must be an integer between 1 and 6');
  });

  imageMagickIt('renders a Chongxi glyph control with the declared right-starting layout', async () => {
    const output = path.join(workDirectory, 'west-lake-glyphs.png');
    const result = runScript('render-location-seal.mjs', [
      '--label',
      '西湖',
      '--style',
      'glyphs-only',
      '--output',
      output
    ]);

    expect(result.status).toBe(0);
    expect(JSON.parse(result.stdout)).toMatchObject({
      label: '西湖',
      characterCount: 2,
      positionMap: { 上: '西', 下: '湖' },
      readingOrder: ['上', '下']
    });
    await expect(sharp(output).metadata()).resolves.toMatchObject({ width: 1200, height: 1200 });
  });

  imageMagickIt('normalizes transparent artwork and rejects opaque inputs', async () => {
    const output = path.join(workDirectory, 'normalized.png');
    const valid = runScript('normalize-artwork-layer.mjs', [
      '--input',
      'static/home/sketchbook/west-lake-watercolor.png',
      '--output',
      output
    ]);
    const opaque = runScript('normalize-artwork-layer.mjs', [
      '--input',
      'static/home/projects/wemail/cover.jpg',
      '--output',
      path.join(workDirectory, 'opaque.png')
    ]);

    expect(valid.status).toBe(0);
    expect(JSON.parse(valid.stdout)).toMatchObject({
      canvas: { width: 1280, height: 720 },
      operation: 'preserved',
      shell: expect.stringContaining('not included')
    });
    await expect(sharp(output).metadata()).resolves.toMatchObject({
      width: 1280,
      height: 720,
      hasAlpha: true
    });
    const sourceBounds = await sharp('static/home/sketchbook/west-lake-watercolor.png')
      .trim({ background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toBuffer({ resolveWithObject: true });
    const outputBounds = await sharp(output)
      .trim({ background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toBuffer({ resolveWithObject: true });
    expect(outputBounds.info).toMatchObject({
      width: sourceBounds.info.width,
      height: sourceBounds.info.height,
      trimOffsetLeft: sourceBounds.info.trimOffsetLeft,
      trimOffsetTop: sourceBounds.info.trimOffsetTop
    });
    expect(opaque.status).toBe(1);
    expect(opaque.stderr).toContain('Input is fully opaque');
  });

  imageMagickIt('composites all required marks and rejects a missing date layer', async () => {
    const output = path.join(workDirectory, 'marks.png');
    const seal = path.join(skillRoot, 'assets', 'seal.png');
    const valid = runScript('composite-page-marks.mjs', [
      '--input',
      'static/home/sketchbook/west-lake-watercolor.png',
      '--date-image',
      seal,
      '--location-seal',
      seal,
      '--output',
      output
    ]);
    const missingDate = runScript('composite-page-marks.mjs', [
      '--input',
      'static/home/sketchbook/west-lake-watercolor.png',
      '--location-seal',
      seal,
      '--output',
      path.join(workDirectory, 'missing-date.png')
    ]);

    expect(valid.status).toBe(0);
    expect(JSON.parse(valid.stdout)).toMatchObject({
      canonical: { source: 'assets/seal.png', x: 1008, y: 45, size: 90 },
      location: { x: 160, y: 510, size: 118 }
    });
    await expect(sharp(output).metadata()).resolves.toMatchObject({ width: 1280, height: 720 });
    expect(missingDate.status).toBe(1);
    expect(missingDate.stderr).toContain('Missing required --date-image');
  });

  it('registers inside hero.images without depending on top-level section order', () => {
    const config = path.join(workDirectory, 'home.yaml');
    writeFileSync(
      config,
      [
        'hero:',
        '  images:',
        '    - id: existing-entry',
        '      src: /home/sketchbook/changsha-orange-isle-watercolor.png',
        '      alt: Existing entry',
        '      caption: Existing',
        "      date: '2022-01-01'",
        '      width: 1280',
        '      height: 720',
        '      enabled: true',
        '  title: Reordered title',
        '  kicker: Reordered kicker',
        'about:',
        '  body: []',
        ''
      ].join('\n')
    );

    const result = runScript('register-sketchbook-entry.mjs', [
      '--id',
      'west-lake-test',
      '--image',
      '/home/sketchbook/west-lake-watercolor.png',
      '--caption',
      'West Lake test',
      '--alt',
      'A test artwork layer',
      '--date',
      '2026-09-18',
      '--config',
      config
    ]);

    expect(result.status).toBe(0);
    expect(result.stdout).toContain('Registered west-lake-test');
    const registered = parse(readFileSync(config, 'utf8'));
    expect(registered.hero.images.map((image: { id: string }) => image.id)).toEqual([
      'existing-entry',
      'west-lake-test'
    ]);
    expect(registered.hero.title).toBe('Reordered title');
  });

  it('keeps dry runs read-only and rejects impossible dates', () => {
    const source = readFileSync('src/content/config/home.yaml', 'utf8');
    const dryRun = runScript('register-sketchbook-entry.mjs', [
      '--id',
      'dry-run-entry',
      '--image',
      `/home/sketchbook/${testArtworkName}`,
      '--caption',
      'Dry run',
      '--alt',
      'A dry-run artwork layer',
      '--date',
      '2027-01-02',
      '--dry-run'
    ]);
    const invalidDate = runScript('register-sketchbook-entry.mjs', [
      '--id',
      'invalid-date-entry',
      '--image',
      '/home/sketchbook/west-lake-watercolor.png',
      '--caption',
      'Invalid date',
      '--alt',
      'An invalid-date artwork layer',
      '--date',
      '2027-02-30'
    ]);
    const shell = runScript('register-sketchbook-entry.mjs', [
      '--id',
      'shell-entry',
      '--image',
      '/home/sketchbook/book-shell.png',
      '--caption',
      'Invalid shell',
      '--alt',
      'The fixed shell is not a page layer',
      '--date',
      '2027-01-03',
      '--dry-run'
    ]);
    const traversal = runScript('register-sketchbook-entry.mjs', [
      '--id',
      'traversal-entry',
      '--image',
      '/home/sketchbook/../../../.agents/skills/sketchbook/assets/references/watercolor-reference.png',
      '--caption',
      'Traversal',
      '--alt',
      'A traversal attempt',
      '--date',
      '2027-01-04',
      '--dry-run'
    ]);

    expect(dryRun.status).toBe(0);
    expect(dryRun.stdout).toContain('Validated dry-run-entry');
    expect(readFileSync('src/content/config/home.yaml', 'utf8')).toBe(source);
    expect(invalidDate.status).toBe(1);
    expect(invalidDate.stderr).toContain('use a real YYYY-MM-DD calendar date');
    expect(shell.status).toBe(1);
    expect(shell.stderr).toContain('exclude the fixed book shell');
    expect(traversal.status).toBe(1);
    expect(traversal.stderr).toContain('must be stored under static/home/sketchbook');
  });
});
