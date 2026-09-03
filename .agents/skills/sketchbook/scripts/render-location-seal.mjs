#!/usr/bin/env node

import { existsSync, mkdirSync, mkdtempSync, rmSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const skillDir = path.resolve(scriptDir, '..');
const fontPath = path.join(skillDir, 'assets', 'chongxi_seal.otf');

function parseArgs(argv) {
  const args = { ink: '#174c35', layout: 'auto', style: 'auto', size: '1200' };
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

function identifySize(file) {
  const output = runMagick(['identify', '-format', '%w %h', file], true);
  const [width, height] = output.split(/\s+/).map(Number);
  if (!Number.isFinite(width) || !Number.isFinite(height)) {
    throw new Error(`Could not inspect rendered glyph: ${file}`);
  }
  return { width, height };
}

function resolveLayout(count, requested) {
  if (requested !== 'auto') return requested;
  if (count === 4) return 'huiwen';
  if (count === 3) return '1+2';
  if (count === 5) return '2+3';
  return `count-${count}`;
}

function placements(glyphs, layout, size) {
  const scale = size / 1200;
  const p = (x, y, maxWidth, maxHeight, glyphIndex, position) => ({
    x: Math.round(x * scale),
    y: Math.round(y * scale),
    maxWidth: Math.round(maxWidth * scale),
    maxHeight: Math.round(maxHeight * scale),
    glyphIndex,
    position
  });

  if (glyphs.length === 1) return [p(600, 600, 760, 760, 0, '中')];
  if (glyphs.length === 2) {
    return [p(600, 350, 650, 420, 0, '上'), p(600, 850, 650, 420, 1, '下')];
  }
  if (glyphs.length === 3 && layout === '1+2') {
    return [
      p(835, 600, 420, 760, 0, '右'),
      p(340, 350, 420, 420, 1, '左上'),
      p(340, 850, 420, 420, 2, '左下')
    ];
  }
  if (glyphs.length === 3 && layout === '2+1') {
    return [
      p(835, 350, 420, 420, 0, '右上'),
      p(835, 850, 420, 420, 1, '右下'),
      p(340, 600, 420, 760, 2, '左')
    ];
  }
  if (glyphs.length === 4 && layout === 'huiwen') {
    return [
      p(860, 340, 470, 470, 0, '右上'),
      p(340, 340, 470, 470, 1, '左上'),
      p(340, 860, 470, 470, 2, '左下'),
      p(860, 860, 470, 470, 3, '右下')
    ];
  }
  if (glyphs.length === 4 && layout === 'conventional') {
    return [
      p(860, 340, 470, 470, 0, '右上'),
      p(860, 860, 470, 470, 1, '右下'),
      p(340, 340, 470, 470, 2, '左上'),
      p(340, 860, 470, 470, 3, '左下')
    ];
  }
  if (glyphs.length === 5 && layout === '2+3') {
    return [
      p(830, 350, 390, 390, 0, '右上'),
      p(830, 850, 390, 390, 1, '右下'),
      p(340, 250, 390, 300, 2, '左上'),
      p(340, 600, 390, 300, 3, '左中'),
      p(340, 950, 390, 300, 4, '左下')
    ];
  }
  if (glyphs.length === 5 && layout === '3+2') {
    return [
      p(830, 250, 390, 300, 0, '右上'),
      p(830, 600, 390, 300, 1, '右中'),
      p(830, 950, 390, 300, 2, '右下'),
      p(340, 350, 390, 390, 3, '左上'),
      p(340, 850, 390, 390, 4, '左下')
    ];
  }
  if (glyphs.length === 6) {
    return [
      p(830, 250, 390, 300, 0, '右上'),
      p(830, 600, 390, 300, 1, '右中'),
      p(830, 950, 390, 300, 2, '右下'),
      p(340, 250, 390, 300, 3, '左上'),
      p(340, 600, 390, 300, 4, '左中'),
      p(340, 950, 390, 300, 5, '左下')
    ];
  }
  throw new Error(`Unsupported ${glyphs.length}-character layout: ${layout}`);
}

function readingOrder(layout, count) {
  if (count === 1) return ['中'];
  if (count === 2) return ['上', '下'];
  if (count === 3 && layout === '2+1') return ['右上', '右下', '左'];
  if (count === 3) return ['右', '左上', '左下'];
  if (count === 4 && layout === 'huiwen') return ['右上', '左上', '左下', '右下'];
  if (count === 4) return ['右上', '右下', '左上', '左下'];
  if (count === 5 && layout === '3+2') return ['右上', '右中', '右下', '左上', '左下'];
  if (count === 5) return ['右上', '右下', '左上', '左中', '左下'];
  return ['右上', '右中', '右下', '左上', '左中', '左下'];
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.label) throw new Error('Missing required --label.');
  if (!args.output) throw new Error('Missing required --output.');
  if (!existsSync(fontPath)) throw new Error(`Bundled font not found: ${fontPath}`);

  const label = Array.from(args.label);
  const glyphs = Array.from(args.glyphs ?? args.label);
  if (label.length < 1 || label.length > 6) throw new Error('Label must contain 1–6 characters.');
  if (glyphs.length !== label.length) {
    throw new Error('--glyphs must contain the same number of characters as --label.');
  }

  const size = Number(args.size);
  if (!Number.isInteger(size) || size < 512 || size > 2400) {
    throw new Error('--size must be an integer between 512 and 2400.');
  }

  const layout = resolveLayout(label.length, args.layout);
  const style = args.style === 'auto' ? (label.length === 4 ? 'grid' : 'border') : args.style;
  if (!['grid', 'border', 'glyphs-only'].includes(style)) {
    throw new Error('--style must be auto, grid, border, or glyphs-only.');
  }
  const targets = placements(glyphs, layout, size);
  const workDir = mkdtempSync(path.join(os.tmpdir(), 'gc-sketchbook-seal-'));
  const output = path.resolve(args.output);
  mkdirSync(path.dirname(output), { recursive: true });

  try {
    const rendered = glyphs.map((glyph, index) => {
      const target = targets.find((entry) => entry.glyphIndex === index);
      const raw = path.join(workDir, `glyph-${index}-raw.png`);
      const fitted = path.join(workDir, `glyph-${index}.png`);
      runMagick([
        '-background', 'none',
        '-fill', args.ink,
        '-font', fontPath,
        '-pointsize', String(Math.round(size * 0.68)),
        `label:${glyph}`,
        '-trim', '+repage',
        raw
      ]);
      const rawSize = identifySize(raw);
      if (rawSize.width <= 2 || rawSize.height <= 2) {
        throw new Error(`Font has no visible glyph for "${glyph}"; pass an approved traditional form with --glyphs.`);
      }
      runMagick([raw, '-resize', `${target.maxWidth}x${target.maxHeight}>`, fitted]);
      return { file: fitted, ...identifySize(fitted), target, glyph };
    });

    const border = path.join(workDir, 'border.png');
    const borderInset = Math.round(size * 0.047);
    const borderRadius = Math.round(size * 0.03);
    const borderWidth = Math.max(18, Math.round(size * 0.037));
    const frameDraw = style === 'glyphs-only' ? [] : [
      `roundrectangle ${borderInset},${borderInset} ${size - borderInset},${size - borderInset} ${borderRadius},${borderRadius}`
    ];
    if (style === 'grid' && label.length === 4) {
      const dividerInset = Math.round(size * 0.06);
      const middle = Math.round(size / 2);
      frameDraw.push(`line ${middle},${dividerInset} ${middle},${size - dividerInset}`);
      frameDraw.push(`line ${dividerInset},${middle} ${size - dividerInset},${middle}`);
    }
    const borderArgs = ['-size', `${size}x${size}`, 'xc:none'];
    if (frameDraw.length > 0) {
      borderArgs.push(
        '-stroke', args.ink,
        '-strokewidth', String(borderWidth),
        '-fill', 'none',
        '-draw', frameDraw.join(' ')
      );
    }
    borderArgs.push(border);
    runMagick(borderArgs);

    let current = border;
    const solidSeal = path.join(workDir, 'solid-seal.png');
    rendered.forEach((entry, index) => {
      const next = index === rendered.length - 1 ? solidSeal : path.join(workDir, `stage-${index}.png`);
      const x = Math.round(entry.target.x - entry.width / 2);
      const y = Math.round(entry.target.y - entry.height / 2);
      runMagick([current, entry.file, '-gravity', 'northwest', '-geometry', `+${x}+${y}`, '-compose', 'over', '-composite', next]);
      current = next;
    });
    if (style === 'glyphs-only') {
      runMagick([
        '-size', `${size}x${size}`,
        'xc:#f4efe2',
        solidSeal,
        '-gravity', 'northwest',
        '-geometry', '+0+0',
        '-compose', 'over',
        '-composite',
        '-colorspace', 'sRGB',
        output
      ]);
    } else {
      runMagick([
        solidSeal,
        '-seed', '47',
        '-channel', 'RGB',
        '-attenuate', '0.055',
        '+noise', 'Gaussian',
        '+channel',
        output
      ]);
    }

    const map = Object.fromEntries(targets.map((entry) => [entry.position, glyphs[entry.glyphIndex]]));
    console.log(JSON.stringify({
      output,
      role: 'Chongxi glyph and position reference for imagegen; not a final seal',
      font: 'assets/chongxi_seal.otf',
      label: args.label,
      glyphs: glyphs.join(''),
      characterCount: label.length,
      layout,
      style,
      texture: style === 'glyphs-only' ? 'warm-paper control reference; not final output' : 'fixed-seed ink variation',
      positionMap: map,
      readingOrder: readingOrder(layout, label.length)
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
