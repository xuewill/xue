import type { PostMetadata, ProjectMetadata } from '$lib/types/content';

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function requireNonEmptyString(
  metadata: Record<string, unknown>,
  key: string,
  label: string
): void {
  const value = metadata[key];
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`${label} is missing ${key}`);
  }
}

export function isValidCalendarDate(value: unknown): value is string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;

  const parsed = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

export function validateContentSlug(kind: 'Post' | 'Project', slug: string): void {
  if (!SLUG_PATTERN.test(slug)) {
    throw new Error(`${kind} ${slug || '(empty)'} has an invalid slug`);
  }
}

export function validatePostMetadata(
  slug: string,
  value: unknown
): asserts value is PostMetadata {
  const label = `Post ${slug}`;
  if (!isRecord(value)) throw new Error(`${label} has no metadata`);

  requireNonEmptyString(value, 'title', label);
  requireNonEmptyString(value, 'description', label);
  if (!isValidCalendarDate(value.date)) {
    throw new Error(`${label} has an invalid date; expected a real YYYY-MM-DD calendar date`);
  }
  if (typeof value.draft !== 'boolean') throw new Error(`${label} is missing draft`);
  if (
    !Array.isArray(value.tags) ||
    value.tags.length === 0 ||
    value.tags.some((tag) => typeof tag !== 'string' || tag.trim().length === 0)
  ) {
    throw new Error(`${label} must define at least one non-empty string tag`);
  }
  if (value.cover !== undefined) requireNonEmptyString(value, 'cover', label);
}

export function validateProjectMetadata(
  slug: string,
  value: unknown
): asserts value is ProjectMetadata {
  const label = `Project ${slug}`;
  if (!isRecord(value)) throw new Error(`${label} has no metadata`);

  requireNonEmptyString(value, 'title', label);
  requireNonEmptyString(value, 'description', label);
  requireNonEmptyString(value, 'category', label);
  requireNonEmptyString(value, 'cover', label);
  requireNonEmptyString(value, 'year', label);
  if (!Number.isInteger(value.order)) throw new Error(`${label} is missing a valid integer order`);
  if (typeof value.draft !== 'boolean') throw new Error(`${label} is missing draft`);
}
