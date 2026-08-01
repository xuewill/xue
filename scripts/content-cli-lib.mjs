// @ts-nocheck -- The executable is covered by focused unit and process-level CLI tests.

import { spawn } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { rename, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { createInterface } from 'node:readline/promises';
import { parseArgs } from 'node:util';
import { parse, stringify } from 'yaml';

export const EXIT = Object.freeze({
  success: 0,
  runtime: 1,
  usage: 2,
  validation: 3,
  interrupted: 130
});

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const targetPattern = /^(post|project)\/([a-z0-9]+(?:-[a-z0-9]+)*)$/;

export class CliError extends Error {
  constructor(message, exitCode = EXIT.runtime) {
    super(message);
    this.name = 'CliError';
    this.exitCode = exitCode;
  }
}

export function parseTarget(value) {
  const match = value?.match(targetPattern);
  if (!match) {
    throw new CliError(
      `Invalid content target ${JSON.stringify(value)}. Use post/<slug> or project/<slug>.`,
      EXIT.usage
    );
  }
  return { type: match[1], slug: match[2] };
}

export function targetDetails(root, value) {
  const target = parseTarget(value);
  const directory = target.type === 'post' ? 'posts' : 'projects';
  const file = path.join(root, 'src', 'content', directory, `${target.slug}.md`);
  const route = target.type === 'post' ? `/blog/${target.slug}` : `/home/${target.slug}`;
  return { ...target, file, route };
}

export function calendarDateInTimeZone(timeZone, date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  return `${values.year}-${values.month}-${values.day}`;
}

export function replaceDraftState(source, draft) {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  if (!match) {
    throw new CliError('Content file is missing YAML frontmatter.', EXIT.validation);
  }
  if (!/^draft:\s*(?:true|false)\s*$/m.test(match[1])) {
    throw new CliError('Frontmatter must contain a boolean draft field.', EXIT.validation);
  }

  const frontmatter = match[1].replace(/^draft:\s*(?:true|false)\s*$/m, `draft: ${draft}`);
  return source.replace(match[0], `---\n${frontmatter}\n---\n`);
}

export function readFrontmatter(source, file = '<content>') {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  if (!match) throw new CliError(`${file}: missing YAML frontmatter`, EXIT.validation);

  try {
    return parse(match[1]);
  } catch (error) {
    throw new CliError(
      `${file}: invalid YAML frontmatter (${error instanceof Error ? error.message : error})`,
      EXIT.validation
    );
  }
}

async function atomicWrite(file, content, { replace = false } = {}) {
  const temporary = path.join(path.dirname(file), `.${path.basename(file)}.${randomUUID()}.tmp`);
  try {
    await writeFile(temporary, content, { encoding: 'utf8', flag: 'wx' });
    if (!replace && existsSync(file)) {
      throw new CliError(`${file} already exists; choose another slug.`, EXIT.validation);
    }
    await rename(temporary, file);
  } finally {
    await unlink(temporary).catch(() => {});
  }
}

function contentFiles(root, type) {
  const directory = path.join(root, 'src', 'content', type === 'post' ? 'posts' : 'projects');
  return readdirSync(directory)
    .filter((name) => name.endsWith('.md'))
    .map((name) => path.join(directory, name));
}

function ensureNoSlugConflict(root, type, slug) {
  const requested = `${slug}.md`.toLowerCase();
  const conflict = contentFiles(root, type).find(
    (file) => path.basename(file).toLowerCase() === requested
  );
  if (conflict) {
    throw new CliError(
      `${path.relative(root, conflict)} already uses slug ${slug}; choose another slug.`,
      EXIT.validation
    );
  }
}

function readSite(root) {
  return parse(readFileSync(path.join(root, 'src/content/config/site.yaml'), 'utf8'));
}

function knownTags(root) {
  const document = parse(readFileSync(path.join(root, 'src/content/config/tags.yaml'), 'utf8'));
  return new Set((document.tags ?? []).map(({ slug }) => slug));
}

function readMetadata(root) {
  const document = parse(readFileSync(path.join(root, 'src/content/config/metadata.yaml'), 'utf8'));
  return {
    locations: new Set((document.locations ?? []).map(({ slug }) => slug)),
    roles: new Set((document.roles ?? []).map(({ slug }) => slug)),
    media: new Set((document.media ?? []).map(({ slug }) => slug))
  };
}

function existingProjectOrders(root) {
  return new Map(
    contentFiles(root, 'project').map((file) => {
      const frontmatter = readFrontmatter(readFileSync(file, 'utf8'), path.relative(root, file));
      return [Number(frontmatter.order), path.basename(file, '.md')];
    })
  );
}

function validateDate(value, field) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new CliError(`${field} must use YYYY-MM-DD.`, EXIT.validation);
  }
  const parsed = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== value) {
    throw new CliError(`${field} must be a real calendar date.`, EXIT.validation);
  }
}

