// @ts-nocheck -- The Node validator is covered by Vitest and the content gate.

import { existsSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fromMarkdown } from 'mdast-util-from-markdown';
import { resolveStaticAsset } from './path-utils.mjs';

const placeholderAltPattern =
  /^(?:alt|image|img|photo|picture|screenshot|todo|tbd|placeholder|artwork)(?:\s+(?:\d+|one|two|three|four|five|six|seven|eight|nine|ten))?$/i;

function visit(node, callback) {
  callback(node);
  for (const child of node.children ?? []) visit(child, callback);
}

function normalizeDescription(value) {
  return value
    .normalize('NFKC')
    .toLowerCase()
    .replace(/\.[a-z0-9]{2,5}$/i, '')
    .replace(/[_-]+/g, ' ')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim();
}

function sourceDescription(url) {
  try {
    const parsed = new URL(url, 'https://content.invalid');
    return decodeURIComponent(path.posix.basename(parsed.pathname));
  } catch {
    return path.posix.basename(url);
  }
}

export function altTextProblem(alt, url = '') {
  const cleaned = typeof alt === 'string' ? alt.trim().replace(/\s+/g, ' ') : '';
  if (!cleaned) return 'image alt text is missing or blank';
  if (placeholderAltPattern.test(cleaned)) {
    return `image alt text ${JSON.stringify(cleaned)} is a placeholder`;
  }

  const normalizedAlt = normalizeDescription(cleaned);
  const normalizedSource = normalizeDescription(sourceDescription(url));
  if (normalizedSource && normalizedAlt === normalizedSource) {
    return `image alt text ${JSON.stringify(cleaned)} only repeats the file name`;
  }

  return undefined;
}

export function inspectMarkdownImages(source, file = '<content>') {
  const tree = fromMarkdown(source);
  const definitions = new Map();
  const images = [];

  visit(tree, (node) => {
    if (node.type === 'definition') definitions.set(node.identifier, node.url);
  });

  visit(tree, (node) => {
    if (node.type !== 'image' && node.type !== 'imageReference') return;

    const url = node.type === 'image' ? node.url : (definitions.get(node.identifier) ?? '');
    const line = node.position?.start.line;
    const location = line ? `${file}:${line}` : file;
    const problem = altTextProblem(node.alt, url);

    images.push({
      file,
      line,
      location,
      url,
      alt: node.alt ?? '',
      problem
    });
  });

  return images;
}

function markdownFiles(root, targets) {
  if (targets?.length) return targets.map((file) => path.resolve(root, file));

  return ['src/content/posts', 'src/content/projects'].flatMap((directory) => {
    const absoluteDirectory = path.join(root, directory);
    return readdirSync(absoluteDirectory)
      .filter((name) => name.endsWith('.md'))
      .map((name) => path.join(absoluteDirectory, name));
  });
}

function collectCoverReference(source, file) {
  const frontmatter = source.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/)?.[1] ?? '';
  const match = frontmatter.match(/^cover:\s*(['"]?)(\/[^\s'"\r\n]+)\1\s*$/m);
  return match ? [{ file, line: undefined, location: file, url: match[2] }] : [];
}

export function validateContentSources(root, targets) {
  const staticRoot = path.join(root, 'static');
  const references = [];
  const issues = [];

  for (const absoluteFile of markdownFiles(root, targets)) {
    const file = path.relative(root, absoluteFile).replaceAll('\\', '/');
    const source = readFileSync(absoluteFile, 'utf8');
    const images = inspectMarkdownImages(source, file);

    for (const image of images) {
      if (image.problem) issues.push(`${image.location}: ${image.problem}`);
      if (image.url.startsWith('/')) references.push(image);
    }
    references.push(...collectCoverReference(source, file));
  }

  for (const reference of references) {
    const target = resolveStaticAsset(staticRoot, reference.url);
    if (target === undefined || !existsSync(target)) {
      issues.push(`${reference.location}: missing static asset ${reference.url}`);
    }
  }

  return { references, issues };
}
