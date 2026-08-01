import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { parse } from 'yaml';

const root = process.cwd();
const buildRoot = path.join(root, 'build');
const failures = [];

function contentFiles(directory) {
  return readdirSync(path.join(root, directory))
    .filter((name) => name.endsWith('.md'))
    .map((name) => path.join(root, directory, name));
}

function frontmatter(file) {
  const source = readFileSync(file, 'utf8');
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  if (!match) throw new Error(`${path.relative(root, file)}: missing YAML frontmatter`);
  return parse(match[1]);
}

function listFiles(directory) {
  if (!existsSync(directory)) return [];
  return readdirSync(directory).flatMap((name) => {
    const target = path.join(directory, name);
    return statSync(target).isDirectory() ? listFiles(target) : [target];
  });
}

if (!existsSync(buildRoot)) {
  throw new Error('build/ does not exist; run npm run build before checking published content');
}

const posts = contentFiles('src/content/posts').map((file) => ({
  slug: path.basename(file, '.md'),
  data: frontmatter(file)
}));
const projects = contentFiles('src/content/projects').map((file) => ({
  slug: path.basename(file, '.md'),
  data: frontmatter(file)
}));
const rss = readFileSync(path.join(buildRoot, 'rss.xml'), 'utf8');
const sitemap = readFileSync(path.join(buildRoot, 'sitemap.xml'), 'utf8');
const tagPages = listFiles(path.join(buildRoot, 'blog/tags'))
  .map((file) => readFileSync(file, 'utf8'))
  .join('\n');

for (const post of posts.filter(({ data }) => data.draft)) {
  if (existsSync(path.join(buildRoot, 'blog', `${post.slug}.html`))) {
    failures.push(`draft post emitted a detail route: /blog/${post.slug}`);
  }
  if (rss.includes(`/blog/${post.slug}`)) failures.push(`draft post appears in RSS: ${post.slug}`);
  if (sitemap.includes(`/blog/${post.slug}`)) {
    failures.push(`draft post appears in Sitemap: ${post.slug}`);
  }
  if (tagPages.includes(`/blog/${post.slug}`)) {
    failures.push(`draft post appears on a tag page: ${post.slug}`);
  }
}

for (const project of projects.filter(({ data }) => data.draft)) {
  if (existsSync(path.join(buildRoot, 'home', `${project.slug}.html`))) {
    failures.push(`draft project emitted a detail route: /home/${project.slug}`);
  }
  if (sitemap.includes(`/home/${project.slug}`)) {
    failures.push(`draft project appears in Sitemap: ${project.slug}`);
  }
}

if (failures.length > 0) {
  for (const failure of failures) console.error(failure);
  process.exit(1);
}

console.log(
  `Confirmed ${posts.filter(({ data }) => data.draft).length} draft posts and ` +
    `${projects.filter(({ data }) => data.draft).length} draft projects are absent from the published build.`
);
