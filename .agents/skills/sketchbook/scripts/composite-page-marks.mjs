#!/usr/bin/env node
import { readFileSync, mkdirSync, existsSync, writeFileSync } from 'node:fs';
import { randomBytes } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { inspectRect, overlaps, seededRandom, selectPlacement, strokeMetrics, hexRgb } from './mark-layout.mjs';
import { inspectSpread } from './spread-geometry.mjs';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const layout = JSON.parse(readFileSync(path.join(root, 'assets/layout.json'), 'utf8'));
function parseArgs(argv) {
    const args = {}, flags = new Set(['dry-run', 'overwrite']);
    const values = new Set(['input', 'date-image', 'location-seal', 'output', 'report', 'seed', 'exclude-regions',
        'canonical-x', 'canonical-y', 'canonical-size', 'date-y', 'date-max-width', 'date-max-height',
        'location-size', 'location-x', 'location-y', 'location-ink']);
    for (let i = 0; i < argv.length; i++) {
        const k = argv[i].slice(2);
        if (!argv[i].startsWith('--'))
            throw new Error('Unexpected argument: ' + argv[i]);
        if (flags.has(k))
            args[k] = true;
        else if (values.has(k) && argv[i + 1] && !argv[i + 1].startsWith('--'))
            args[k] = argv[++i];
        else
            throw new Error('Unknown option or missing value: --' + k);
    }
    for (const k of ['input', 'date-image', 'location-seal', 'output'])
        if (!args[k])
            throw new Error('Missing required --' + k + '.');
    return args;
}
async function raster(input) {
    const { data, info } = await sharp(input).toColourspace('srgb').ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    return { data, width: info.width, height: info.height };
}
async function markImage(input, width, height, trim = true) {
    const meta = await sharp(input).metadata();
    if (!meta.hasAlpha)
        throw new Error('Mark layer needs real alpha, not a baked background.');
    // stats() inspects the input before pending transforms in sharp. Materialize
    // the extracted alpha, otherwise a blue date's red channel looks empty.
    const alpha = await sharp(input).extractChannel('alpha').raw().toBuffer();
    let minimum = 255, maximum = 0;
    for (const value of alpha) {
        minimum = Math.min(minimum, value);
        maximum = Math.max(maximum, value);
    }
    if (minimum === 255 || maximum < 128)
        throw new Error('Mark must contain transparent space and visible ink.');
    let image = sharp(input);
    if (trim)
        image = image.trim({ background: '#00000000', threshold: 1 });
    return raster(await image.resize({ width, height, fit: 'inside', withoutEnlargement: true }).png().toBuffer());
}
async function main() {
    const args = parseArgs(process.argv.slice(2));
    const inputs = [args.input, args['date-image'], args['location-seal'], path.join(root, 'assets/seal.png')].map(p => path.resolve(p));
    const output = path.resolve(args.output), reportPath = path.resolve(args.report ?? output + '.json');
    if (inputs.includes(output) || inputs.includes(reportPath) || output === reportPath)
        throw new Error('Output/report must not overwrite an input or each other.');
    if (!args['dry-run'] && !args.overwrite && (existsSync(output) || existsSync(reportPath)))
        throw new Error('Output/report exists; use a new path or --overwrite for an authorized replacement.');
    const number = (k, fallback, min, max) => {
        const v = Number(args[k] ?? fallback);
        if (!Number.isInteger(v) || v < min || v > max)
            throw new Error('Invalid --' + k + '.');
        return v;
    };
    const base = await raster(inputs[0]);
    await inspectSpread(inputs[0]);
    if (base.width !== 1280 || base.height !== 720)
        throw new Error('Input must be exactly 1280x720.');
    const canonicalSize = number('canonical-size', layout.marks.canonical.size, 24, 240);
    const canonical = await markImage(inputs[3], canonicalSize, canonicalSize, false);
    const date = await markImage(inputs[1], number('date-max-width', layout.marks.date.maxWidth, 24, 320), number('date-max-height', layout.marks.date.maxHeight, 12, 96));
    const locationSize = number('location-size', layout.marks.location.size, 32, 320);
    const location = await markImage(inputs[2], locationSize, locationSize);
    const canonicalRect = { x: number('canonical-x', layout.marks.canonical.x, 0, 1279), y: number('canonical-y', layout.marks.canonical.y, 0, 719), width: canonical.width, height: canonical.height };
    const dateRect = { x: canonicalRect.x + Math.round((canonicalSize - date.width) / 2), y: number('date-y', layout.marks.date.y, 0, 719), width: date.width, height: date.height };
    const excluded = args['exclude-regions'] ? JSON.parse(readFileSync(args['exclude-regions'], 'utf8')) : [];
    if (!Array.isArray(excluded))
        throw new Error('Exclusions must be a JSON array of x,y,width,height regions.');
    for (const r of [...excluded, canonicalRect, dateRect])
        inspectRect(r, layout.canvas);
    if (overlaps(canonicalRect, dateRect))
        throw new Error('Date overlaps canonical seal.');
    const fixedMetrics = {};
    for (const [name, mark, rect] of [['canonical', canonical, canonicalRect], ['date', date, dateRect]]) {
        if (excluded.some(r => overlaps(rect, r, 4)))
            throw new Error('Fixed ' + name + ' overlaps a protected region; revise the base composition.');
        const m = strokeMetrics(base, mark, rect.x, rect.y, null, 3.2);
        if (!m?.paper || m.passingFraction < .9)
            throw new Error('Fixed ' + name + ' reserve is unreadable or outside opaque paper; revise the base composition.');
        fixedMetrics[name] = m;
    }
    const seed = String(args.seed ?? randomBytes(8).toString('hex')), random = seededRandom(seed);
    const explicit = args['location-x'] !== undefined || args['location-y'] !== undefined;
    if (explicit && (args['location-x'] === undefined || args['location-y'] === undefined))
        throw new Error('Use --location-x and --location-y together.');
    const candidates = explicit ? [{ id: 'explicit', x: number('location-x', 0, 0, 1279), y: number('location-y', 0, 0, 719) }] :
        layout.marks.location.candidates.flatMap(zone => {
            const points = [0, .5, 1].flatMap(a => [0, .5, 1].map(b => ({ id: zone.id, x: Math.round(zone.x[0] + a * (zone.x[1] - zone.x[0])), y: Math.round(zone.y[0] + b * (zone.y[1] - zone.y[0])) })));
            for (let i = 0; i < 4; i++)
                points.push({ id: zone.id, x: Math.round(zone.x[0] + random() * (zone.x[1] - zone.x[0])), y: Math.round(zone.y[0] + random() * (zone.y[1] - zone.y[0])) });
            return points;
        });
    const palette = args['location-ink'] ? [{ id: 'explicit', hex: args['location-ink'].toLowerCase() }] : layout.marks.location.inkPalette;
    const chosen = selectPlacement({ base, mark: location, candidates, palette, random,
        excluded: [...excluded, canonicalRect, dateRect, { x: 618, y: 20, width: 44, height: 680 }],
        minimumContrast: layout.marks.location.minimumContrast });
    const rgb = hexRgb(chosen.ink.hex).map(v => Math.round(v * 255));
    for (let i = 0; i < location.data.length; i += 4)
        for (let c = 0; c < 3; c++)
            location.data[i + c] = rgb[c];
    const report = {
        output, seed, dryRun: Boolean(args['dry-run']),
        metric: '10th-percentile contrast at alpha>=0.8 core stroke pixels; at least 90% must meet 3.2:1',
        canonical: { source: 'assets/seal.png', ...canonicalRect, size: canonicalSize, metrics: fixedMetrics.canonical },
        date: { source: inputs[1], ...dateRect, metrics: fixedMetrics.date },
        location: { source: inputs[2], x: chosen.x, y: chosen.y, width: location.width, height: location.height, size: locationSize, anchor: chosen.id, ink: chosen.ink, metrics: chosen.metrics },
        excluded, visualReviewRequired: 'Verify glyphs, semantics, edge halos and thumbnail hierarchy; pixel scores cannot certify these.'
    };
    if (!args['dry-run']) {
        mkdirSync(path.dirname(output), { recursive: true });
        mkdirSync(path.dirname(reportPath), { recursive: true });
        await sharp(inputs[0]).composite([
            { input: canonical.data, raw: { width: canonical.width, height: canonical.height, channels: 4 }, left: canonicalRect.x, top: canonicalRect.y },
            { input: date.data, raw: { width: date.width, height: date.height, channels: 4 }, left: dateRect.x, top: dateRect.y },
            { input: location.data, raw: { width: location.width, height: location.height, channels: 4 }, left: chosen.x, top: chosen.y }
        ]).png().toFile(output);
        writeFileSync(reportPath, JSON.stringify(report, null, 2) + '\n');
    }
    console.log(JSON.stringify(report, null, 2));
}
main().catch(error => { console.error('Error: ' + error.message); process.exitCode = 1; });
