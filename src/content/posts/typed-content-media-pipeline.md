---
title: A typed content and media pipeline
description: How this site turns trusted Markdown, YAML, and source images into static pages and responsive assets.
date: '2026-07-29'
draft: false
tags:
  - engineering
  - publishing
cover: /home/sketchbook/stanford.png
series:
  slug: site-notes
  title: Site Notes
  order: 3
related:
  - building-this-site
  - writing-in-markdown
---

The content layer for this site has two jobs: make publishing simple for an author and make invalid content difficult to ship. Markdown remains the source for writing, YAML holds shared configuration, and Velite turns both into typed data before SvelteKit prerenders the pages.

## One build boundary

Dates, slugs, tags, image paths, and cross-content references are checked while the site builds. A missing image or a link to an unknown article stops the build with a useful error instead of becoming a broken production page.

The generated collections are read only by server route modules. List pages receive compact summaries, while full HTML is loaded only for the article or project being rendered. This keeps the browser bundle from growing with the complete archive.

## Images as content data

Source images stay in the repository, but pages use generated WebP variants with stable dimensions and content-hashed filenames. The same pipeline creates separate thumbnail and lightbox assets for the Album and responsive sources for covers, the portrait, and the homepage sketchbook.

Keeping those decisions beside the content schema means authors do not need to export several manual sizes for every image. A single source file produces predictable browser-ready data, while the original remains available as the durable archive.

## Static by design

None of this requires a production database or a long-running application process. Validation, Markdown compilation, syntax highlighting, image metadata extraction, and social preview generation all happen before deployment. The published result is still a set of static files that can be cached close to the reader.
