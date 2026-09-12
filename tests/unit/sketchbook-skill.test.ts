import { spawnSync } from 'node:child_process';
import { copyFileSync, existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import sharp from 'sharp';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { parse } from 'yaml';

const skillRoot = path.join('.agents', 'skills', 'sketchbook');

describe('Sketchbook regression gates', () => {
  const paper = path.join(skillRoot, 'assets', 'paper-geometry.png');
  const seal = path.join(skillRoot, 'assets', 'seal.png');
  function composeArgs(output: string) {
    return ['--input', paper, '--date-image', seal, '--location-seal', seal, '--output', output, '--seed', 'regression'];
  }

  it('replays identical placement and pixels; dry-run writes neither image nor report', async () => {
    const a = path.join(workDirectory, 'replay-a.png');
    const b = path.join(workDirectory, 'replay-b.png');
    const dry = path.join(workDirectory, 'no-write.png');
    const first = runScript('composite-page-marks.mjs', composeArgs(a));
    const second = runScript('composite-page-marks.mjs', composeArgs(b));
    const preview = runScript('composite-page-marks.mjs', [...composeArgs(dry), '--dry-run']);
    expect(first.status, first.stderr).toBe(0);
    expect(second.status, second.stderr).toBe(0);
    expect(preview.status, preview.stderr).toBe(0);
    expect(JSON.parse(first.stdout).location).toEqual(JSON.parse(second.stdout).location);
    expect(await sharp(a).raw().toBuffer()).toEqual(await sharp(b).raw().toBuffer());
    expect(existsSync(dry)).toBe(false);
    expect(existsSync(dry + '.json')).toBe(false);
    expect(existsSync(a + '.json')).toBe(true);
    const overwrite = runScript('composite-page-marks.mjs', composeArgs(a));
    expect(overwrite.status).toBe(1);
    expect(overwrite.stderr).toContain('exists');
  }, 15000);

  it('rejects explicit low-contrast ink and marks on a fold or protected subject', () => {
    const region = path.join(workDirectory, 'exclude.json');
    writeFileSync(region, JSON.stringify([{ x: 90, y: 65, width: 240, height: 250 }]));
    const low = runScript('composite-page-marks.mjs', [...composeArgs(path.join(workDirectory,'low.png')),
      '--location-x','100','--location-y','100','--location-ink','#f5eddc']);
    const subject = runScript('composite-page-marks.mjs', [...composeArgs(path.join(workDirectory,'subject.png')),
      '--location-x','100','--location-y','100','--exclude-regions',region]);
    const fold = runScript('composite-page-marks.mjs', [...composeArgs(path.join(workDirectory,'fold.png')),
      '--location-x','610','--location-y','300']);
    for (const r of [low,subject,fold]) {
      expect(r.status).toBe(1);
      expect(r.stderr).toContain('No safe location-seal placement');
    }
  });

  it('reads real alpha independently of ink color, accepting a pure cobalt date', async () => {
    const date = path.join(workDirectory, 'blue-date.png');
    await sharp(Buffer.from('<svg width="110" height="26"><path d="M5 5V21H28M45 5V21H68M85 5V21H105" stroke="#0044ff" stroke-width="4" fill="none"/></svg>')).png().toFile(date);
    const r = runScript('composite-page-marks.mjs', ['--input', paper, '--date-image', date,
      '--location-seal', seal, '--output', path.join(workDirectory, 'blue-date-final.png'), '--seed', 'blue']);
    expect(r.status, r.stderr).toBe(0);
    expect(JSON.parse(r.stdout).date.metrics.passingFraction).toBeGreaterThanOrEqual(0.9);
  });

  it('finds another region when the left-side candidates contain stickers', () => {
    const region = path.join(workDirectory, 'left-exclude.json');
    writeFileSync(region, JSON.stringify([{ x: 50, y: 50, width: 400, height: 600 }]));
    const r = runScript('composite-page-marks.mjs', [...composeArgs(path.join(workDirectory,'right.png')), '--exclude-regions',region]);
    expect(r.status, r.stderr).toBe(0);
    expect(JSON.parse(r.stdout).location.anchor).toBe('lower-right');
  });

  it('rejects a matching-color date reserve on an otherwise light spread', async () => {
    const busy = path.join(workDirectory, 'busy-date.png');
    await sharp(paper).composite([{ input: Buffer.from('<svg width="1280" height="720"><rect x="990" y="140" width="140" height="50" fill="#c02010"/></svg>') }]).png().toFile(busy);
    const r = runScript('composite-page-marks.mjs', ['--input',busy,'--date-image',seal,'--location-seal',seal,'--output',path.join(workDirectory,'busy-out.png')]);
    expect(r.status).toBe(1);
    expect(r.stderr).toContain('Fixed date reserve');
  });

  it('rejects a half-dark location patch that would pass an average-color check', async () => {
    const busy = path.join(workDirectory, 'mixed-patch.png');
    await sharp(paper).composite([{ input: Buffer.from('<svg width="1280" height="720"><rect x="100" y="300" width="59" height="118" fill="#2f343a"/></svg>') }]).png().toFile(busy);
    const r = runScript('composite-page-marks.mjs', ['--input', busy, '--date-image', seal,
      '--location-seal', seal, '--location-x', '100', '--location-y', '300', '--location-ink', '#2f343a',
      '--output', path.join(workDirectory, 'mixed-output.png')]);
    expect(r.status).toBe(1);
    expect(r.stderr).toContain('No safe location-seal placement');
  });

  it('rejects interior alpha holes and filled gutter notches with otherwise correct bounds', async () => {
    for (const [name,x,y,alpha] of [['hole',400,300,0],['notch',640,20,255]] as const) {
      const data = await sharp(paper).raw().toBuffer();
      for(let row=y;row<y+10;row++) for(let col=x;col<x+10;col++) data[(row*1280+col)*4+3]=alpha;
      const file=path.join(workDirectory,name+'.png');
      await sharp(data,{raw:{width:1280,height:720,channels:4}}).png().toFile(file);
      const r=runScript('validate-spread.mjs',['--input',file]);
      expect(r.status).toBe(1);
      expect(r.stderr).toContain('Paper alpha invalid');
    }
  });

  it('rejects black RGB contamination in semitransparent paper-edge pixels', async () => {
    const { data, info } = await sharp(paper).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    for (let index = 0; index < data.length; index += info.channels) {
      const alpha = data[index + 3];
      if (alpha > 1 && alpha < 254) {
        data[index] = 0;
        data[index + 1] = 0;
        data[index + 2] = 0;
      }
    }
    const file = path.join(workDirectory, 'black-edge-matte.png');
    await sharp(data, { raw: info }).png().toFile(file);
    const result = runScript('validate-spread.mjs', ['--input', file]);

    expect(result.status).toBe(1);
    expect(result.stderr).toContain('Paper edge matte invalid');
  });

  imageMagickIt('rejects major aspect distortion instead of stretching the image', async () => {
    const file=path.join(workDirectory,'square.png');
    await sharp(paper).resize(720,720,{fit:'fill'}).png().toFile(file);
    const r=runScript('normalize-book-spread.mjs',['--input',file,'--output',path.join(workDirectory,'stretched.png')]);
    expect(r.status).toBe(1);
    expect(r.stderr).toContain('Aspect mismatch');
  });

  it('inserts by date then id, preserves comments, and makes exact replays no-ops', () => {
    const config=path.join(workDirectory,'sorted.yaml');
    const source="hero:\n  images:\n    - id: z-existing\n      src: /home/sketchbook/existing.png\n      date: '2023-04-13'\n  # keep this title comment\n  title: Unchanged\nabout:\n  body: []\n";
    writeFileSync(config,source);
    const args=['--config',config,'--id','a-new','--image','/home/sketchbook/'+testArtworkName,
      '--date','2023-04-13','--caption','New','--alt','New full spread'];
    const first=runScript('register-sketchbook-entry.mjs',args);
    expect(first.status,first.stderr).toBe(0);
    const saved=readFileSync(config,'utf8');
    expect(parse(saved).hero.images.map((v: {id:string})=>v.id)).toEqual(['a-new','z-existing']);
    expect(saved).toContain('  # keep this title comment\n  title: Unchanged');
    const replay=runScript('register-sketchbook-entry.mjs',args);
    expect(replay.status,replay.stderr).toBe(0);
    expect(replay.stdout).toContain('Already registered');
    expect(readFileSync(config,'utf8')).toBe(saved);
    const conflict=runScript('register-sketchbook-entry.mjs',[...args,'--caption','Changed']);
    expect(conflict.status).toBe(1);
    expect(readFileSync(config,'utf8')).toBe(saved);
  });
});
const testArtworkName = `.skill-test-${process.pid}.png`;
const testArtwork = path.join('static', 'home', 'sketchbook', testArtworkName);
const hasImageMagick = spawnSync('magick', ['-version'], { encoding: 'utf8' }).status === 0;
const imageMagickIt = hasImageMagick ? it : it.skip;
let workDirectory: string;
let fullBookFixture: string;

function runScript(name: string, args: string[]) {
  return spawnSync(process.execPath, [path.join(skillRoot, 'scripts', name), ...args], {
    cwd: process.cwd(),
    encoding: 'utf8',
    env: { ...process.env, NO_COLOR: '1' }
  });
}

beforeAll(async () => {
  workDirectory = mkdtempSync(path.join(tmpdir(), 'xue-sketchbook-skill-'));
  fullBookFixture = path.join(workDirectory, 'transparent-exterior-book.png');
  copyFileSync('static/home/sketchbook/west-lake-watercolor.png', testArtwork);
  await sharp({
    create: { width: 1280, height: 720, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } }
  })
    .composite([
      {
        input: Buffer.from(
          '<svg width="1280" height="720" xmlns="http://www.w3.org/2000/svg"><rect x="10" y="10" width="1260" height="700" rx="28" fill="#e8dfcc"/></svg>'
        )
      }
    ])
    .png()
    .toFile(fullBookFixture);
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

  imageMagickIt('normalizes transparent-exterior full-book spreads and rejects opaque inputs', async () => {
    const output = path.join(workDirectory, 'full-book.png');
    const valid = runScript('normalize-book-spread.mjs', [
      '--input',
      fullBookFixture,
      '--output',
      output
    ]);
    const opaque = runScript('normalize-book-spread.mjs', [
      '--input',
      'static/home/projects/wemail/cover.jpg',
      '--output',
      path.join(workDirectory, 'opaque-book.png')
    ]);

    expect(valid.status).toBe(0);
    expect(JSON.parse(valid.stdout)).toMatchObject({
      canvas: { width: 1280, height: 720 },
      bookBounds: { width: 1200, height: 680, left: 40, top: 20 },
      operation: 'normalized-uniform-transparent-exterior-full-book'
    });
    await expect(sharp(output).metadata()).resolves.toMatchObject({
      width: 1280,
      height: 720,
      hasAlpha: true
    });
    const raw = await sharp(output).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    const alphaAt = (x: number, y: number) =>
      raw.data[(y * raw.info.width + x) * raw.info.channels + 3];
    expect([alphaAt(40, 20), alphaAt(640, 20), alphaAt(640, 699)]).toEqual([0, 0, 0]);
    expect([alphaAt(640, 100), alphaAt(40, 360)]).toEqual([255, 255]);
    expect(opaque.status).toBe(1);
    expect(opaque.stderr).toContain('genuinely transparent exterior');
  });

  it('accepts genuine native alpha and rejects opaque or dark-matted output', async () => {
    const darkMatte = path.join(workDirectory, 'dark-native-edge.png');
    const width = 100;
    const height = 100;
    const pixels = Buffer.alloc(width * height * 4);
    for (let y = 9; y <= 90; y += 1) {
      for (let x = 9; x <= 90; x += 1) {
        const index = (y * width + x) * 4;
        const edge = x === 9 || x === 90 || y === 9 || y === 90;
        pixels[index] = edge ? 0 : 238;
        pixels[index + 1] = edge ? 0 : 229;
        pixels[index + 2] = edge ? 0 : 208;
        pixels[index + 3] = edge ? 128 : 255;
      }
    }
    await sharp(pixels, { raw: { width, height, channels: 4 } }).png().toFile(darkMatte);

    const valid = runScript('inspect-native-alpha.mjs', [
      '--input',
      path.join(skillRoot, 'assets', 'paper-geometry.png')
    ]);
    const opaque = runScript('inspect-native-alpha.mjs', [
      '--input',
      'static/home/projects/wemail/cover.jpg'
    ]);
    const contaminated = runScript('inspect-native-alpha.mjs', ['--input', darkMatte]);

    expect(valid.status, valid.stderr).toBe(0);
    expect(JSON.parse(valid.stdout)).toMatchObject({ status: 'native-alpha-pass' });
    expect(opaque.status).toBe(1);
    expect(opaque.stderr).toContain('Native alpha missing');
    expect(contaminated.status).toBe(1);
    expect(contaminated.stderr).toContain('matte-contaminated');
  });

  imageMagickIt('creates an inset hard alpha seed without matte antialiasing', async () => {
    const output = path.join(workDirectory, 'masked-book.png');
    const result = runScript('mask-book-exterior.mjs', [
      '--input',
      'static/home/projects/wemail/cover.jpg',
      '--output',
      output,
      '--left',
      '10',
      '--top',
      '10',
      '--right',
      '1590',
      '--bottom',
      '890',
      '--radius',
      '28'
    ]);

    expect(result.status).toBe(0);
    expect(JSON.parse(result.stdout)).toMatchObject({
      operation: 'applied-inset-hard-book-alpha-seed-mask',
      reviewedBounds: { left: 10, top: 10, right: 1590, bottom: 890, radius: 28 },
      inset: 3,
      bookBounds: { left: 13, top: 13, right: 1587, bottom: 887, radius: 25 }
    });
    const metadata = await sharp(output).metadata();
    const alpha = await sharp(output).extractChannel('alpha').raw().toBuffer();
    expect(metadata).toMatchObject({ width: 1600, height: 900, hasAlpha: true });
    expect(alpha.includes(0)).toBe(true);
    expect(alpha.includes(255)).toBe(true);
    expect(alpha.every((value) => value === 0 || value === 255)).toBe(true);
  });

  imageMagickIt('composites all required marks and rejects a missing date layer', async () => {
    const output = path.join(workDirectory, 'marks.png');
    const seal = path.join(skillRoot, 'assets', 'seal.png');
    const valid = runScript('composite-page-marks.mjs', [
      '--input',
      path.join(skillRoot, 'assets', 'paper-geometry.png'),
      '--date-image',
      seal,
      '--location-seal',
      seal,
      '--location-x',
      '160',
      '--location-y',
      '510',
      '--location-ink',
      '#c33f32',
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
      location: {
        x: 160,
        y: 510,
        size: 118,
        anchor: 'explicit',
        ink: { id: 'explicit', hex: '#c33f32' }
      }
    });
    await expect(sharp(output).metadata()).resolves.toMatchObject({ width: 1280, height: 720 });
    expect(missingDate.status).toBe(1);
    expect(missingDate.stderr).toContain('Missing required --date-image');
  });

  imageMagickIt('randomizes the location seal inside quiet zones with readable contrast', () => {
    const output = path.join(workDirectory, 'random-location-mark.png');
    const seal = path.join(skillRoot, 'assets', 'seal.png');
    const result = runScript('composite-page-marks.mjs', [
      '--input',
      path.join(skillRoot, 'assets', 'paper-geometry.png'),
      '--date-image',
      seal,
      '--location-seal',
      seal,
      '--output',
      output
    ]);

    expect(result.status).toBe(0);
    const location = JSON.parse(result.stdout).location;
    expect(['upper-left', 'middle-left', 'lower-left', 'lower-right', 'upper-inner-right']).toContain(location.anchor);
    expect(location.ink.contrast).toBeGreaterThanOrEqual(3.2);
    expect(['#c33f32', '#2148b8', '#69385f', '#174c35', '#2f343a', '#d28a1f']).toContain(
      location.ink.hex
    );
    expect(location.x).toBeGreaterThanOrEqual(40);
    expect(location.x + location.size).toBeLessThanOrEqual(1240);
    expect(location.y).toBeGreaterThanOrEqual(20);
    expect(location.y + location.size).toBeLessThanOrEqual(700);
  });

  it('ships eight full-book style references with a genuinely transparent exterior', async () => {
    const references = [
      'watercolor-reference.png',
      'oil-reference.png',
      'ink-reference.png',
      'minimal-zine-reference.png',
      'mono-riso-reference.png',
      'pixel-diary-reference.png',
      'distilled-scene-reference.png',
      'gathered-memory-reference.png'
    ];

    for (const reference of references) {
      const input = path.join(skillRoot, 'assets', 'references', reference);
      const validation = runScript('validate-spread.mjs', ['--input', input]);
      const [metadata, alpha, trimmed] = await Promise.all([
        sharp(input).metadata(),
        sharp(input).extractChannel('alpha').stats(),
        sharp(input)
          .trim({ background: { r: 0, g: 0, b: 0, alpha: 0 } })
          .png()
          .toBuffer({ resolveWithObject: true })
      ]);
      expect(validation.status, `${reference}: ${validation.stderr}`).toBe(0);
      expect(JSON.parse(validation.stdout)).toMatchObject({
        status: 'pixel-geometry-and-edge-pass'
      });
      expect(metadata).toMatchObject({ width: 1280, height: 720, hasAlpha: true });
      expect(alpha.channels[0]?.min).toBe(0);
      expect(alpha.channels[0]?.max).toBeGreaterThanOrEqual(254);
      expect(trimmed.info).toMatchObject({
        width: 1200,
        height: 680,
        trimOffsetLeft: -40,
        trimOffsetTop: -20
      });
    }
  });

  it('ships coordinated transparent light and dark imagegen album backdrops', async () => {
    for (const theme of ['light', 'dark']) {
      const input = `static/home/sketchbook/album-backdrop-${theme}.png`;
      const [metadata, raw, trimmed] = await Promise.all([
        sharp(input).metadata(),
        sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true }),
        sharp(input)
          .trim({ background: { r: 0, g: 0, b: 0, alpha: 0 } })
          .png()
          .toBuffer({ resolveWithObject: true })
      ]);

      expect(metadata).toMatchObject({ width: 1280, height: 720, hasAlpha: true });
      let minimumAlpha = 255;
      let maximumAlpha = 0;
      for (let index = 3; index < raw.data.length; index += raw.info.channels) {
        minimumAlpha = Math.min(minimumAlpha, raw.data[index]);
        maximumAlpha = Math.max(maximumAlpha, raw.data[index]);
      }
      expect(minimumAlpha).toBe(0);
      expect(maximumAlpha).toBe(255);
      expect(trimmed.info).toMatchObject({
        width: 1260,
        height: 700,
        trimOffsetLeft: -10,
        trimOffsetTop: -10
      });
    }
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
      'A test complete book spread',
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
      'A dry-run complete book spread',
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
      'An invalid-date complete book spread',
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
      'A retired shell cannot satisfy the full-book contract',
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
    expect(shell.stderr).toContain('full-book bounds are');
    expect(traversal.status).toBe(1);
    expect(traversal.stderr).toContain('must be stored under static/home/sketchbook');
  });
});
