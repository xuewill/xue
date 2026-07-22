<div align="center">
  <a href="https://willxue.com">
    <img src="./static/seal.png" alt="Will Xue seal" width="144" height="144">
  </a>

  <h1>Will Xue's Blog</h1>

  <p>一个关于技术、艺术、设计与代码的轻量级全静态作品集和 Markdown 博客。</p>

  <p>
    <a href="https://github.com/xuewill/xue/actions/workflows/check.yml"><img src="https://github.com/xuewill/xue/actions/workflows/check.yml/badge.svg" alt="检查状态"></a>
    <a href="https://github.com/xuewill/xue/actions/workflows/deploy.yml"><img src="https://github.com/xuewill/xue/actions/workflows/deploy.yml/badge.svg?branch=main" alt="部署状态"></a>
    <a href="https://svelte.dev"><img src="https://img.shields.io/badge/SvelteKit-2-ff3e00?logo=svelte&logoColor=white" alt="SvelteKit 2"></a>
    <a href="https://pages.cloudflare.com"><img src="https://img.shields.io/badge/Cloudflare-Pages-f38020?logo=cloudflare&logoColor=white" alt="Cloudflare Pages"></a>
    <a href="./LICENSE"><img src="https://img.shields.io/github/license/xuewill/xue" alt="MIT 许可证"></a>
  </p>

  <p>
    <a href="./README.md">English</a> · <strong>简体中文</strong>
  </p>
</div>

## ✨ 项目简介

