import { describe, expect, it } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '../..');
const sourceRoot = path.join(root, 'src');

function sourceFiles(directory: string): string[] {
  return readdirSync(directory).flatMap((entry) => {
    const absolute = path.join(directory, entry);
    if (statSync(absolute).isDirectory()) return sourceFiles(absolute);
    return /\.(svelte|css|ts)$/.test(entry) ? [absolute] : [];
  });
}

const files = sourceFiles(sourceRoot);
const legacyTokens = [
  'paper',
  'surface-muted',
  'surface',
  'ink-soft',
  'ink-muted',
  'ink',
  'hairline-strong',
  'hairline',
  'placeholder',
  'brand-light',
  'brand-tint',
  'brand',
  'status-error',
  'status-success',
  'status-warning-field',
  'status-warning',
  'status-info',
  'focus-ring-offset',
  'focus-ring',
  'dot-rule-image',
  'book-shadow',
  'whisper-shadow',
  'shadow-offset',
  'emboss-light',
  'emboss-dark',
  'font',
  'sans',
  'display',
  'mono',
  'track-caps',
  'track-nav',
  'ease-out',
  'ease-in-out',
  'ease-drawer',
  'duration-fast',
  'duration-ui'
];

describe('WeBaseUI migration boundary', () => {
  it('uses canonical WeBase tokens throughout xue source', () => {
    const legacyPattern = new RegExp(`--(?:${legacyTokens.join('|')})(?![-\\w])`, 'g');

    for (const file of files) {
      const source = readFileSync(file, 'utf8');
      expect(source.match(legacyPattern) ?? [], path.relative(root, file)).toEqual([]);
    }
  });

  it('imports components only through the public package root', () => {
    for (const file of files) {
      const source = readFileSync(file, 'utf8');
      expect(source, path.relative(root, file)).not.toMatch(
        /from ['"]@webaseui\/svelte\/(?:dist|src|components|lib)/
      );
    }
  });

  it('keeps every public page on a WeBaseUI-backed rendering path', () => {
    const pages = files.filter((file) => /src\/routes\/.*\+page\.svelte$/.test(file));
    const migratedHomeCompositions = [
      'src/lib/components/home/AboutSection.svelte',
      'src/lib/components/home/ProjectCard.svelte'
    ];

    for (const page of pages) {
      const relative = path.relative(root, page);
      const source = readFileSync(page, 'utf8');
      if (source.includes("from '@webaseui/svelte'")) continue;

      expect(relative).toBe('src/routes/+page.svelte');
      for (const composition of migratedHomeCompositions) {
        expect(readFileSync(path.join(root, composition), 'utf8'), composition).toContain(
          "from '@webaseui/svelte'"
        );
      }
    }
  });
});
