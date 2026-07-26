import { describe, expect, it } from 'vitest';
import { extractContentHeadings } from '../../src/lib/content/headings';

describe('extractContentHeadings', () => {
  it('ignores frontmatter and mirrors GitHub-style duplicate heading IDs', () => {
    const source = `---
title: Frontmatter is not a heading
---

# Page title

## Section

### Section
`;

    expect(extractContentHeadings(source)).toEqual([
      { id: 'section', label: 'Section', level: 2 },
      { id: 'section-1', label: 'Section', level: 3 }
    ]);
  });
});
