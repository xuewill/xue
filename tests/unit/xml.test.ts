import { describe, expect, it } from 'vitest';
import { absoluteUrl, escapeXml } from '../../src/lib/server/xml';

describe('XML helpers', () => {
  it('escapes all XML special characters', () => {
    expect(escapeXml(`A&B <tag> "quoted" 'single'`)).toBe(
      'A&amp;B &lt;tag&gt; &quot;quoted&quot; &apos;single&apos;'
    );
  });

  it('builds absolute URLs from root-relative paths', () => {
    expect(absoluteUrl('https://example.com/base', '/blog/post')).toBe(
      'https://example.com/blog/post'
    );
  });
});
