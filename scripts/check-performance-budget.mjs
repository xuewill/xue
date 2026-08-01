#!/usr/bin/env node
// @ts-nocheck -- The Node helper is covered by its dedicated unit test and CLI checks.

import { gzipSync } from 'node:zlib';
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const defaultBaselinePath = path.join(root, 'plans', 'performance-baseline.json');

export function kibibytes(bytes) {
  return `${(bytes / 1024).toFixed(1)} KiB`;
}

function readJson(file) {
  return JSON.parse(readFileSync(file, 'utf8'));
}

function listFiles(directory) {
  if (!existsSync(directory)) return [];
  return readdirSync(directory).flatMap((name) => {
    const target = path.join(directory, name);
    return statSync(target).isDirectory() ? listFiles(target) : [target];
  });
}

function routeForHtml(file, buildRoot) {
  const relative = path.relative(buildRoot, file).replaceAll(path.sep, '/');
  if (relative === 'index.html') return '/';
  return `/${relative.replace(/\.html$/, '')}`;
}

function htmlFiles(buildRoot) {
  return listFiles(buildRoot).filter((file) => file.endsWith('.html'));
}

function routeBudget(route, budgets) {
  if (budgets[route]) return budgets[route];
  const wildcard = Object.keys(budgets).find(
    (pattern) => pattern.endsWith('*') && route.startsWith(pattern.slice(0, -1))
  );
  return wildcard ? budgets[wildcard] : undefined;
}

function normalizeManifestLabel(key, value) {
  const name = value.name ?? key.replace(/^_/, '').replace(/\.[a-z0-9]+$/, '');
  return `${value.isEntry ? 'entry' : 'chunk'}:${name}`;
}