本仓库是 [willxue.com](https://willxue.com) 的源代码。首页延续原作品集的视觉结构，Projects 使用图片卡片网格，Blog 使用按年份组织的横向文章列表。Blog 和 Project 均使用 Markdown 编写，并在构建阶段生成完全预渲染的静态站点。

线上不需要 Node.js 服务、数据库或 Worker SSR 运行时。生成的 `build/` 目录可以部署到任意静态托管服务。

### 主要特性

- SvelteKit 2、Svelte 5 和 TypeScript
- 使用 mdsvex 管理 Markdown 内容
- 通过 `@sveltejs/adapter-static` 生成全静态页面
- 自动检查 Hero 图片、文章封面和 Markdown 正文图片
- 内置 RSS、Sitemap、robots 文件和响应式图片资源
- 响应式环境灯、文章目录和移动端主题控制
- 支持键盘访问的页脚预览卡、真实 GitHub 数据和可选的 X 官方数据
- 使用 GitHub Actions 检查并部署到 Cloudflare Pages

## 🧰 技术栈

| 分类 | 技术 |
| --- | --- |
| 应用框架 | SvelteKit 2 + Svelte 5 |
| 开发语言 | TypeScript |
| 内容系统 | Markdown + mdsvex |
| 构建工具 | Vite + `@sveltejs/adapter-static` |
| 托管平台 | Cloudflare Pages |
| CI/CD | GitHub Actions + Wrangler |

## 🚀 快速开始

### 环境要求

- [Node.js](https://nodejs.org/) 22 或更高版本
- npm（安装 Node.js 时会一并安装）

### 安装和启动

```bash
git clone https://github.com/xuewill/xue.git
cd xue
npm ci
npm run dev
```

打开 Vite 输出的本地地址，通常是 `http://localhost:5173`。

### 生产构建

```bash
npm run check
npm run build
npm run preview
```

静态产物生成在 `build/`。`npm run build` 会先检查内容资源，再编译站点。

## 📜 可用命令

| 命令 | 说明 |
| --- | --- |
| `npm run dev` | 启动 Vite 开发服务器 |
| `npm run check` | 检查内容、同步 SvelteKit 类型并运行 `svelte-check` |
| `npm run build` | 检查内容并生成静态生产版本 |
| `npm run preview` | 在本地预览生产构建 |
| `npm run validate:content` | 只检查内容中引用的图片和资源 |
| `npm run check:watch` | 以监听模式运行 Svelte 诊断 |

## 🗂️ 项目结构

```text
.
├── .env.example             # 可选的社交平台 API 凭证
├── .github/workflows/       # Pull Request 检查和生产部署
├── scripts/                 # 内容检查脚本
├── src/
│   ├── content/posts/       # Blog Markdown 文件
│   ├── content/projects/    # Project Markdown 文件
│   ├── lib/components/      # 可复用 Svelte 组件
│   ├── lib/config/          # 站点和首页配置
│   ├── lib/server/          # 构建阶段获取社交平台数据
│   ├── lib/types/           # 内容与社交数据的共享类型
│   └── routes/              # 页面、RSS 和 Sitemap 路由
├── static/                  # 图片、字体、图标、manifest 和 robots.txt
├── svelte.config.js         # mdsvex 和静态适配器配置
└── wrangler.toml            # Cloudflare Pages 输出配置
```

## ⚙️ 站点配置

- `src/lib/config/site.ts`：站点标题、规范域名、作者、导航和社交链接。
- `src/lib/config/home.ts`：Hero 图片以及 About 和 Projects 文案。
- `src/app.css`：颜色、字体、尺寸和响应式样式。
- `static/`：不经过转换、直接复制到站点根目录的文件。

Hero 图片位于 `static/home/sketchbook/`。在 `homeConfig.hero.images` 中增删对象或调整数组顺序即可控制前台内容：

```ts
{
  id: 'image-id',
  src: '/home/sketchbook/image.png',
  alt: 'Accessible description',
  caption: 'Image caption',
  width: 1280,
  height: 720,
  enabled: true
}
```

请让 `width` 和 `height` 与源图片尺寸一致，避免页面布局偏移。如果暂时不希望展示某张图片，可保留配置并设置 `enabled: false`。

## 🖥️ 界面行为

- 顶部主导航使用 `home` 和 `blog`。项目详情页位于 `/home/[slug]`，旧的 `/work/*` 地址会永久重定向到 `/home/*`。
- 左侧吊灯会跟随响应式内容轨道移动，但会在正文区域之前停止；右侧拉绳固定在视口右边缘，不会遮挡顶部导航。
- 文章目录会在大屏幕上扩宽。移动端主题切换使用无边框图标，并通过竖线与导航文字分隔。
- 页脚 Social 图标使用 20 px 图案和 32 px 点击区域。预览卡支持鼠标悬浮与键盘聚焦；触屏设备会直接打开链接，不显示浮层。

## 🔗 Social 预览数据

社交数据由 `src/lib/server/social.ts` 在静态构建阶段读取，再通过根布局传给页脚。访客打开预览卡时不会从浏览器请求第三方 API，因此 API 凭证不会暴露到前端。

| 平台 | 数据来源 | 失败回退 |
| --- | --- | --- |
| GitHub | 公开用户 API 和近期贡献日历 | 最近一次确认的公开数字；贡献服务不可用时显示中性方格 |
| X | 配置 `X_BEARER_TOKEN` 后使用 X 官方 API | 使用本地姓名、头像和简介，不伪造关注数字 |
| Email | 本地信封视觉效果 | 不发起网络请求 |

根据需要把 `.env.example` 中的可选变量配置到本地或部署构建环境：

```bash
X_BEARER_TOKEN=
GITHUB_TOKEN=
```

本地构建可以不配置 `GITHUB_TOKEN`，但配置后可避免 GitHub 匿名 API 的频率限制。`X_BEARER_TOKEN` 需要有效的 X API 权限。由于站点是全静态的，Social 数据会在运行 `npm run build` 并重新部署时更新，而不是访客每次打开卡片时实时请求。

## ✍️ 发布内容

### 新增 Blog

在 `src/content/posts/` 中新建 Markdown 文件，文件名就是 URL slug：

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

例如 `article-title.md` 对应 `/blog/article-title`。生产构建会过滤 `draft: true` 的文章，其余文章会自动进入 Blog 列表、RSS 和 Sitemap。

### 新增 Project

在 `src/content/projects/` 中新建 Markdown 文件：

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

首页按照 `order` 升序生成卡片。名为 `project-name.md` 的文件会发布到 `/home/project-name`。

## ☁️ 部署到 Cloudflare Pages

仓库中的部署工作流会在 GitHub Actions 内构建站点，然后使用 Wrangler 上传 `build/`。Cloudflare 不会再次执行构建。

### 1. 创建 Cloudflare Pages 项目

在仓库目录中安装依赖并登录 Wrangler：

```bash
npm ci
npx wrangler login
```

创建 Pages 项目。如果需要其他项目名，请替换 `xue-blog`：

```bash
npx wrangler pages project create xue-blog --production-branch main
```

如果项目已经存在，可以跳过这条命令。项目名必须同时与 `wrangler.toml` 中的 `name` 以及下文的 GitHub 变量 `CLOUDFLARE_PROJECT_NAME` 一致。

### 2. 创建 Cloudflare API Token

1. 打开 Cloudflare 控制台，进入 **My Profile → API Tokens**。
2. 选择 **Create Token → Create Custom Token**。
3. 添加权限 **Account → Cloudflare Pages → Edit**。
4. 在 **Account Resources** 中选择 Pages 项目所属的账号。
5. 创建并立即保存 Token；Cloudflare 只会完整显示一次。

在 Cloudflare 控制台进入 **Workers & Pages → Overview** 可以找到 Account ID。账号 URL 和控制台账号详情区域也会显示它。

### 3. 配置 GitHub 仓库

打开 **GitHub 仓库 → Settings → Secrets and variables → Actions**。

在 **Secrets** 中添加以下 Repository secrets：

| Secret | 值 |
| --- | --- |
| `CLOUDFLARE_API_TOKEN` | 上一步创建的 API Token |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare Account ID |
| `X_BEARER_TOKEN`（可选） | 构建阶段刷新 X 预览数据的官方 API Bearer Token |

在 **Variables** 中添加以下 Repository variable：

| Variable | 值 |
| --- | --- |
| `CLOUDFLARE_PROJECT_NAME` | Pages 项目名，例如 `xue-blog` |

Secrets 会被加密且不会显示在 Actions 日志中。项目名不是敏感信息，因此使用 Variable 保存。工作流会自动把 GitHub 内置的 `GITHUB_TOKEN` 传给构建步骤，不需要额外创建 GitHub Token Secret。

### 4. 触发第一次部署

推送到 `main`，或者在 GitHub 打开 **Actions → Deploy → Run workflow**：

```bash
git push origin main
```

工作流会依次执行：

1. 拉取仓库并安装 Node.js 22。
2. 运行 `npm ci`、`npm run check` 和 `npm run build`。
3. 将 `build/` 上传到指定的 Cloudflare Pages 项目。
4. 将结果发布到名为 `main` 的生产分支。

任务完成后，可以通过 `<project-name>.pages.dev` 访问站点。Pull Request 会运行 `.github/workflows/check.yml` 做校验，但不会发布预览环境。

### 5. 绑定自定义域名

1. 打开 **Cloudflare Dashboard → Workers & Pages → 你的项目 → Custom domains**。
2. 选择 **Set up a custom domain**，输入域名或子域名。
3. 按提示设置 DNS。域名已由同一 Cloudflare 账号管理时，一般可以自动完成配置。
4. 更新 `src/lib/config/site.ts` 中的 `siteConfig.url`，并同步修改 `static/robots.txt` 中的 Sitemap 域名。
5. 重新构建和部署，使 canonical URL、RSS、Sitemap 和社交分享元数据使用新域名。

### 手动部署

需要在不经过 GitHub Actions 的情况下测试部署时，可执行：

```bash
npm ci
npm run check
npm run build
npx wrangler pages deploy build --project-name=xue-blog --branch=main
```

### 部署问题排查

| 现象 | 检查项 |
| --- | --- |
| 提示 `Project not found` | 确认 Pages 项目已创建，并且 `CLOUDFLARE_PROJECT_NAME` 与项目名完全一致 |
| 身份验证或权限错误 | 为正确账号重新创建带有 **Cloudflare Pages: Edit** 权限的 Token |
| `npm ci` 失败 | 使用 Node.js 22+，并在依赖变化时提交更新后的 `package-lock.json` |
| 构建提示图片缺失 | 修正引用路径或将资源放入 `static/`，再运行 `npm run validate:content` |
| GitHub 预览显示回退快照 | 在构建环境中配置 `GITHUB_TOKEN`，或等待匿名 API 限额重置 |
| X 预览没有关注数字 | 在执行 `npm run build` 的环境中配置 `X_BEARER_TOKEN` |
| 自定义域名仍显示旧元数据 | 更新规范域名和 `robots.txt`，重新构建，并等待 DNS 或缓存刷新 |
| GitHub 没有触发部署 | 确认推送目标为 `main`，或从 Actions 页面手动运行工作流 |

## 🔄 CI/CD 规则

- Pull Request 和手动运行会执行 `.github/workflows/check.yml`。
- 推送到 `main` 和手动运行会执行 `.github/workflows/deploy.yml`。
- 两个工作流都使用 Node.js 22，并执行与本地一致的检查。
- 只有检查和静态构建全部成功后才会发布生产版本。

## 📄 许可证

本项目使用 [MIT License](./LICENSE) 发布。
