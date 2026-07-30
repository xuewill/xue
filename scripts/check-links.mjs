import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { site } from '../src/lib/generated/content/index.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const buildRoot = path.join(root, 'build');
const siteOrigin = new URL(site.url).origin;
const anchorPattern = /<a\b[^>]*\bhref=(["'])(.*?)\1/gi;
const internalLinks = new Map();
const externalLinks = new Set();
const failures = [];
const warnings = [];

function listHtmlFiles(directory) {
  return readdirSync(directory).flatMap((name) => {
    const target = path.join(directory, name);
    return statSync(target).isDirectory()
      ? listHtmlFiles(target)
      : target.endsWith('.html')
        ? [target]
        : [];
  });
}

function routeForHtml(file) {
  const relative = path.relative(buildRoot, file).replaceAll('\\', '/');
  if (relative === 'index.html') return '/';
  return `/${relative.replace(/\.html$/, '')}`;
}

function decodeFragment(value) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function targetCandidates(pathname) {
  const normalized = pathname === '/' ? '' : pathname.replace(/^\/+|\/+$/g, '');
  if (!normalized) return [path.join(buildRoot, 'index.html')];

  const exact = path.join(buildRoot, normalized);
  if (path.extname(normalized)) return [exact];
  return [exact, `${exact}.html`, path.join(exact, 'index.html')];
}

function validateInternalLink(url, sourceFile) {
  const candidates = targetCandidates(url.pathname);
  const target = candidates.find((candidate) => existsSync(candidate) && !statSync(candidate).isDirectory());

  if (!target) {
    failures.push(`${path.relative(root, sourceFile)}: missing internal target ${url.pathname}`);
    return;
  }

  const fragment = decodeFragment(url.hash.slice(1));
  if (!fragment || !target.endsWith('.html')) return;

  const html = readFileSync(target, 'utf8');
  if (!html.includes(`id="${fragment}"`) && !html.includes(`id='${fragment}'`)) {
    failures.push(
      `${path.relative(root, sourceFile)}: missing fragment #${fragment} in ${url.pathname}`
    );
  }
}

async function fetchExternal(url, method) {
  return fetch(url, {
    method,
    redirect: 'follow',
    headers: {
      accept: 'text/html,application/xhtml+xml',
      'user-agent': 'xue-link-check/1.0 (+https://willxue.com)'
    },
    signal: AbortSignal.timeout(10_000)
  });
}

async function validateExternalLink(url) {
  try {
    let response = await fetchExternal(url, 'HEAD');
    if (response.status === 405) response = await fetchExternal(url, 'GET');

    if (response.status === 404 || response.status === 410) {
      failures.push(`${url}: returned ${response.status}`);
    } else if (response.status >= 500 || response.status === 429) {
      warnings.push(`${url}: inconclusive response ${response.status}`);
    }
  } catch (error) {
    warnings.push(`${url}: inconclusive request (${error instanceof Error ? error.message : error})`);
  }
}

if (!existsSync(buildRoot)) {
  throw new Error('build/ does not exist; run npm run build before checking links');
}

for (const file of listHtmlFiles(buildRoot)) {
  const html = readFileSync(file, 'utf8');
  const documentUrl = new URL(routeForHtml(file), site.url);

  for (const match of html.matchAll(anchorPattern)) {
    const href = match[2].trim();
    if (!href || /^(?:mailto:|tel:|javascript:|data:)/i.test(href)) continue;

    const url = new URL(href, documentUrl);
    if (!['http:', 'https:'].includes(url.protocol)) continue;

    if (url.origin === siteOrigin) {
      internalLinks.set(`${file}:${url.pathname}${url.hash}`, { url, file });
    } else {
      externalLinks.add(url.toString());
    }
  }
}

for (const { url, file } of internalLinks.values()) validateInternalLink(url, file);
await Promise.all([...externalLinks].map(validateExternalLink));

if (warnings.length > 0) {
  for (const warning of warnings) console.warn(`External link warning: ${warning}`);
  if (process.env.LINK_CHECK_STRICT_EXTERNAL === '1') failures.push(...warnings);
}

if (failures.length > 0) {
  for (const failure of failures) console.error(`Broken link: ${failure}`);
  process.exit(1);
}

console.log(
  `Validated ${internalLinks.size} internal links and checked ${externalLinks.size} external links` +
    (warnings.length > 0 ? ` (${warnings.length} inconclusive)` : '') +
    '.'
);
