---
title: Building this site with SvelteKit
description: A small, static publishing setup built around Markdown and Cloudflare Pages.
date: '2026-07-17'
updated: '2026-07-29'
draft: false
tags:
  - engineering
  - publishing
cover: /home/sketchbook/stanford.png
series:
  slug: site-notes
  title: Site Notes
  order: 1
related:
  - writing-in-markdown
  - typed-content-media-pipeline
---

This site is built as a static SvelteKit application. Pages are generated at build time, then served from Cloudflare's edge network without a database or a long-running application server.

The homepage remains image-led, while writing lives in plain Markdown files. Site metadata, navigation, social links, projects, and the sketchbook sequence are kept separate from the components that render them.

## Publishing flow

Every push to the main branch runs the same sequence:

1. Check the Svelte and TypeScript source.
2. Compile Markdown and prerender every route.
3. Upload the static build to Cloudflare Pages.

That keeps the editing workflow close to the content: add a Markdown file, commit it, and let the build produce the page.
