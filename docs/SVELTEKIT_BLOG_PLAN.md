# SvelteKit 轻量博客改造计划

> 状态：已实施  
> 制定日期：2026-07-17  
> 本文只定义改造范围、目标结构、实施顺序和验收标准，不包含本轮代码修改。

## 1. 改造目标

将当前静态镜像重建为可维护的 SvelteKit 轻量博客，并满足以下已经确认的产品要求：

1. 首页整体布局顺序保持不变：Header → Hero → About → Projects → Footer。
2. 首页 Hero 的位置、视觉层级和翻页交互保持现状，图片、替代文本和说明文字改为配置驱动。
3. 首页底部 Projects 保留项目内容，但展示形式改为当前 `/play` 页的图片卡片网格。
4. 导航中的 `play` 改为 `blog`，主列表路由由 `/play` 改为 `/blog`。
5. Blog 列表使用当前首页 Projects 的横向列表样式。
6. Blog 文章由 Markdown 文件生成，构建时预渲染为静态 HTML。
7. 站点品牌、导航、社交链接、Hero、Projects 和 SEO 信息均从配置或内容文件读取。
8. 使用 GitHub Actions 构建，通过 Wrangler 自动部署到 Cloudflare Pages。

本次改造不是在现有 Next.js 项目上重构。仓库中只有 Next.js 编译产物，没有原始组件源码，因此实施时需要建立新的 SvelteKit 源码工程，再迁移视觉和内容。

## 2. 现有布局依据

规划基于当前镜像中的实际结构和样式，不重新定义一套视觉语言。

以下 `site/` 路径是迁移实施时使用的历史依据；新站验收完成后，旧 Next.js 镜像已按阶段 6 清理，视觉基准截图保留在 `RECON/`。

### 2.1 首页 Projects 列表

现有结构位于 `site/index.html`，核心样式位于 `site/_next/static/css/5d49675d53f07628.css`：

- 列表顶部和每一行底部使用细分隔线。
- 桌面端一行包含 `year / title / blurb` 三列。
- 行内间距为 `17px 2px`，列间距为 `16px`。
- 标题使用约 `17px～21px` 的响应式字号。
- 鼠标悬停某一行时显示缩略图，其他行降低透明度。
- 移动端改为 `year / title` 两列，隐藏 blurb 和悬停缩略图。

该样式迁移后用于 `/blog` 的文章列表。

### 2.2 Play 卡片网格

现有结构位于 `site/play/index.html`：

- 容器使用 `repeat(auto-fill, minmax(240px, 1fr))` 自适应网格。
- 卡片间距为 `clamp(14px, 2vw, 26px)`。
- 封面比例固定为 `16:10`，带细边框和小圆角。
- 卡片标题位于图片下方左侧，说明文字位于右侧。
- 鼠标悬停时图片在 `0.5s` 内放大到 `1.04`。
- 当前 1440px 视口显示为三列，窄屏自然收缩为两列或单列。

该样式迁移后用于首页底部 Projects。

### 2.3 首页 Hero

现有 Hero 保持以下结构：

- 顶部小字定位语。
- 居中的大号模糊姓名文字。
- 前景手绘图册图片。
- 左右翻页按钮与图片点击区域。
- 当前图片说明文字。
- 底部向下引导按钮。

Hero 只做数据来源改造，不改变区块高度、元素层级、主要尺寸、颜色、模糊效果和内容进入顺序。

## 3. 目标信息架构

| 路由 | 用途 | 处理方式 |
| --- | --- | --- |
| `/` | 首页 | 保持现有总体布局，Projects 改为卡片网格 |
| `/#about` | 首页 About 锚点 | 保留 |
| `/#projects` | 首页 Projects 锚点 | 保留 |
| `/blog` | Blog 文章列表 | 使用原首页 Projects 横向列表样式 |
| `/blog/[slug]` | Blog 文章正文 | 由 `src/content/posts/*.md` 生成 |
| `/home/[slug]` | 项目详情 | 迁移需要保留的现有项目内容 |
| `/rss.xml` | RSS | 构建时生成 |
| `/sitemap.xml` | Sitemap | 构建时生成 |
| `/play` | 旧入口 | 301 重定向到 `/blog` |

