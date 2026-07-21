# SvelteKit Markdown Blog

轻量静态博客。首页延续原站布局，Projects 使用图片卡片网格，Blog 使用年份、标题和分类组成的横向列表。

## 技术栈

- SvelteKit 2 / Svelte 5 / TypeScript
- mdsvex Markdown 内容
- `@sveltejs/adapter-static` 全站预渲染
- GitHub Actions + Cloudflare Pages

线上不需要 Node 服务、数据库或 Worker SSR。

## 本地开发

需要 Node.js 22 或更高版本。

```powershell
npm ci
npm run dev
```

默认开发地址由 Vite 输出。生产构建：

```powershell
npm run check
npm run build
npm run preview
```

静态产物生成在 `build/`。

## 站点配置

- `src/lib/config/site.ts`：站点标题、域名、作者、导航和社交链接。
- `src/lib/config/home.ts`：首页 Hero、About 和 Projects 标题。
- `src/app.css`：颜色、字体、尺寸和响应式样式。

Hero 图片位于 `static/work/sketchbook/`。在 `homeConfig.hero.images` 中增删对象或调整数组顺序即可控制前台内容：

```ts
{
  id: 'image-id',
  src: '/work/sketchbook/image.png',
  alt: 'Accessible description',
  caption: 'Image caption',
  width: 1280,
  height: 720,
  enabled: true
}
```

构建前会检查 Hero、文章封面和 Markdown 正文图片是否真实存在。

## 发布 Blog

在 `src/content/posts/` 新建 Markdown 文件，文件名就是 URL slug：

```md
---
title: Article title
description: Article summary
date: '2026-07-17'
draft: false
tags:
  - Notes
cover: /images/blog/cover.webp
---

Article body.
```

例如 `article-title.md` 对应 `/blog/article-title`。生产构建会过滤 `draft: true`，其余文章自动进入 Blog 列表、RSS 和 Sitemap。

## 发布 Project

Project 内容位于 `src/content/projects/`：

```md
---
title: Project title
description: Project summary
year: '2026'
category: design
cover: /images/projects/cover.webp
order: 10
draft: false
---

Project body.
```

首页按照 `order` 升序生成卡片，详情地址为 `/work/[slug]`。

## Cloudflare Pages

GitHub 仓库需要配置：

- Secret：`CLOUDFLARE_API_TOKEN`
- Secret：`CLOUDFLARE_ACCOUNT_ID`
- Variable：`CLOUDFLARE_PROJECT_NAME`

Pull Request 运行 `.github/workflows/check.yml`。main 分支推送通过检查后，`.github/workflows/deploy.yml` 使用 Wrangler 将 `build/` 部署到 Cloudflare Pages。

详细实施记录见 [SVELTEKIT_BLOG_PLAN.md](./docs/SVELTEKIT_BLOG_PLAN.md)。
