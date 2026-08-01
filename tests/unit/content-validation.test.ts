import { describe, expect, it } from 'vitest';
import {
  altTextProblem,
  inspectMarkdownImages
} from '../../scripts/content-validation.mjs';

describe('content image validation', () => {
  it('finds inline and reference images without treating fenced examples as content', () => {
    const source = [
      '![A cyclist passing a market stall](/images/cyclist.jpg)',
      '',
      '![Night street][night]',
      '',
      '[night]: https://example.com/night.jpg',
      '',
      '```md',
      '![TODO](/images/example.jpg)',
      '```'
    ].join('\n');

    expect(inspectMarkdownImages(source, 'post.md')).toEqual([
      expect.objectContaining({
        line: 1,
        url: '/images/cyclist.jpg',
        alt: 'A cyclist passing a market stall',
        problem: undefined
      }),
      expect.objectContaining({
        line: 3,
        url: 'https://example.com/night.jpg',
        alt: 'Night street',
        problem: undefined
      })
    ]);
  });

  it('rejects missing, placeholder, numbered, and filename-only alt text', () => {
    expect(altTextProblem('', '/images/street.jpg')).toMatch(/missing or blank/);
    expect(altTextProblem('TODO', '/images/street.jpg')).toMatch(/placeholder/);
    expect(altTextProblem('Artwork seven', '/images/art-07.jpg')).toMatch(/placeholder/);
    expect(altTextProblem('Rainy Reflections', '/images/rainy-reflections.jpg')).toMatch(
      /repeats the file name/
    );
    expect(
      altTextProblem('A scooter rider crossing a rain-soaked street', '/images/rainy-reflections.jpg')
    ).toBeUndefined();
  });
});
