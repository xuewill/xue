---
title: Writing in Markdown
description: The fields and file structure used to publish an article on this site.
date: '2026-07-16'
updated: '2026-07-29'
draft: false
tags:
  - publishing
cover: /home/sketchbook/tokyo-tower.png
series:
  slug: site-notes
  title: Site Notes
  order: 2
related:
  - building-this-site
  - typed-content-media-pipeline
---

Posts live in `src/content/posts`. The filename becomes the URL, and the frontmatter at the top of the file supplies the title, date, description, tags, cover image, and draft state.

```md
---
title: Article title
description: A short summary
date: '2026-07-17'
draft: false
tags:
  - publishing
---
```

Setting `draft` to `true` keeps an article out of production builds. Published posts are sorted by date and appear automatically in the Blog list, RSS feed, and sitemap.