function requireText(value, flag) {
  const cleaned = value?.trim();
  if (!cleaned) {
    throw new CliError(`Missing ${flag}. Pass ${flag} <value>.`, EXIT.usage);
  }
  return cleaned;
}

function requireSlug(value) {
  const slug = requireText(value, '--slug');
  if (!slugPattern.test(slug)) {
    throw new CliError(
      `Invalid slug ${JSON.stringify(slug)}. Use lowercase kebab-case.`,
      EXIT.validation
    );
  }
  return slug;
}

function validateStaticAsset(root, value, flag) {
  if (!value.startsWith('/')) {
    throw new CliError(`${flag} must be an absolute site path beginning with /.`, EXIT.validation);
  }
  const target = path.resolve(path.join(root, 'static'), `.${value}`);
  const relative = path.relative(path.join(root, 'static'), target);
  if (relative.startsWith('..') || path.isAbsolute(relative) || !existsSync(target)) {
    throw new CliError(`${flag} references missing static asset ${value}.`, EXIT.validation);
  }
}

function renderMarkdown(frontmatter) {
  return `---\n${stringify(frontmatter, { lineWidth: 0 }).trimEnd()}\n---\n\n`;
}

function splitTags(value) {
  return value
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function splitReferences(value) {
  return value ? value.split(',').map((item) => item.trim()).filter(Boolean) : [];
}

function validateReferences(value, flag, known) {
  const values = splitReferences(value);
  const duplicates = values.filter((item, index) => values.indexOf(item) !== index);
  if (duplicates.length) throw new CliError(`${flag} repeats ${duplicates[0]}.`, EXIT.validation);
  const unknown = values.filter((item) => !known.has(item));
  if (unknown.length) throw new CliError(`Unknown ${flag}: ${unknown.join(', ')}. Check src/content/config/metadata.yaml.`, EXIT.validation);
  return values;
}

export function buildPostDraft(root, input) {
  const site = readSite(root);
  const slug = requireSlug(input.slug);
  const title = requireText(input.title, '--title');
  const description = requireText(input.description, '--description');
  const date = input.date ?? calendarDateInTimeZone(site.timezone);
  const tags = splitTags(requireText(input.tags, '--tags'));
  const locations = validateReferences(input.locations, '--locations', readMetadata(root).locations);
  const configuredTags = knownTags(root);

  validateDate(date, '--date');
  if (tags.length === 0) throw new CliError('--tags must contain at least one tag.', EXIT.validation);
  const unknown = tags.filter((tag) => !configuredTags.has(tag));
  if (unknown.length > 0) {
    throw new CliError(
      `Unknown tag${unknown.length === 1 ? '' : 's'}: ${unknown.join(', ')}. Check src/content/config/tags.yaml.`,
      EXIT.validation
    );
  }
  if (input.cover) validateStaticAsset(root, input.cover, '--cover');
  ensureNoSlugConflict(root, 'post', slug);

  const frontmatter = {
    title,
    description,
    date,
    ...(input.cover ? { cover: input.cover } : {}),
    draft: true,
    tags,
    ...(locations.length > 0 ? { locations } : {})
  };
  const target = targetDetails(root, `post/${slug}`);
  return { ...target, content: renderMarkdown(frontmatter), frontmatter };
}

export function buildProjectDraft(root, input) {
  const slug = requireSlug(input.slug);
  const title = requireText(input.title, '--title');
  const description = requireText(input.description, '--description');
  const startYear = Number(requireText(input['start-year'] ?? input.startYear, '--start-year'));
  const status = requireText(input.status ?? 'completed', '--status');
  const endYearValue = input['end-year'] ?? input.endYear;
  const endYear = endYearValue === undefined || endYearValue === '' ? undefined : Number(endYearValue);
  const category = requireText(input.category, '--category');
  const cover = requireText(input.cover, '--cover');
  const order = Number(input.order);

  if (!Number.isInteger(startYear) || startYear < 1900 || startYear > 2100) throw new CliError('--start-year must be a year from 1900 to 2100.', EXIT.validation);
  if (!['completed', 'ongoing'].includes(status)) throw new CliError('--status must be completed or ongoing.', EXIT.validation);
  if (status === 'ongoing' && endYear !== undefined) throw new CliError('Ongoing projects must omit --end-year.', EXIT.validation);
  if (status === 'completed' && !Number.isInteger(endYear)) throw new CliError('Completed projects require --end-year.', EXIT.validation);
  if (Number.isInteger(endYear) && endYear < startYear) throw new CliError('--end-year must be greater than or equal to --start-year.', EXIT.validation);
  const metadata = readMetadata(root);
  const locations = validateReferences(input.locations, '--locations', metadata.locations);
  const roles = validateReferences(requireText(input.roles, '--roles'), '--roles', metadata.roles);
  const media = validateReferences(requireText(input.media, '--media'), '--media', metadata.media);

  if (!Number.isInteger(order)) {
    throw new CliError('--order must be an integer.', EXIT.validation);
  }
  validateStaticAsset(root, cover, '--cover');
  ensureNoSlugConflict(root, 'project', slug);
  const orders = existingProjectOrders(root);
  if (orders.has(order)) {
    throw new CliError(
      `Project order ${order} is already used by ${orders.get(order)}; choose another order.`,
      EXIT.validation
    );
  }

  const frontmatter = {
    title,
    description,
    startYear,
    ...(status === 'completed' ? { endYear } : {}),
    status,
    category,
    ...(locations.length > 0 ? { locations } : {}),
    roles,
    media,
    cover,
    order,
    draft: true
  };
  const target = targetDetails(root, `project/${slug}`);
  return { ...target, content: renderMarkdown(frontmatter), frontmatter };
}

function commonOptions() {
  return {
    help: { type: 'boolean', short: 'h' },
    json: { type: 'boolean' },
    'no-color': { type: 'boolean' }
  };
}

function parseOptions(args, options) {
  try {
    return parseArgs({ args, options, strict: true, allowPositionals: false }).values;
  } catch (error) {
    throw new CliError(
      `${error instanceof Error ? error.message : error}\nRun npm run content -- --help for usage.`,
      EXIT.usage
    );
  }
}

function writeResult(io, result, options = {}) {
  if (options.json) io.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  else io.stdout.write(`${result.message}\n`);
}

function writeProgress(io, message, options = {}) {
  if (!options.json) io.stderr.write(`${message}\n`);
}

function runProcess(command, args, { cwd, io, env, signal, label, quiet = false } = {}) {
  return new Promise((resolve, reject) => {
    if (label) writeProgress(io, label);
    const child = spawn(command, args, {
      cwd,
      env: { ...process.env, ...env },
      stdio: ['ignore', 'pipe', 'pipe'],
      signal
    });
    let output = '';
    child.stdout.on('data', (chunk) => {
      output += chunk;
      if (!quiet) io.stderr.write(chunk);
    });
    child.stderr.on('data', (chunk) => {
      output += chunk;
      if (!quiet) io.stderr.write(chunk);
    });
    child.on('error', reject);
    child.on('close', (code, processSignal) => {
      if (processSignal === 'SIGINT') {
        reject(new CliError('Interrupted.', EXIT.interrupted));
      } else if (code === 0) {
        resolve(output);
      } else {
        if (quiet && output) io.stderr.write(output);
        reject(new CliError(`${label ?? command} failed with exit code ${code}.`, EXIT.validation));
      }
    });
  });
}

async function validateRepository(root, context, { full = false, quiet = false } = {}) {
  const args = ['run', full ? 'verify' : 'validate:content'];
  await runProcess('npm', args, {
    cwd: root,
    io: context.io,
    signal: context.signal,
    label: full ? 'Running the complete publication checks…' : 'Checking content…',
    quiet
  });
}

async function promptForMissing(type, values, context) {
  if (values['no-input'] || !context.io.stdin.isTTY) return values;

  const terminal = createInterface({
    input: context.io.stdin,
    output: context.io.stderr,
    terminal: true
  });
  const ask = async (key, label, fallback) => {
    if (values[key]) return;
    const suffix = fallback === undefined ? '' : ` [${fallback}]`;
    const answer = (await terminal.question(`${label}${suffix}: `)).trim();
    values[key] = answer || fallback;
  };

  try {
    await ask('slug', 'Slug');
    await ask('title', 'Title');
    await ask('description', 'Description');
    if (type === 'post') {
      await ask('tags', 'Tags (comma-separated)');
      await ask('date', 'Publication date', calendarDateInTimeZone(readSite(context.root).timezone));
    } else {
      const orders = [...existingProjectOrders(context.root).keys()];
      await ask('status', 'Status', 'completed');
      await ask('start-year', 'Start year', new Date().getFullYear().toString());
      if (values.status !== 'ongoing') {
        await ask('end-year', 'End year', values['start-year']);
      }
      await ask('category', 'Category');
      await ask('locations', 'Locations (comma-separated)');
      await ask('roles', 'Roles (comma-separated)', 'designer');
      await ask('media', 'Media (comma-separated)', 'mixed-media');
      await ask('cover', 'Cover path');
      await ask('order', 'Order', (Math.max(0, ...orders) + 1).toString());
    }
  } finally {
    terminal.close();
  }
  return values;
}

function conciseHelp() {
  return `Create, check, preview, and prepare repository content for publication.

Examples:
  npm run content -- new post
  npm run content -- check post/article-slug
  npm run content -- preview post/article-slug --open
  npm run content -- publish post/article-slug --dry-run

Run npm run content -- --help for full usage.`;
}

function fullHelp() {
  return `${conciseHelp()}

Usage:
  npm run content -- <command> [options]

Commands:
  new post|project       Create a draft without copying existing content
  check [target]         Validate all content, optionally naming the intended target
  preview <target>       Validate and start a local draft-inclusive preview
  publish <target>       Mark a draft published and run npm run verify
  help [command]         Show help

Targets use post/<slug> or project/<slug>.

Global conventions:
  -h, --help             Show help
      --json             Emit the primary result as JSON
      --no-color         Disable color (also honors NO_COLOR)
      --no-input         Never prompt; missing input is an error
      --dry-run          Show or validate a write without keeping it

This tool does not commit, push, open pull requests, deploy, or collect analytics.
Issues: https://github.com/xuewill/xue/issues`;
}

function commandHelp(command) {
  const sections = {
    new: `Usage:
  npm run content -- new post [--slug <slug> --title <title> --description <text> --tags <a,b>]
  npm run content -- new project [--slug <slug> --title <title> --description <text> --start-year <year> --end-year <year> --status <completed|ongoing> --category <name> --cover </path> --order <n> --roles <a,b> --media <a,b>]

Options:
  --date <YYYY-MM-DD>    Post publication date; defaults to the site-timezone date
  --locations <a,b>      Optional taxonomy slugs
  --cover </path>        Optional for posts and required for projects
  --no-input             Require all mandatory values as flags
  --dry-run              Print the destination without writing it
  --json                 Emit JSON`,
    check: `Usage:
  npm run content -- check [post/<slug>|project/<slug>] [--json]`,
    preview: `Usage:
  npm run content -- preview <target> [--open] [--host] [--port <port>]

The default server binds to 127.0.0.1. --host explicitly exposes it on 0.0.0.0.`,
    publish: `Usage:
  npm run content -- publish <target> [--dry-run] [--yes] [--no-input] [--json]

Publication changes only the local draft state. It never commits, pushes, or deploys.`
  };
  return sections[command] ?? fullHelp();
}

async function newCommand(args, context) {
  if (args[0] === '-h' || args[0] === '--help') {
    context.io.stdout.write(`${commandHelp('new')}\n`);
    return;
  }
  const type = args.shift();
  if (!['post', 'project'].includes(type)) {
    throw new CliError('new requires post or project.\n\n' + commandHelp('new'), EXIT.usage);
  }
  if (args.includes('-h') || args.includes('--help')) {
    context.io.stdout.write(`${commandHelp('new')}\n`);
    return;
  }

  const values = parseOptions(args, {
    ...commonOptions(),
    slug: { type: 'string' },
    title: { type: 'string' },
    description: { type: 'string' },
    date: { type: 'string' },
    tags: { type: 'string' },
    cover: { type: 'string' },
    'start-year': { type: 'string' },
    'end-year': { type: 'string' },
    status: { type: 'string' },
    locations: { type: 'string' },
    roles: { type: 'string' },
    media: { type: 'string' },
    category: { type: 'string' },
    order: { type: 'string' },
    'no-input': { type: 'boolean' },
    'dry-run': { type: 'boolean' }
  });
  await promptForMissing(type, values, context);
  const draft =
    type === 'post' ? buildPostDraft(context.root, values) : buildProjectDraft(context.root, values);
  const relativeFile = path.relative(context.root, draft.file).replaceAll('\\', '/');

  if (values['dry-run']) {
    writeResult(
      context.io,
      {
        ok: true,
        action: 'create',
        dryRun: true,
        target: `${draft.type}/${draft.slug}`,
        file: relativeFile,
        route: draft.route,
        frontmatter: draft.frontmatter,
        message: `Would create draft ${relativeFile}.`
      },
      values
    );
    return;
  }

  await atomicWrite(draft.file, draft.content);
  try {
    await validateRepository(context.root, context, { quiet: values.json });
  } catch (error) {
    await unlink(draft.file).catch(() => {});
    throw new CliError(
      `Draft validation failed; removed ${relativeFile}.\n${error instanceof Error ? error.message : error}`,
      error instanceof CliError ? error.exitCode : EXIT.validation
    );
  }
  writeResult(
    context.io,
    {
      ok: true,
      action: 'create',
      draft: true,
      target: `${draft.type}/${draft.slug}`,
      file: relativeFile,
      route: draft.route,
      next: `npm run content -- preview ${draft.type}/${draft.slug}`,
      message: `Created draft ${relativeFile}.\nNext: npm run content -- preview ${draft.type}/${draft.slug}`
    },
    values
  );
}

async function checkCommand(args, context) {
  if (args.includes('-h') || args.includes('--help')) {
    context.io.stdout.write(`${commandHelp('check')}\n`);
    return;
  }
  const targetValue = args[0]?.startsWith('-') ? undefined : args.shift();
  const values = parseOptions(args, commonOptions());
  if (targetValue) {
    const target = targetDetails(context.root, targetValue);
    if (!existsSync(target.file)) {
      throw new CliError(`${path.relative(context.root, target.file)} does not exist.`, EXIT.validation);
    }
  }

  await validateRepository(context.root, context, { quiet: values.json });
  writeResult(
    context.io,
    {
      ok: true,
      action: 'check',
      target: targetValue ?? 'all',
      message: `Content check passed${targetValue ? ` for ${targetValue}` : ''}.`
    },
    values
  );
}

async function previewCommand(args, context) {
  if (args.includes('-h') || args.includes('--help')) {
    context.io.stdout.write(`${commandHelp('preview')}\n`);
    return;
  }
  const targetValue = args.shift();
  if (!targetValue) throw new CliError('preview requires a target.', EXIT.usage);
  const target = targetDetails(context.root, targetValue);
  if (!existsSync(target.file)) {
    throw new CliError(`${path.relative(context.root, target.file)} does not exist.`, EXIT.validation);
  }
  const values = parseOptions(args, {
    ...commonOptions(),
    open: { type: 'boolean' },
    host: { type: 'boolean' },
    port: { type: 'string' }
  });
  const port = values.port ?? '5173';
  if (!/^\d+$/.test(port) || Number(port) < 1 || Number(port) > 65535) {
    throw new CliError('--port must be an integer from 1 to 65535.', EXIT.usage);
  }

  await validateRepository(context.root, context, { quiet: values.json });
  const host = values.host ? '0.0.0.0' : '127.0.0.1';
  const urlHost = values.host ? 'localhost' : host;
  const url = `http://${urlHost}:${port}${target.route}`;
  writeResult(
    context.io,
    {
      ok: true,
      action: 'preview',
      target: targetValue,
      url,
      exposed: Boolean(values.host),
      message: `Draft preview: ${url}\nPress Ctrl-C to stop.`
    },
    values
  );

  const viteArgs = ['run', 'dev', '--', '--host', host, '--port', port];
  if (values.open) viteArgs.push('--open', target.route);
  await runProcess('npm', viteArgs, {
    cwd: context.root,
    io: context.io,
    signal: context.signal,
    label: 'Starting the draft-inclusive development server…'
  });
}

async function confirmPublication(targetValue, values, context) {
  if (values.yes) return;
  if (values['no-input'] || !context.io.stdin.isTTY) {
    throw new CliError(
      'Publication requires confirmation. Pass --yes with --no-input after reviewing --dry-run.',
      EXIT.usage
    );
  }

  const terminal = createInterface({
    input: context.io.stdin,
    output: context.io.stderr,
    terminal: true
  });
  try {
    const answer = (
      await terminal.question(`Set ${targetValue} to draft: false and run npm run verify? [y/N]: `)
    )
      .trim()
      .toLowerCase();
    if (!['y', 'yes'].includes(answer)) {
      throw new CliError('Publication cancelled.', EXIT.runtime);
    }
  } finally {
    terminal.close();
  }
}

async function publishCommand(args, context) {
  if (args.includes('-h') || args.includes('--help')) {
    context.io.stdout.write(`${commandHelp('publish')}\n`);
    return;
  }
  const targetValue = args.shift();
  if (!targetValue) throw new CliError('publish requires a target.', EXIT.usage);
  const target = targetDetails(context.root, targetValue);
  if (!existsSync(target.file)) {
    throw new CliError(`${path.relative(context.root, target.file)} does not exist.`, EXIT.validation);
  }
  const values = parseOptions(args, {
    ...commonOptions(),
    'dry-run': { type: 'boolean' },
    yes: { type: 'boolean', short: 'y' },
    'no-input': { type: 'boolean' }
  });
  const original = readFileSync(target.file, 'utf8');
  const frontmatter = readFrontmatter(original, path.relative(context.root, target.file));
  if (frontmatter.draft !== true) {
    throw new CliError(`${targetValue} is already published (draft: false).`, EXIT.validation);
  }
  if (target.type === 'post') {
    const today = calendarDateInTimeZone(readSite(context.root).timezone);
    validateDate(frontmatter.date, 'date');
    if (frontmatter.date > today) {
      throw new CliError(
        `${targetValue} uses future date ${frontmatter.date}; keep it as a draft until ${frontmatter.date}.`,
        EXIT.validation
      );
    }
  }

  if (!values['dry-run']) await confirmPublication(targetValue, values, context);
  const published = replaceDraftState(original, false);
  let restored = false;
  const restore = async () => {
    if (restored) return;
    restored = true;
    await atomicWrite(target.file, original, { replace: true });
  };

  await atomicWrite(target.file, published, { replace: true });
  try {
    await validateRepository(context.root, context, { full: true, quiet: values.json });
    if (values['dry-run']) await restore();
  } catch (error) {
    await restore();
    throw new CliError(
      `Publication checks failed; restored ${path.relative(context.root, target.file)} to draft: true.\n${error instanceof Error ? error.message : error}`,
      error instanceof CliError ? error.exitCode : EXIT.validation
    );
  }

  writeResult(
    context.io,
    {
      ok: true,
      action: 'publish',
      dryRun: Boolean(values['dry-run']),
      target: targetValue,
      file: path.relative(context.root, target.file).replaceAll('\\', '/'),
      draft: values['dry-run'] ? true : false,
      next: values['dry-run']
        ? `npm run content -- publish ${targetValue}`
        : 'Open a pull request and review its Cloudflare preview before merging.',
      message: values['dry-run']
        ? `Publication dry-run passed for ${targetValue}; the file remains draft: true.`
        : `Prepared ${targetValue} for publication and passed npm run verify.\nNext: open a pull request and review its preview.`
    },
    values
  );
}

export async function runCli(argv, context) {
  const args = [...argv];
  const command = args.shift();
  if (!command) {
    context.io.stdout.write(`${conciseHelp()}\n`);
    return;
  }
  if (command === '-h' || command === '--help') {
    context.io.stdout.write(`${fullHelp()}\n`);
    return;
  }
  if (command === '--version') {
    const packageJson = JSON.parse(readFileSync(path.join(context.root, 'package.json'), 'utf8'));
    context.io.stdout.write(`${packageJson.version}\n`);
    return;
  }
  if (command === 'help') {
    context.io.stdout.write(`${commandHelp(args[0])}\n`);
    return;
  }
  if (command === 'new') return newCommand(args, context);
  if (command === 'check') return checkCommand(args, context);
  if (command === 'preview') return previewCommand(args, context);
  if (command === 'publish') return publishCommand(args, context);

  throw new CliError(
    `Unknown command ${JSON.stringify(command)}.\n\n${conciseHelp()}`,
    EXIT.usage
  );
}
