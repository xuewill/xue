import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateContentSources } from './content-validation.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const { references, issues } = validateContentSources(root);

if (issues.length > 0) {
  for (const issue of issues) console.error(issue);
  process.exit(1);
}

console.log(`Validated ${references.length} content image references and alt text.`);