`/play/oscillon`、`/play/hypercycles`、`/play/cultcube` 已确认下线，不迁移页面和运行资源，也不设置到其他内容的错误重定向。

## 4. 技术方案

### 4.1 核心技术

| 层级 | 选择 | 说明 |
| --- | --- | --- |
| 前端框架 | SvelteKit + Svelte + TypeScript | 重建可维护组件和路由 |
| Markdown | mdsvex | 将 Markdown 编译为 Svelte 内容组件 |
| 渲染 | 全站预渲染 | 构建时输出静态 HTML，无线上 SSR |
| 适配器 | `@sveltejs/adapter-static` | 输出 Cloudflare Pages 可直接托管的 `build/` |
| 样式 | 原生 CSS + CSS Variables | 复用现有视觉参数，不引入 UI 框架 |
| CI | GitHub Actions | 检查、构建、部署 |
| 托管 | Cloudflare Pages | CDN、HTTPS、自定义域名和预览环境 |

首版不使用 Worker SSR、D1、KV、R2、CMS、评论服务和服务端搜索。这些能力不是 Markdown 静态博客的必要条件。

### 4.2 构建数据流

```text
site.config.ts ─┐
home.config.ts ─┼─> SvelteKit 页面组件 ─> adapter-static ─> build/
projects/*.md  ─┤
posts/*.md     ─┘
                                             └─> Wrangler ─> Cloudflare Pages
```

内容加载层使用 `import.meta.glob` 读取 Markdown 模块，统一完成元数据规范化、草稿过滤、排序和 slug 生成。动态文章路由通过 SvelteKit `entries` 显式声明所有 slug，避免依赖链接爬取才能完成预渲染。

## 5. 配置设计

配置拆成两层，避免一个文件同时承担品牌信息和首页内容：

### 5.1 `src/lib/config/site.ts`

负责全站级信息：

```ts
export const siteConfig = {
  title: 'Site name',
  description: 'Site description',
  url: 'https://example.com',
  locale: 'zh-CN',
  author: {
    name: 'Author name',
    email: ''
  },
  navigation: [
    { label: 'home', href: '/#projects' },
    { label: 'blog', href: '/blog' }
  ],
  social: {
    instagram: '',
    x: '',
    linkedin: '',
    email: ''
  }
} as const;
```

约束：

- Header、Footer、SEO、RSS 和 Sitemap 只能读取该配置，不在组件中重复写死。
- `play` 不再出现在导航配置中。
- 当前 `home` 下拉结构继续保留，指向 About 和 Projects 锚点。

### 5.2 `src/lib/config/home.ts`

负责首页展示内容，尤其是 Hero：

```ts
export const homeConfig = {
  hero: {
    kicker: 'DESIGNER / ENGINEER / ARTIST / STUDENT',
    title: 'Display Name',
    images: [
      {
        id: 'osaka-castle',
        src: '/images/hero/osaka-castle.webp',
        alt: 'Osaka Castle sketch',
        caption: 'Osaka Castle',
        width: 1280,
        height: 720,
        enabled: true
      }
    ]
  },
  about: {
    portrait: '/images/portrait.webp'
  },
  projects: {
    heading: 'Projects'
  }
} as const;
```

Hero 配置规则：

- 数组顺序就是前台翻页顺序，不再维护额外的 order 字段。
- `enabled: false` 的图片不参与轮播，但配置和文件可以保留。
- `src` 统一指向 `static/images/hero/` 下的站内路径。
- `alt` 必填并用于无障碍文本，`caption` 用于图片下方说明。
- `width` 和 `height` 必填，用于构建稳定的图片比例，避免布局偏移。
- 至少必须存在一张启用图片；构建检查不通过时终止部署。
- 更换、增删或调整 Hero 图片顺序不需要修改 Svelte 组件。

## 6. 内容模型

### 6.1 Blog Markdown

目录：`src/content/posts/*.md`

```md
---
title: 使用 SvelteKit 构建静态博客
description: 记录站点架构和部署过程
date: 2026-07-17
draft: false
tags:
  - SvelteKit
cover: /images/blog/sveltekit-blog.webp
---

正文内容。
```

