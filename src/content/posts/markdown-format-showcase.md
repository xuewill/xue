---
title: Markdown Format Showcase
description: A visual reference for the headings, text styles, lists, media, code, and other Markdown elements supported by this site.
date: '2026-07-22'
draft: false
tags:
  - Markdown
  - Reference
cover: /home/sketchbook/tokyo-tower.png
---

This article is a visual test page for the Markdown styles used across the site. It combines common elements in one place so typography, spacing, color, and responsive behavior can be checked together.

## Text styles

A paragraph can contain **bold text**, *italic text*, ***bold italic text***, ~~strikethrough text~~, and `inline code`. Escaping keeps symbols literal: \*this is not italic\*. You can also use an em dash — or an emoji ✦ when the writing calls for one.

### Links and line breaks

This is an [inline link](https://developer.mozilla.org/en-US/docs/Web/Markdown), this is a [reference-style link][markdown-guide], and this URL is automatically linked: <https://svelte.dev/>.

An inline HTML break adds a hard line ending.<br />
This sentence starts on the next line without becoming a new paragraph.

#### A fourth-level heading

Level four headings are useful inside a longer section without overpowering the page.

##### A fifth-level heading

Smaller headings keep detailed notes easy to scan.

###### A sixth-level heading

This is the deepest heading level supported by Markdown and by the table of contents.

## Lists

### Unordered and nested lists

- A first-level item
- Another first-level item
  - A nested item
  - A second nested item
    - A third level for detailed notes
- A final first-level item

### Ordered list

1. Write the article in Markdown.
2. Add frontmatter with the publishing metadata.
3. Preview the page.
   1. Check the table of contents.
   2. Check small-screen wrapping.
4. Publish the static build.

### Task list

- [x] Headings and text styles
- [x] Lists, quotes, code, and tables
- [ ] Replace this sample with project-specific content when needed

## Quotes

> Good design is as little design as possible.
>
> — Dieter Rams

Nested quotations are supported too:

> The first level gives the main context.
>
> > The second level adds a response or a related source.

## Code

Inline snippets such as `npm run check` stay within the reading flow. Longer examples use fenced code blocks.

### JavaScript

```js
const sections = document.querySelectorAll('article h2, article h3');

for (const section of sections) {
  console.log(section.textContent);
}
```

### CSS

```css
.article {
  max-width: 760px;
  margin-inline: auto;
  color: var(--ink);
}
```

### Markdown shown as code

````md
## Section title

> A quoted paragraph with **strong emphasis**.

```js
console.log('Nested fences are preserved');
```
````

## Table

| Element | Syntax | Typical use |
| :--- | :---: | ---: |
| Heading | `## Title` | Page structure |
| Link | `[label](url)` | References |
| Image | `![alt](path)` | Visual context |
| Code | `` `value` `` | Technical terms |

## Image

Images use standard Markdown syntax, including descriptive alternative text and an optional title.

![A line drawing of Tokyo Tower in a travel sketchbook](/home/sketchbook/tokyo-tower.png "Tokyo Tower sketch")

## Divider and HTML

The horizontal rule below separates ideas without starting a new page.

---

Markdown can also contain small pieces of semantic HTML when a native element communicates the interaction better.

<details>
  <summary>Open an HTML details element</summary>

  This content stays hidden until the summary is selected. Keyboard hints can use <kbd>Enter</kbd> or <kbd>Space</kbd>.
</details>

[markdown-guide]: https://www.markdownguide.org/basic-syntax/ "Markdown Guide"
