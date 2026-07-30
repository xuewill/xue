import { existsSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { resolveStaticAsset } from './path-utils.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const staticRoot = path.resolve(root, 'static');
const references = [];

function collect(file, pattern, group = 1) {
  const content = readFileSync(path.join(root, file), 'utf8');
  for (const match of content.matchAll(pattern)) references.push({ file, asset: match[group] });
}

for (const directory of ['src/content/posts', 'src/content/projects']) {
  for (const name of readdirSync(path.join(root, directory))) {
    if (!name.endsWith('.md')) continue;
    const file = path.join(directory, name).replaceAll('\\', '/');
    collect(file, /(?:cover:\s*|\]\()(['"]?)(\/[^\s)'"\r\n]+)\1/g, 2);
  }
}

const missing = references.filter(({ asset }) => {
  const target = resolveStaticAsset(staticRoot, asset);
  return target === undefined || !existsSync(target);
});

if (missing.length > 0) {
  for (const item of missing) console.error(`${item.file}: missing static asset ${item.asset}`);
  process.exit(1);
}

console.log(`Validated ${references.length} content asset references.`);