字段规则：

| 字段 | 必填 | 用途 |
| --- | --- | --- |
| `title` | 是 | 列表标题、文章标题和 SEO title |
| `description` | 是 | SEO description 和文章摘要 |
| `date` | 是 | 排序、列表年份、结构化数据 |
| `draft` | 是 | 生产构建过滤草稿 |
| `tags` | 是 | 列表右侧分类文字和文章标签 |
| `cover` | 否 | Blog 列表桌面端悬停缩略图和 Open Graph 图片 |

slug 直接取 Markdown 文件名，例如 `sveltekit-blog.md` 对应 `/blog/sveltekit-blog`。首版不支持在 frontmatter 中覆盖 slug，避免文件名与 URL 出现双重来源。

### 6.2 Project 内容

目录：`src/content/projects/*.md`

```md
---
title: Project title
description: Short card description
year: '2026'
category: design
cover: /images/projects/project-name.webp
order: 10
draft: false
---

项目详情内容。
```

首页项目卡片直接从 Project frontmatter 生成，避免同时维护卡片配置和详情页内容：

- 图片来自 `cover`。
- 图片下方左侧显示 `title`。
- 图片下方右侧显示 `category`；没有 category 时使用 `description`。
- 以 `order` 升序展示；order 相同时再按 year 倒序。
- `draft: true` 的项目不出现在首页，也不生成公开详情页。

## 7. 页面与组件规划

### 7.1 共享组件

| 组件 | 责任 |
| --- | --- |
| `SiteHeader.svelte` | 品牌名、home 下拉、blog、社交入口和当前页状态 |
| `SiteFooter.svelte` | 版权信息，从站点配置读取 |
| `SectionLabel.svelte` | About、Projects、Blog 等统一小标题 |
| `Seo.svelte` | title、description、canonical 和 Open Graph |

### 7.2 首页组件

| 组件 | 责任 |
| --- | --- |
| `HeroSketchbook.svelte` | 读取 Hero 图片配置、翻页、caption、左右按钮和下滑按钮 |
| `AboutSection.svelte` | 保持现有文字与头像布局 |
| `ProjectGrid.svelte` | 当前 Play 风格的项目卡片网格 |
| `ProjectCard.svelte` | 16:10 封面、标题、分类和悬停缩放 |

首页目标结构：

```svelte
<SiteHeader />
<main class="page home">
  <HeroSketchbook images={homeConfig.hero.images} />
  <AboutSection />
  <ProjectGrid projects={projects} />
</main>
<SiteFooter />
```

### 7.3 Blog 组件

| 组件 | 责任 |
| --- | --- |
| `BlogList.svelte` | 输出分隔线列表并处理行间悬停状态 |
| `BlogRow.svelte` | 映射年份、标题、首个标签和可选缩略图 |
| `MarkdownArticle.svelte` | 文章标题、元信息、正文排版 |

Blog 行与原 Projects 行的字段映射：

| 原 Projects 字段 | Blog 字段 |
| --- | --- |
| year | `date` 的年份 |
| title | `title` |
| blurb | `tags[0]` |
| row thumbnail | `cover` |

桌面端保持三列；移动端保持年份和标题两列，隐藏右侧标签及悬停图。文章按日期倒序，不在首版加入分页、搜索和标签归档页面。

## 8. 样式迁移规则

### 8.1 必须保持不变

- 页面最大内容宽度和左右留白。
- Header 高度、导航位置、字距和社交图标位置。
- Hero 的满屏高度、模糊标题、图册层级和向下按钮位置。
- About 的文本宽度、头像比例和区块间距。
- 页面背景、正文颜色、弱化颜色和 hairline 分隔线。
- Footer 的位置和视觉权重。

### 8.2 允许变化

- 首页 Projects 区块高度会因卡片网格替换列表而变化。
- `/blog` 页面高度根据文章数量变化。
- Next.js 生成的类名和内部 DOM 结构改为语义化 Svelte 组件结构。
- 图片地址改为本地静态资源路径。

### 8.3 响应式断点

不直接照搬 Next.js 编译 CSS 中的全部媒体查询，只保留当前实际行为：

