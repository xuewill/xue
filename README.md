<div align="center">
  <a href="https://willxue.com">
    <img src="./static/seal.png" alt="Will Xue seal" width="144" height="144">
  </a>

  <h1>Will Xue's Blog</h1>

  <p>A lightweight, fully static portfolio and Markdown blog for tech, art, design, and code.</p>

  <p>
    <a href="https://github.com/xuewill/xue/actions/workflows/check.yml"><img src="https://github.com/xuewill/xue/actions/workflows/check.yml/badge.svg" alt="Check status"></a>
    <a href="https://github.com/xuewill/xue/actions/workflows/deploy.yml"><img src="https://github.com/xuewill/xue/actions/workflows/deploy.yml/badge.svg?branch=main" alt="Deploy status"></a>
    <a href="https://svelte.dev"><img src="https://img.shields.io/badge/SvelteKit-2-ff3e00?logo=svelte&logoColor=white" alt="SvelteKit 2"></a>
    <a href="https://pages.cloudflare.com"><img src="https://img.shields.io/badge/Cloudflare-Pages-f38020?logo=cloudflare&logoColor=white" alt="Cloudflare Pages"></a>
    <a href="./LICENSE"><img src="https://img.shields.io/github/license/xuewill/xue" alt="MIT license"></a>
  </p>

  <p>
    <strong>English</strong> · <a href="./README.zh-CN.md">简体中文</a>
  </p>
</div>

## ✨ Overview

