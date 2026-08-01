import { mkdtempSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { stringify } from 'yaml';
import {
  CliError,
  EXIT,
  buildPostDraft,
  buildProjectDraft,
  parseTarget,
  readFrontmatter,
  replaceDraftState,
  runCli
} from '../../scripts/content-cli-lib.mjs';

function repositoryFixture() {
  const root = mkdtempSync(path.join(tmpdir(), 'xue-content-cli-'));
  mkdirSync(path.join(root, 'src/content/config'), { recursive: true });
  mkdirSync(path.join(root, 'src/content/posts'), { recursive: true });
  mkdirSync(path.join(root, 'src/content/projects'), { recursive: true });
  mkdirSync(path.join(root, 'static/images'), { recursive: true });
  writeFileSync(
    path.join(root, 'src/content/config/site.yaml'),
    stringify({ timezone: 'Asia/Shanghai' })
  );
  writeFileSync(
    path.join(root, 'src/content/config/tags.yaml'),
    stringify({ tags: [{ slug: 'publishing' }, { slug: 'design' }] })
  );
  writeFileSync(
    path.join(root, 'src/content/config/metadata.yaml'),
    stringify({
      locations: [{ slug: 'stanford' }],
      roles: [{ slug: 'designer' }],
      media: [{ slug: 'fashion-design' }]
    })
  );
  writeFileSync(path.join(root, 'static/images/cover.jpg'), 'fixture');
  writeFileSync(
    path.join(root, 'src/content/projects/existing.md'),
    ['---', 'title: Existing', 'order: 2', 'draft: true', '---', ''].join('\n')
  );
  return root;
}

describe('content CLI core', () => {
  it('parses explicit content targets and rejects ambiguous values', () => {
    expect(parseTarget('post/article-slug')).toEqual({ type: 'post', slug: 'article-slug' });
    expect(() => parseTarget('article-slug')).toThrow(CliError);
    expect(() => parseTarget('post/Article')).toThrow(/post\/<slug>/);
  });

  it('creates minimal post frontmatter with draft enabled', () => {
    const root = repositoryFixture();
    const draft = buildPostDraft(root, {
      slug: 'first-note',
      title: 'First Note',
      description: 'A publishing note.',
      date: '2026-07-31',
      tags: 'publishing',
      locations: 'stanford'
    });

    expect(draft.route).toBe('/blog/first-note');
    expect(readFrontmatter(draft.content)).toEqual({
      title: 'First Note',
      description: 'A publishing note.',
      date: '2026-07-31',
      draft: true,
      tags: ['publishing'],
      locations: ['stanford']
    });
    expect(draft.content).not.toContain('related:');
  });

  it('creates minimal project frontmatter with a unique order and existing cover', () => {
    const root = repositoryFixture();
    const draft = buildProjectDraft(root, {
      slug: 'new-project',
      title: 'New Project',
      description: 'A design project.',
      'start-year': '2026',
      'end-year': '2026',
      status: 'completed',
      category: 'design',
      locations: 'stanford',
      roles: 'designer',
      media: 'fashion-design',
      cover: '/images/cover.jpg',
      order: '3'
    });

    expect(draft.route).toBe('/home/new-project');
    expect(readFrontmatter(draft.content)).toMatchObject({
      title: 'New Project',
      startYear: 2026,
      endYear: 2026,
      status: 'completed',
      locations: ['stanford'],
      roles: ['designer'],
      media: ['fashion-design'],
      cover: '/images/cover.jpg',
      order: 3,
      draft: true
    });
  });

  it('rejects unknown tags, missing covers, duplicate slugs, and duplicate project order', () => {
    const root = repositoryFixture();
    writeFileSync(
      path.join(root, 'src/content/posts/first-note.md'),
      ['---', 'title: Existing', 'draft: true', '---', ''].join('\n')
    );

    expect(() =>
      buildPostDraft(root, {
        slug: 'first-note',
        title: 'First Note',
        description: 'A publishing note.',
        tags: 'publishing'
      })
    ).toThrow(/already uses slug/);
    expect(() =>
      buildPostDraft(root, {
        slug: 'unknown-tag',
        title: 'First Note',
        description: 'A publishing note.',
        tags: 'unknown'
      })
    ).toThrow(/Unknown tag/);
    expect(() =>
      buildProjectDraft(root, {
        slug: 'new-project',
        title: 'New Project',
        description: 'A design project.',
        'start-year': '2026',
        'end-year': '2026',
        status: 'completed',
        category: 'design',
        roles: 'designer',
        media: 'fashion-design',
        cover: '/images/missing.jpg',
        order: '3'
      })
    ).toThrow(/missing static asset/);
    expect(() =>
      buildProjectDraft(root, {
        slug: 'new-project',
        title: 'New Project',
        description: 'A design project.',
        'start-year': '2026',
        'end-year': '2026',
        status: 'completed',
        category: 'design',
        roles: 'designer',
        media: 'fashion-design',
        cover: '/images/cover.jpg',
        order: '2'
      })
    ).toThrow(/already used by existing/);
    expect(() =>
      buildProjectDraft(root, {
        slug: 'unknown-role',
        title: 'New Project',
        description: 'A design project.',
        'start-year': '2026',
        'end-year': '2026',
        status: 'completed',
        category: 'design',
        roles: 'unknown',
        media: 'fashion-design',
        cover: '/images/cover.jpg',
        order: '3'
      })
    ).toThrow(/Unknown --roles/);
  });

  it('changes only the draft field and supports restoration', () => {
    const source = ['---', 'title: Draft', 'draft: true', 'tags:', '  - publishing', '---', '', 'Body.'].join(
      '\n'
    );
    const published = replaceDraftState(source, false);
    const restored = replaceDraftState(published, true);

    expect(readFrontmatter(published).draft).toBe(false);
    expect(restored).toBe(source);
  });

  it('keeps the fixture helper honest', () => {
    const root = repositoryFixture();
    expect(readFileSync(path.join(root, 'static/images/cover.jpg'), 'utf8')).toBe('fixture');
  });

  it('restores the draft when the complete publication check fails', async () => {
    const root = repositoryFixture();
    const file = path.join(root, 'src/content/posts/rollback-note.md');
    const original = [
      '---',
      'title: Rollback Note',
      'description: A publication rollback fixture.',
      "date: '2026-07-30'",
      'draft: true',
      'tags:',
      '  - publishing',
      '---',
      '',
      'Body.'
    ].join('\n');
    writeFileSync(file, original);
    writeFileSync(
      path.join(root, 'package.json'),
      JSON.stringify({ scripts: { verify: `${process.execPath} -e "process.exit(7)"` } })
    );
    const output = { write: () => true };

    await expect(
      runCli(['publish', 'post/rollback-note', '--yes'], {
        root,
        signal: new AbortController().signal,
        io: { stdin: process.stdin, stdout: output, stderr: output }
      })
    ).rejects.toMatchObject({ exitCode: EXIT.validation });
    expect(readFileSync(file, 'utf8')).toBe(original);
  });

  it('refuses to publish a future-dated post before changing the file', async () => {
    const root = repositoryFixture();
    const file = path.join(root, 'src/content/posts/future-note.md');
    const original = [
      '---',
      'title: Future Note',
      'description: A future publication fixture.',
      "date: '2999-01-01'",
      'draft: true',
      'tags:',
      '  - publishing',
      '---',
      '',
      'Body.'
    ].join('\n');
    writeFileSync(file, original);
    const output = { write: () => true };

    await expect(
      runCli(['publish', 'post/future-note', '--dry-run'], {
        root,
        signal: new AbortController().signal,
        io: { stdin: process.stdin, stdout: output, stderr: output }
      })
    ).rejects.toMatchObject({ exitCode: EXIT.validation });
    expect(readFileSync(file, 'utf8')).toBe(original);
  });
});