function manifestAssetLabels(manifest) {
  const labels = new Map();
  for (const [key, value] of Object.entries(manifest)) {
    const label = normalizeManifestLabel(key, value);
    for (const file of [value.file, ...(value.css ?? [])]) {
      if (!file) continue;
      const normalized = file.replace(/^\.\//, '');
      const current = labels.get(normalized) ?? new Set();
      current.add(label);
      labels.set(normalized, current);
    }
  }
  return labels;
}

function assetPathFromHref(href, htmlFile, buildRoot) {
  const pathname = new URL(href, 'https://budget.invalid').pathname;
  const relative = pathname.startsWith('/')
    ? pathname.slice(1)
    : path.relative(buildRoot, path.resolve(path.dirname(htmlFile), pathname));
  return path.resolve(buildRoot, relative);
}

function routeAssets(htmlFile, buildRoot, assetLabels) {
  const html = readFileSync(htmlFile, 'utf8');
  const assets = new Map();
  const pattern = /(?:src|href)=["']([^"']+\.(?:js|css))["']/g;
  for (const match of html.matchAll(pattern)) {
    const file = assetPathFromHref(match[1], htmlFile, buildRoot);
    if (!existsSync(file) || !/\.(?:js|css)$/.test(file)) continue;
    const relative = path.relative(buildRoot, file).replaceAll(path.sep, '/');
    const kind = path.extname(file).slice(1);
    const labels = [...(assetLabels.get(relative) ?? [])].sort();
    const key = `${kind}:${labels[0] ?? `asset:${relative}`}`;
    assets.set(relative, {
      key,
      kind,
      file: `/${relative}`,
      rawBytes: statSync(file).size,
      gzipBytes: gzipSync(readFileSync(file), { level: 9 }).length
    });
  }
  return [...assets.values()].sort((a, b) => a.file.localeCompare(b.file));
}

export function collectBuildReport({ root: projectRoot = root } = {}) {
  const buildRoot = path.join(projectRoot, 'build');
  const manifestPath = path.join(projectRoot, '.svelte-kit', 'output', 'client', '.vite', 'manifest.json');
  if (!existsSync(buildRoot)) throw new Error('build/ does not exist; run npm run build first');
  if (!existsSync(manifestPath)) throw new Error(`${manifestPath}: Vite manifest does not exist; run npm run build first`);

  const manifest = readJson(manifestPath);
  const assetLabels = manifestAssetLabels(manifest);
  const routes = {};
  for (const file of htmlFiles(buildRoot)) {
    const route = routeForHtml(file, buildRoot);
    const resources = routeAssets(file, buildRoot, assetLabels);
    const totals = resources.reduce(
      (result, resource) => {
        result[resource.kind] += resource.gzipBytes;
        return result;
      },
      { js: 0, css: 0 }
    );
    routes[route] = { ...totals, resources };
  }
  return { version: 1, routes };
}

export function collectImageReport({ root: projectRoot = root } = {}) {
  const generatedRoot = path.join(projectRoot, 'static', 'generated');
  if (!existsSync(generatedRoot)) throw new Error('static/generated does not exist; run npm run build first');
  return listFiles(generatedRoot)
    .filter((file) => /\.(?:png|jpe?g|webp|avif)$/i.test(file))
    .map((file) => ({
      file: path.relative(projectRoot, file).replaceAll(path.sep, '/'),
      bytes: statSync(file).size
    }))
    .sort((a, b) => b.bytes - a.bytes);
}

function checkImages(report, config) {
  const failures = [];
  for (const image of report) {
    const generatedPath = image.file.replace(/^static\//, '');
    const prefix = Object.keys(config.imageBytes).find((candidate) => generatedPath.startsWith(candidate));
    if (!prefix) {
      failures.push(`${image.file} has no configured image budget`);
      continue;
    }
    const limit = config.imageBytes[prefix];
    if (image.bytes > limit) {
      failures.push(`${image.file} is ${kibibytes(image.bytes)}; maximum is ${kibibytes(limit)}`);
    }
  }
  return failures;
}

function checkBuild(report, config) {
  const failures = [];
  for (const [route, page] of Object.entries(report.routes)) {
    const budget = routeBudget(route, config.gzip.routes);
    if (!budget) continue;
    for (const resource of page.resources) {
      const limit = config.gzip.perResource[resource.kind];
      if (limit !== undefined && resource.gzipBytes > limit) {
        failures.push(`${route} ${resource.key} (${resource.file}) is ${kibibytes(resource.gzipBytes)} gzip; maximum is ${kibibytes(limit)}`);
      }
    }
    for (const kind of ['js', 'css']) {
      if (page[kind] > budget[kind]) {
        failures.push(`${route} ${kind.toUpperCase()} total is ${kibibytes(page[kind])} gzip; maximum is ${kibibytes(budget[kind])}`);
      }
    }
  }
  return failures;
}

function compareBuilds(current, baseline) {
  const changes = [];
  for (const [route, page] of Object.entries(current.routes)) {
    const previous = baseline?.routes?.[route];
    if (!previous) {
      changes.push(`${route}: new route (${kibibytes(page.js)} JS, ${kibibytes(page.css)} CSS gzip)`);
      continue;
    }
    for (const kind of ['js', 'css']) {
      const delta = page[kind] - previous[kind];
      if (delta >= 1024) changes.push(`${route}: ${kind.toUpperCase()} total +${kibibytes(delta)} (${kibibytes(previous[kind])} -> ${kibibytes(page[kind])})`);
    }
    const oldResources = new Map((previous.resources ?? []).map((resource) => [resource.key, resource]));
    for (const resource of page.resources) {
      const old = oldResources.get(resource.key);
      if (!old) {
        changes.push(`${route}: new ${resource.key} ${resource.file} (${kibibytes(resource.gzipBytes)} gzip)`);
      } else if (resource.gzipBytes - old.gzipBytes >= 1024) {
        changes.push(`${route}: ${resource.key} ${resource.file} +${kibibytes(resource.gzipBytes - old.gzipBytes)} gzip (${kibibytes(old.gzipBytes)} -> ${kibibytes(resource.gzipBytes)})`);
      }
    }
  }
  return changes.sort((a, b) => a.localeCompare(b));
}

function formatFailure(title, failures) {
  if (failures.length === 0) return '';
  return [`${title}:`, ...failures.map((failure) => `  - ${failure}`)].join('\n');
}

export function runPerformanceBudget({ projectRoot = root, baselinePath = defaultBaselinePath, writeBaseline = false } = {}) {
  const config = readJson(path.join(projectRoot, 'performance-budget.json'));
  const imageReport = collectImageReport({ root: projectRoot });
  const buildReport = collectBuildReport({ root: projectRoot });
  const imageFailures = checkImages(imageReport, config);
  const buildFailures = checkBuild(buildReport, config);

  if (writeBaseline) {
    writeFileSync(baselinePath, `${JSON.stringify(buildReport, null, 2)}\n`);
  }

  const baseline = existsSync(baselinePath) ? readJson(baselinePath) : undefined;
  const changes = baseline ? compareBuilds(buildReport, baseline) : [];
  return { config, imageReport, buildReport, imageFailures, buildFailures, changes, baselinePath };
}

function main() {
  const writeBaseline = process.argv.includes('--write-baseline');
  const result = runPerformanceBudget({ writeBaseline });
  for (const image of result.imageReport.slice(0, 5)) {
    console.log(`Image ${image.file}: ${kibibytes(image.bytes)}`);
  }
  for (const [route, page] of Object.entries(result.buildReport.routes)) {
    console.log(`Route ${route}: ${kibibytes(page.js)} JS gzip, ${kibibytes(page.css)} CSS gzip`);
  }
  if (result.changes.length > 0) {
    console.log('Build growth sources:');
    for (const change of result.changes) console.log(`  - ${change}`);
  } else if (existsSync(result.baselinePath)) {
    console.log('Build growth sources: none above 1.0 KiB.');
  }
  const failureText = [
    formatFailure('Image budget exceeded', result.imageFailures),
    formatFailure('Build budget exceeded', result.buildFailures)
  ].filter(Boolean);
  if (failureText.length > 0) {
    console.error(failureText.join('\n'));
    process.exitCode = 1;
  } else {
    console.log('Performance budgets passed.');
  }
}

if (import.meta.url === `file://${process.argv[1]}`) main();