This repository contains the source for [willxue.com](https://willxue.com). The home page preserves the visual structure of the original portfolio, with image-based project cards and a horizontal, year-grouped blog index. Blog posts and project pages are authored in Markdown and compiled into a pre-rendered static site.

There is no production Node.js server, database, or Worker SSR runtime. The generated `build/` directory can be hosted by any static file service.

### Highlights

- SvelteKit 2, Svelte 5, and TypeScript
- Markdown content powered by mdsvex
- Fully pre-rendered output via `@sveltejs/adapter-static`
- Automatic validation for Hero images, post covers, and images referenced in Markdown
- Built-in RSS feed, sitemap, robots file, and responsive assets
- Responsive ambient light controls, article TOC, and mobile theme controls
- Accessible footer previews with live GitHub data and optional official X data
- GitHub Actions checks and Cloudflare Pages deployment

## 🧰 Tech Stack

| Layer | Technology |
| --- | --- |
| Application | SvelteKit 2 + Svelte 5 |
| Language | TypeScript |
| Content | Markdown + mdsvex |
| Build | Vite + `@sveltejs/adapter-static` |
| Hosting | Cloudflare Pages |
| CI/CD | GitHub Actions + Wrangler |

## 🚀 Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) 22.13 or newer
- npm (included with Node.js)

### Install and run

```bash
git clone https://github.com/xuewill/xue.git
cd xue
npm ci
npm run dev
```

Open the local URL printed by Vite, normally `http://localhost:5173`.

### Production build

```bash
npm run verify
npm run test:e2e
npm run preview
```

The static production output is written to `build/`. `npm run verify` runs linting, unit tests, content and type checks, and the production build. The end-to-end suite starts a local preview of that build.

## 📜 Available Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite development server |
| `npm run lint` | Run ESLint across JavaScript, TypeScript, and Svelte files |
| `npm test` | Run the Vitest unit test suite |
| `npm run test:e2e` | Run Playwright browser regression tests against the production build |
| `npm run check` | Validate content, sync SvelteKit types, and run `svelte-check` |
| `npm run build` | Validate content and create the static production build |
| `npm run verify` | Run lint, unit tests, checks, and the production build |
| `npm run preview` | Preview the production build locally |
| `npm run validate:content` | Check referenced images and content assets only |
| `npm run check:watch` | Run Svelte diagnostics in watch mode |

## 🗂️ Project Structure

```text
.
├── .env.example             # Optional social API credentials
├── .github/workflows/       # Pull request checks and production deployment
├── scripts/                 # Content validation scripts
├── src/
│   ├── content/posts/       # Blog Markdown files
│   ├── content/projects/    # Project Markdown files
│   ├── lib/components/      # Reusable Svelte components
│   ├── lib/config/          # Site and home-page configuration
│   ├── lib/server/          # Build-time social data fetching
│   ├── lib/types/           # Shared content and social data types
│   └── routes/              # SvelteKit pages, RSS, and sitemap routes
├── static/                  # Images, fonts, icons, manifest, and security headers
├── tests/                   # Vitest unit and Playwright browser tests
├── svelte.config.js         # mdsvex and static adapter configuration
└── wrangler.toml            # Cloudflare Pages output configuration
```

## ⚙️ Site Configuration

- `src/lib/config/site.ts`: site title, canonical URL, author, navigation, and social links.
- `src/lib/config/home.ts`: Hero images and the About and Projects section copy.
- `src/app.css`: colors, typography, sizing, and responsive behavior.
- `static/`: files copied to the site root without transformation.

Hero images live in `static/home/sketchbook/`. Add, remove, or reorder objects in `homeConfig.hero.images` to control what is displayed:

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

Keep `width` and `height` aligned with the source image dimensions to avoid layout shifts. Set `enabled: false` to keep an image configured without showing it.

## 🖥️ Interface Behavior

- The primary navigation uses `home` and `blog`. Project detail pages live at `/home/[slug]`; legacy `/work/*` URLs redirect permanently to `/home/*`.
- The left pendant lamp follows the responsive content rail but stops before the main reading column. The pull cord stays pinned to the right edge so it does not cover the header navigation.
- The article table of contents expands on large screens. On mobile, the theme control is an unframed icon separated from navigation by a vertical rule.
- Footer social icons use 20 px artwork inside 32 px targets. Preview cards support mouse hover and keyboard focus, while touch devices follow the link without opening a card.

## 🔗 Social Preview Data

Social data is loaded during the static build in `src/lib/server/social.ts` and passed through the root layout. An open preview card never makes a browser-side API request, so API credentials are not exposed to visitors.

| Service | Data source | Fallback |
| --- | --- | --- |
| GitHub | Public profile API plus the recent contribution calendar | Last verified public counts and a neutral grid if the contribution service is unavailable |
| X | Official X API when `X_BEARER_TOKEN` is configured | Local name, avatar, and bio; no fabricated follower counts |
| Email | Local visual envelope | No network request |

Copy the optional values from `.env.example` into the local or deployment build environment:

```bash
X_BEARER_TOKEN=
GITHUB_TOKEN=
```

`GITHUB_TOKEN` is optional locally but recommended to avoid GitHub's anonymous API rate limit. `X_BEARER_TOKEN` requires X API access. Because the site is fully static, social values refresh when `npm run build` runs and a new deployment is published, not each time a visitor opens a card.

## ✍️ Publishing Content

### Add a blog post

Create a Markdown file in `src/content/posts/`. The filename becomes the URL slug.

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

For example, `article-title.md` is published at `/blog/article-title`. Posts with `draft: true` are excluded from production; published posts are added automatically to the blog index, RSS feed, and sitemap.

### Add a project

Create a Markdown file in `src/content/projects/`:

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

Projects are ordered by ascending `order` value. A file named `project-name.md` is published at `/home/project-name`.

## ☁️ Deploying to Cloudflare Pages

The included deployment workflow builds the site in GitHub Actions and uploads `build/` with Wrangler. Cloudflare does not run a second build.

### 1. Create a Cloudflare Pages project

Install dependencies and authenticate Wrangler from the repository directory:

```bash
npm ci
npx wrangler login
```

Create the Pages project. Replace `xue-blog` if you want a different project name:

```bash
npx wrangler pages project create xue-blog --production-branch main
```

If the project already exists, skip this command. The name must match both `name` in `wrangler.toml` and the `CLOUDFLARE_PROJECT_NAME` GitHub variable configured below.

### 2. Create a Cloudflare API token

1. Open the Cloudflare dashboard and go to **My Profile → API Tokens**.
2. Select **Create Token → Create Custom Token**.
3. Add the permission **Account → Cloudflare Pages → Edit**.
4. Under **Account Resources**, include the account that owns the Pages project.
5. Create the token and store it immediately; Cloudflare shows it only once.

Find the account ID in the Cloudflare dashboard under **Workers & Pages → Overview**. It is also available in the account URL and the dashboard's account details panel.

### 3. Configure the GitHub repository

Open **GitHub repository → Settings → Secrets and variables → Actions**.

Add these repository secrets under **Secrets**:

| Secret | Value |
| --- | --- |
| `CLOUDFLARE_API_TOKEN` | The API token created in the previous step |
| `CLOUDFLARE_ACCOUNT_ID` | The Cloudflare account ID |
| `X_BEARER_TOKEN` (optional) | An official X API bearer token used to refresh the X preview during builds |

Add this repository variable under **Variables**:

| Variable | Value |
| --- | --- |
| `CLOUDFLARE_PROJECT_NAME` | The Pages project name, for example `xue-blog` |

Secrets are encrypted and are not printed in Actions logs. The project name is not sensitive, so it is intentionally stored as a variable. The workflows pass GitHub's built-in `GITHUB_TOKEN` to the build automatically; no additional GitHub secret is required.

### 4. Trigger the first deployment

Push to `main`, or open **Actions → Deploy → Run workflow** in GitHub:

```bash
git push origin main
```

The workflow performs the following steps:

1. Checks out the repository and installs Node.js 22.13.
2. Runs `npm ci`, a dependency audit, and `npm run verify`.
3. Uploads `build/` to the configured Cloudflare Pages project.
4. Publishes the result to the production branch named `main`.

When the job finishes, the deployment is available at `<project-name>.pages.dev`. Pull requests run `.github/workflows/check.yml` for validation but do not publish preview deployments.

### 5. Add a custom domain

1. Open **Cloudflare Dashboard → Workers & Pages → your project → Custom domains**.
2. Select **Set up a custom domain** and enter the domain or subdomain.
3. Follow the DNS prompts. Domains already managed by the same Cloudflare account can usually be configured automatically.
4. Update `siteConfig.url` in `src/lib/config/site.ts`; robots, canonical, RSS, and Sitemap URLs are generated from it.
5. Rebuild and deploy so canonical URLs, RSS, sitemap, and social metadata use the new domain.

### Manual deployment

Use this path to test Cloudflare deployment without GitHub Actions:

```bash
npm ci
npm run verify
npx wrangler pages deploy build --project-name=xue-blog --branch=main
```

### Deployment troubleshooting

| Symptom | What to check |
| --- | --- |
| `Project not found` | Confirm the Pages project exists and `CLOUDFLARE_PROJECT_NAME` matches it exactly |
| Authentication or permission error | Recreate the token with **Cloudflare Pages: Edit** for the correct account |
| `npm ci` fails | Use Node.js 22.13+ and commit changes to `package-lock.json` whenever dependencies change |
| Build reports a missing image | Fix the referenced path or add the asset under `static/`, then run `npm run validate:content` |
| GitHub preview shows the fallback snapshot | Add `GITHUB_TOKEN` to the build environment or wait for the anonymous API limit to reset |
| X preview has no follower counts | Configure `X_BEARER_TOKEN` in the environment that runs `npm run build` |
| Custom domain shows stale metadata | Update `siteConfig.url`, rebuild, and allow DNS/cache propagation |
| GitHub deployment does not start | Confirm the push targets `main`, or trigger the workflow manually from the Actions tab |

## 🔄 CI/CD Behavior

- Pull requests and manual runs execute `.github/workflows/check.yml`.
- Pushes to `main` and manual runs execute `.github/workflows/deploy.yml`.
- Both workflows use Node.js 22.13, audit dependencies, and run the same verification used locally.
- Pull requests also run the Playwright browser regression suite.
- Production deployment happens only after checks and the static build succeed.

## 📄 License

Released under the [MIT License](./LICENSE).
