---
title: Writing in Markdown
description: The fields and file structure used to publish an article on this site.
date: '2026-07-16'
draft: false
tags:
  - Process
cover: /work/sketchbook/tokyo-tower.png
---

Posts live in `src/content/posts`. The filename becomes the URL, and the frontmatter at the top of the file supplies the title, date, description, tags, cover image, and draft state.

```md
---
title: Article title
description: A short summary
date: '2026-07-17'
draft: false
tags:
  - Notes
---
```

Setting `draft` to `true` keeps an article out of production builds. Published posts are sorted by date and appear automatically in the Blog list, RSS feed, and sitemap.