- 宽屏：首页 Projects 三列卡片。
- 中屏：首页 Projects 两列卡片。
- 窄屏：首页 Projects 单列卡片。
- Blog 宽屏显示年份、标题、标签；窄屏隐藏标签和悬停图。
- Hero 在 1440px、768px、390px 三个基准宽度下保持当前构图和可操作性。

## 9. 建议目录

```text
src/
├─ content/
│  ├─ posts/
│  └─ projects/
├─ lib/
│  ├─ components/
│  │  ├─ layout/
│  │  ├─ home/
│  │  └─ blog/
│  ├─ config/
│  │  ├─ site.ts
│  │  └─ home.ts
│  ├─ content/
│  │  ├─ posts.ts
│  │  └─ projects.ts
│  └─ types/
│     └─ content.ts
├─ routes/
│  ├─ +layout.svelte
│  ├─ +layout.ts
│  ├─ +page.svelte
│  ├─ blog/
│  │  ├─ +page.svelte
│  │  └─ [slug]/
│  │     ├─ +page.ts
│  │     └─ +page.svelte
│  ├─ home/[slug]/
│  ├─ rss.xml/+server.ts
│  └─ sitemap.xml/+server.ts
├─ app.css
└─ app.html

static/
├─ images/
│  ├─ hero/
│  ├─ blog/
│  └─ projects/
├─ fonts/
├─ icons/
├─ favicon.svg
└─ _redirects

.github/workflows/
├─ check.yml
└─ deploy.yml
```

## 10. 路由与重定向

Cloudflare Pages 使用 `static/_redirects` 处理确定的旧入口：

```text
/play  /blog  301
```

约束：

- 站内不再生成指向 `/play` 的链接。
- Header 的 Blog 激活状态只根据 `/blog` 和 `/blog/*` 判断。
- 首页 Projects 卡片继续指向 `/home/[slug]`，不复用旧 `/play/*` URL。
- 未决定去向的 `/play/*` 子路由暂不写批量规则。
- 上线前生成一次内部链接清单，确保没有残留 `/_next/`、`/play` 或缺失图片地址。

## 11. GitHub Actions 与 Cloudflare Pages

### 11.1 检查工作流

Pull Request 和 main 分支推送时执行：

1. `npm ci`
2. `npm run check`
3. `npm run build`

任何一步失败都不得部署。

### 11.2 部署工作流

仅 main 分支检查通过后执行：

```text
cloudflare/wrangler-action@v3
command: pages deploy build --project-name=<project-name>
```

GitHub Secrets：

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

Cloudflare Pages 项目只接收 Actions 生成的 `build/`，不在 Cloudflare 控制台重复配置第二套 Git 构建，避免同一次提交触发两次部署。

## 12. 分阶段实施计划

### 阶段 0：基线冻结与资源清点

任务：

- 保留当前 `site/`、`RECON/` 和现有截图作为视觉基线。
- 列出需要迁移的首页文字、Hero 图片、项目内容、字体和图标。
- 将三个 `/play/*` 实验页面标记为下线内容，不迁移对应运行资源。
- 记录当前 1440px、768px、390px 首页截图和 `/play` 截图。

完成条件：迁移清单明确，旧镜像未删除。

### 阶段 1：建立 SvelteKit 工程

任务：

- 创建 SvelteKit + TypeScript 工程结构。
- 配置 mdsvex 和 `adapter-static`。
- 配置全站 `prerender`。
- 建立 `site.ts`、`home.ts` 和类型定义。
- 建立全局 CSS Variables、字体和基础页面容器。

验证：

- `npm run check` 通过。
- `npm run build` 输出 `build/`。
- 直接访问构建后的 `/` 不依赖 Node 服务。

### 阶段 2：内容加载与构建校验

任务：

- 实现 Posts 和 Projects 的 Markdown 加载器。
- 实现 slug、日期、草稿和排序逻辑。
- 实现 frontmatter 必填字段校验。
- 实现 Hero 至少一张启用图片及静态文件存在性校验。
- 为 `/blog/[slug]` 和 `/home/[slug]` 生成预渲染 entries。

