import GithubSlugger from 'github-slugger';
import { fromMarkdown } from 'mdast-util-from-markdown';
import { toString } from 'mdast-util-to-string';
import type { ContentHeading } from '$lib/types/content';

export function extractContentHeadings(source: string): ContentHeading[] {
  const markdown = source.replace(/^\uFEFF?---[ \t]*\r?\n[\s\S]*?\r?\n---[ \t]*(?:\r?\n|$)/, '');
  const tree = fromMarkdown(markdown);
  const slugger = new GithubSlugger();
  const headings: ContentHeading[] = [];

  for (const node of tree.children) {
    if (node.type !== 'heading') continue;

    const label = toString(node).trim() || 'Section';
    const id = slugger.slug(label);
    if (node.depth >= 2) headings.push({ id, label, level: node.depth });
  }

  return headings;
}
