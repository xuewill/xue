import { describe, expect, it } from 'vitest';
import {
  isValidCalendarDate,
  validateContentSlug,
  validatePostMetadata
} from '../../src/lib/content/validation';

describe('content validation', () => {
  it.each(['2026-07-23', '2000-02-29'])('accepts the calendar date %s', (date) => {
    expect(isValidCalendarDate(date)).toBe(true);
  });

  it.each(['2026-99-99', '2026-02-30', '2025-02-29', '23-07-2026']) (
    'rejects the invalid date %s',
    (date) => {
      expect(isValidCalendarDate(date)).toBe(false);
    }
  );

  it.each(['article-title', 'post2', '2026-release'])('accepts the slug %s', (slug) => {
    expect(() => validateContentSlug('Post', slug)).not.toThrow();
  });

  it.each(['Article-Title', 'article_title', '../article', '-article', 'article--title']) (
    'rejects the unsafe slug %s',
    (slug) => {
      expect(() => validateContentSlug('Post', slug)).toThrow(/invalid slug/);
    }
  );

  it('requires every post tag to be a non-empty string', () => {
    const base = {
      title: 'Title',
      description: 'Description',
      date: '2026-07-23',
      draft: false
    };

    expect(() => validatePostMetadata('post', { ...base, tags: ['Notes'] })).not.toThrow();
    expect(() => validatePostMetadata('post', { ...base, tags: [''] })).toThrow(/tag/);
    expect(() => validatePostMetadata('post', { ...base, tags: [42] })).toThrow(/tag/);
  });
});