验证：

- 新增 Markdown 后自动生成路由。
- `draft: true` 不出现在生产输出。
- 重复 slug、错误日期、缺失图片或缺少必填字段会让构建失败。

### 阶段 3：首页视觉迁移

任务：

- 重建 Header、Hero、About 和 Footer。
- Hero 改为读取 `homeConfig.hero.images`。
- 保持当前左右翻页、caption 和向下按钮行为。
- 将 Projects 替换为 Play 风格卡片网格。
- 项目卡片读取 Project Markdown 元数据。

验证：

- 修改 Hero 配置即可增删、隐藏和排序图片。
- 首页区块顺序与当前一致。
- Projects 在宽屏三列、中屏两列、窄屏单列。
- Hero 与现有基准截图在三个视口下保持同一构图。

### 阶段 4：Blog 列表与文章页

任务：

- 导航文字由 `play` 改为 `blog`。
- 实现 `/blog` 横向文章列表。
- 迁移原 Projects 行的 hover、缩略图和弱化交互。
- 实现 Markdown 文章排版。
- 实现文章级 SEO、canonical 和 Open Graph。
- 生成 RSS 与 Sitemap。

验证：

- Blog 列表按日期倒序。
- 宽屏显示年份、标题和首个标签。
- 移动端只显示年份和标题。
- 每篇 Markdown 可通过独立 URL 直接访问和刷新。

### 阶段 5：Cloudflare 自动部署

任务：

- 创建 Cloudflare Pages 项目。
- 配置 GitHub Secrets。
- 添加检查与部署 Actions。
- 添加 `/play` 到 `/blog` 的 301 重定向。
- 绑定正式域名并确认 HTTPS。

验证：

- Pull Request 只检查，不发布正式站。
- main 合并后自动构建并部署。
- 部署失败不会覆盖上一版可用产物。
- 正式域名、RSS、Sitemap 和 404 均可访问。

### 阶段 6：切换与清理

任务：

- 完成新旧页面逐项验收。
- 确认所有需要保留的图片和内容已迁移。
- 删除新的 SvelteKit 工程不再引用的 Next.js 编译产物和本地 Node 镜像服务器。
- 更新 README 为新的开发、写作和部署说明。

清理动作涉及当前镜像核心文件，必须在新站验收后单独确认执行。

## 13. 验收矩阵

| 范围 | 验收标准 |
| --- | --- |
| 首页结构 | Header、Hero、About、Projects、Footer 顺序不变 |
| Hero | 图片完全由配置控制；增删、隐藏、排序无需改组件 |
| Hero 视觉 | 1440px、768px、390px 下保持当前主要构图和层级 |
| Projects | 使用 16:10 Play 卡片风格，桌面三列，移动单列 |
| Blog 导航 | 全站不再显示 Play，统一显示 Blog |
| Blog 列表 | 使用原 Projects 行样式及响应式行为 |
| Markdown | 新增文件即可生成文章；草稿不进入生产构建 |
| 路由 | `/blog`、文章直达、`/home/[slug]`、404 均可刷新访问 |
| 旧入口 | `/play` 返回 301 并跳转 `/blog` |
| SEO | title、description、canonical、OG、RSS、Sitemap 正确 |
| 构建 | `npm run check` 和 `npm run build` 通过 |
| 部署 | main 分支合并后 GitHub Actions 自动发布 Pages |
| 产物 | 页面不再请求 `/_next/*`，不需要运行 `server.mjs` |

## 14. 明确不在首版范围内

- 在线 CMS 和后台编辑器。
- 评论、登录、订阅数据库。
- 全文搜索。
- 标签归档和分页。
- Worker SSR、D1、KV、R2。
- 重新设计首页 Hero、About 或全站视觉风格。
- 为已经下线的 `/play/*` 实验页建立兼容内容或批量重定向。

## 15. Play 实验页处理结论

以下三个实验页已确认删除：

- `/play/oscillon`
- `/play/hypercycles`
- `/play/cultcube`

它们不进入新的 SvelteKit 路由、不复制缩略图和运行资源，也不改造成 Projects。只有旧 `/play` 列表入口保留 301 到 `/blog`。
