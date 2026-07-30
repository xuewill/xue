import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { parse } from 'yaml';
import { postFrontmatterSchema, tagConfigSchema } from '../../velite.config';

const fixtureRoot = fileURLToPath(new URL('../fixtures/content/', import.meta.url));

function readYamlFixture(name: string): unknown {
  return parse(readFileSync(`${fixtureRoot}${name}`, 'utf8'));
}

function readMarkdownFrontmatter(name: string): unknown {
  const source = readFileSync(`${fixtureRoot}${name}`, 'utf8');
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  if (!match) throw new Error(`${name}: missing YAML frontmatter`);
  return parse(match[1]);
}

describe('content schema fixtures', () => {
  it('accepts valid Markdown frontmatter independently of the real content collection', async () => {
    const result = await postFrontmatterSchema.safeParseAsync(
      readMarkdownFrontmatter('valid-post.md')
    );

    expect(result.success).toBe(true);
  });

  it('rejects invalid Markdown dates, tags, and unknown fields', async () => {
    const result = await postFrontmatterSchema.safeParseAsync(
      readMarkdownFrontmatter('invalid-post.md')
    );

    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.error.issues.map(({ path, message }) => `${path.join('.')}: ${message}`)).toEqual(
      expect.arrayContaining([
        expect.stringMatching(/^date: Expected a real YYYY-MM-DD calendar date/),
        expect.stringMatching(/^tags\.0: Expected a lowercase kebab-case slug/),
        expect.stringMatching(/unexpected/)
      ])
    );
  });

  it('accepts valid YAML and rejects invalid stable tag fixtures', async () => {
    const [valid, invalid] = await Promise.all([
      tagConfigSchema.safeParseAsync(readYamlFixture('valid-tags.yaml')),
      tagConfigSchema.safeParseAsync(readYamlFixture('invalid-tags.yaml'))
    ]);

    expect(valid.success).toBe(true);
    expect(invalid.success).toBe(false);
  });
});
