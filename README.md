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
- Type-safe Markdown and YAML content powered by Velite
- Build-time syntax highlighting powered by Shiki
- Fully pre-rendered output via `@sveltejs/adapter-static`
- Automatic validation for Hero images, post covers, and images referenced in Markdown
- Built-in RSS feed, sitemap, robots file, and responsive assets
- Stable topic pages, article series, and cross-links between Blog, Projects, and Album works
- A unified `/archive` timeline for writing, Projects, and Album works, with simple client-side type filters
- Build-generated social preview images and JSON-LD for people, posts, projects, and the Album
- Responsive ambient light controls, article TOC, and mobile theme controls
- Accessible footer previews with live GitHub data and optional official X data
- Chromium regression tests, Firefox/WebKit smoke coverage, axe checks, and build-time link validation
- Per-image, route JS/CSS gzip, build-growth, and laboratory Core Web Vitals budgets
- GitHub Actions checks and Cloudflare Pages deployment

## 🧰 Tech Stack

| Layer | Technology |
| --- | --- |
| Application | SvelteKit 2 + Svelte 5 |
| Language | TypeScript |
| Content | Markdown + YAML + Velite |
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
| `npm test` | Generate Velite data and run the Vitest unit test suite |
| `npm run test:e2e` | Run Chromium regressions plus Firefox/WebKit smoke and axe checks |
| `npm run content -- --help` | Show the content creation, checking, preview, and publication CLI |
| `npm run check:links` | Validate generated internal links and probe external links |
| `npm run check:published` | Confirm drafts are absent from production routes and feeds |
| `npm run check:performance` | Check generated images, JS/CSS gzip budgets, and build growth sources |
| `npm run check:deployment` | Smoke-test a deployed Pages URL from `DEPLOYMENT_URL` |
| `npm run check` | Validate content, sync SvelteKit types, and run `svelte-check` |
| `npm run build` | Validate content and create the static production build |
| `npm run verify` | Run lint, unit tests, checks, build, performance budgets, draft leakage, and links |
| `npm run preview` | Preview the production build locally |
| `npm run validate:content` | Check content schemas, image references, and meaningful body-image alt text |
| `npm run validate:generated` | Ensure the tracked web manifest matches its YAML source |
| `npm run check:watch` | Run Svelte diagnostics in watch mode |

## 🗂️ Project Structure

```text
.
├── .env.example             # Optional social API credentials
├── .github/workflows/       # Pull request checks and production deployment
├── scripts/                 # Content validation scripts
├── src/
│   ├── content/config/      # Site, home-page, tag, and album YAML configuration
│   ├── content/posts/       # Blog Markdown files
│   ├── content/projects/    # Project Markdown files
│   ├── lib/components/      # Reusable Svelte components
│   ├── lib/generated/       # Ignored Velite output generated before checks/builds
│   ├── lib/server/          # Build-time social data fetching
│   ├── lib/types/           # Shared content and social data types
│   └── routes/              # SvelteKit pages, RSS, and sitemap routes
├── static/                  # Images, fonts, icons, generated manifest, and security headers
├── tests/                   # Vitest unit and Playwright browser tests
├── svelte.config.js         # Svelte preprocessing and static adapter configuration
├── velite.config.ts         # Content schemas, transforms, sorting, and generated outputs
└── wrangler.toml            # Cloudflare Pages output configuration
```

## ⚙️ Site Configuration

- `src/content/config/site.yaml`: site metadata, publication timezone, author, icons, manifest, navigation, social links, and social fallback data.
- `src/content/config/home.yaml`: Hero images and the About and Projects section copy.
- `src/content/config/tags.yaml`: the finite set of valid tag slugs, labels, and descriptions.
- `src/content/config/metadata.yaml`: the single source of truth for location, role, and media taxonomy.
- `src/content/config/album.yaml`: album photo order, paths, captions, and visual tilt.
- `velite.config.ts`: strict schemas, file-derived slugs, TOC generation, draft filtering, sorting, and static asset validation.
- `src/app.css`: colors, typography, sizing, and responsive behavior.
- `static/`: files copied to the site root without transformation.

Velite generates the ignored `src/lib/generated/content/` directory before tests, checks, builds, and development serving. Sharp also writes ignored, content-hashed WebP variants to `static/generated/media/` for Hero, Album, covers, portraits, and Markdown body images, plus 1200×630 PNG social images to `static/generated/og/`. Source images and YAML/Markdown paths remain the editable source of truth; do not edit generated media directly. Velite also generates the tracked `static/site.webmanifest` snapshot from `site.yaml`, and CI rejects drift between the YAML source and that snapshot.

Responsive image candidates use intrinsic dimensions and `srcset`. Hero loads the active page first, then progressively preloads each next page without changing the existing autoplay sequence. Album renders small responsive thumbnails and requests the larger lightbox role only after a photo is opened. Cloudflare Pages serves `/generated/*` with `Cache-Control: public, max-age=31536000, immutable`; the filename hash changes whenever the source image or encoding recipe changes.

Album image dimensions and camera details (camera, lens, focal length, aperture, shutter speed, and ISO) are read automatically from each source image during the Velite build. If a file has no value for a particular EXIF field, the album displays `—` for that field.

Album dates use explicit `date` and `dateKind` fields. Blog locations, Project locations/roles/media, and Album locations/media use slugs from `metadata.yaml`; empty arrays are valid and are not rendered as empty labels.

Configuration objects reject unknown fields. Hero and Album IDs must be unique, Hero width and height must match the source file, and Project `order` values must be unique even for drafts. Tags must use a configured lowercase kebab-case slug. Post, Project, Album, and series references are checked for missing, duplicate, draft-only, self-referential, or conflicting targets before production filtering. Validation errors identify the affected field and explain the expected correction.

Hero images live in `static/home/sketchbook/`. Add, remove, or reorder entries under `hero.images` in `home.yaml` to control what is displayed:

```yaml
- id: image-id
  src: /home/sketchbook/image.png
  alt: Accessible description
  caption: Image caption
  width: 1280
  height: 720
  enabled: true
```

Keep `width` and `height` aligned with the source image dimensions to avoid layout shifts. Set `enabled: false` to keep an image configured without showing it.

The Playwright media budgets cover the full Hero autoplay transfer (`<= 2.5 MiB`) and Album first load (`<= 2 MiB`). On the current desktop fixture, measured transfers are approximately 1.36 MiB for Home after autoplay and 0.67 MiB for Album before opening the lightbox.

`npm run check:performance` applies the budgets in [`performance-budget.json`](./performance-budget.json) after a production build. It checks every generated image against its role-specific maximum, every critical JS/CSS file and representative route against gzip limits, then compares semantic Vite chunks with [`plans/performance-baseline.json`](./plans/performance-baseline.json). A failure names the exact image, route, semantic chunk, and hashed file; growth of at least 1 KiB is reported even while it remains below the hard limit. Run `node scripts/check-performance-budget.mjs --write-baseline` only after reviewing and accepting an intentional build-size change.

Chromium also checks Home and Album under a fixed 4x CPU / 40 ms latency laboratory profile. The current CI limits use the Core Web Vitals good thresholds: LCP `<= 2.5 s`, CLS `<= 0.1`, and an observed Home interaction latency `<= 200 ms` as an INP-equivalent synthetic check. Laboratory runs are deterministic regression gates, not production claims: Cloudflare Web Analytics RUM at the 75th percentile remains the source of truth for real-user LCP, CLS, and INP across devices, networks, caches, and geographic latency. Synthetic interaction coverage is deliberately narrow and does not replace field INP.

## 🖥️ Interface Behavior

- The primary navigation uses `home` and `blog`. Project detail pages live at `/home/[slug]`; legacy `/work/*` URLs redirect permanently to `/home/*`.
- The left pendant lamp follows the responsive content rail but stops before the main reading column. The pull cord stays pinned to the right edge so it does not cover the header navigation.
- The article table of contents expands on large screens. On mobile, the theme control is an unframed icon separated from navigation by a vertical rule.
- Blog topics are available at `/blog/tags`; article tags link to prerendered topic pages. Article and Project footers expose series, related writing, related projects, and Album works without loading unrelated HTML in the client bundle.
- Footer social icons use 20 px artwork inside 32 px targets. Preview cards support mouse hover and keyboard focus, while touch devices follow the link without opening a card.

## 📈 Privacy-friendly Analytics

Cloudflare Pages Web Analytics is enabled in production and has been collecting since July 30, 2026. Cloudflare injects the single official beacon during deployment; do not add a token or a second beacon script to the repository.

The CSP permits Cloudflare's official script and RUM endpoint. Web Analytics supplies aggregate page views, sources, SPA navigations, and Core Web Vitals without cookies or `localStorage`, but it does not currently support custom interaction events. Album opens, content-flow funnels, and RSS conversions therefore remain deliberately untracked until real traffic justifies a small first-party event system.

The activation checklist, privacy boundary, initial field-data checkpoint, and the July 30-August 13 observation window are documented in [`plans/analytics-baseline.md`](./plans/analytics-baseline.md). The first three-day sample confirms collection is working, but it is too small and includes headless validation traffic, so it is not yet used for feature decisions.

## ✅ Continuous Quality

`npm run verify` now finishes by checking every generated internal anchor and fragment, then probes external article and profile links. Definite `404` and `410` responses fail the build; temporary rate limits, server errors, and network failures are reported as inconclusive so a third-party outage does not make every pull request flaky. Set `LINK_CHECK_STRICT_EXTERNAL=1` when an inconclusive external request should also fail.

Playwright runs the complete interaction, responsive, SEO, performance, and accessibility suite in Chromium. A compact public-flow smoke test also runs in Firefox and WebKit, while axe checks five representative routes against automatically detectable WCAG A/AA rules. `npm run verify` runs the generated-image and gzip build budgets after the production build, so the GitHub Actions check job fails before preview deployment with concrete resource attribution. YAML and Markdown schema behavior is covered by standalone valid and invalid fixture files rather than only the live content collection.

After Wrangler publishes to Cloudflare Pages, the deployment workflow passes the action's exact deployment URL to `npm run check:deployment`. The check verifies Home, Blog, Album, RSS, Sitemap, and a real missing URL before the workflow is considered successful.

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

The repository includes a human-friendly and scriptable Content CLI. It creates drafts with the current schema, reports actionable errors, and never commits, pushes, opens a pull request, or deploys.

```bash
# Interactive draft creation
npm run content -- new post
npm run content -- new project

# Check and preview a draft, including draft-only detail routes
npm run content -- check post/article-title
npm run content -- preview post/article-title --open

# Run the complete publication gate before changing the file
npm run content -- publish post/article-title --dry-run

# Set draft: false locally and run npm run verify
npm run content -- publish post/article-title
```

`new` and `publish` support `--dry-run`. Pass `--no-input` with explicit long flags for CI or editor integration. For JSON without npm's script banner, use `npm run --silent content -- check --json`. The CLI uses exit code `2` for usage errors, `3` for content or publication validation failures, and `1` for other runtime failures. It honors `NO_COLOR` and `--no-color`; prompts are used only when stdin is a TTY.

`preview` binds to `127.0.0.1` by default. Use `--host` only when another device on the local network needs access, and `--open` only when the CLI should open the route in a browser. Press Ctrl-C to stop the server.

### Publication checklist

1. Create a draft with `new post` or `new project`.
2. Add the body and source images. Every Markdown body image needs concise alt text that describes its content or purpose; blank, filename-only, and placeholder alt text fails validation.
3. Run `check`, then inspect the exact route with `preview`.
4. Run `publish <target> --dry-run`.
5. Run `publish <target>` to set `draft: false` and execute `npm run verify`.
6. Push a pull request and review the Cloudflare Pages URL posted by CI on both desktop and mobile.
7. Merge only after the preview smoke check passes; the production workflow performs the same endpoint smoke check after deployment.

Future-dated posts must remain drafts until their publication date in the timezone configured by `site.yaml`. The static site has no scheduled rebuild. Publication failures restore the original draft file, and no command overwrites an existing slug.

### Frontmatter reference

The CLI writes the minimal required frontmatter. Add optional relationships only when the content needs them. A Blog post supports:

```md
---
title: Article title
description: Article summary
date: '2026-07-17'
updated: '2026-07-18'
draft: false
tags:
  - publishing
cover: /images/blog/cover.webp
series:
  slug: site-notes
  title: Site Notes
  order: 4
related:
  - another-article
relatedProjects:
  - project-name
relatedAlbum:
  - album-photo-id
---

Article body.
```

The filename is the lowercase kebab-case slug and becomes `/blog/<slug>`. Use only tags declared in `src/content/config/tags.yaml`. A Project supports:

```md
---
title: Project title
description: Project summary
startYear: 2026
endYear: 2026
status: completed
category: design
locations:
  - stanford
roles:
  - designer
media:
  - fashion-design
cover: /images/projects/cover.webp
order: 10
updated: '2026-07-18'
draft: false
relatedPosts:
  - article-title
relatedAlbum:
  - album-photo-id
---

Project body.
```

Projects are ordered by ascending `order`; the value must be unique even for drafts. The filename becomes `/home/<slug>`. All Post, Project, Album, and series references are validated before production filtering.

Ongoing projects omit `endYear` and use `status: ongoing`; generated display labels remain `2026` or `2026–present`.

Project bodies use the sections that fit the real work—typically Context, Problem and constraints, Role, Key decisions and process, and Outcome. Sections are content guidance rather than required schema fields, so projects can preserve genuine differences instead of filling empty templates.

### Content trust boundary

Velite compiles repository-owned Markdown into HTML during the build, and the two content detail routes render that generated HTML directly. Markdown, YAML, and raw HTML are therefore restricted to trusted repository authors; they must never contain visitor input, an unsanitized external feed, or content copied automatically from a CMS. If external publishing is added later, sanitize its HTML at build time before it reaches the generated content module.

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
4. Checks Home, Blog, Album, RSS, Sitemap, and 404 on the exact deployment URL.
5. Publishes the result to the production branch named `main`.

When the job finishes, the deployment is available at `<project-name>.pages.dev`. For pull requests from branches in this repository, `.github/workflows/check.yml` reuses the verified `build/` artifact, deploys it to the isolated `pr-<number>` Pages branch, runs the deployment smoke check, and creates or updates one preview comment. Later commits replace that branch preview. Fork pull requests never receive Cloudflare secrets and therefore run checks without an automatic deployment.

### 5. Add a custom domain

1. Open **Cloudflare Dashboard → Workers & Pages → your project → Custom domains**.
2. Select **Set up a custom domain** and enter the domain or subdomain.
3. Follow the DNS prompts. Domains already managed by the same Cloudflare account can usually be configured automatically.
4. Update `url` in `src/content/config/site.yaml`; robots, canonical, RSS, and Sitemap URLs are generated from it.
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
| Custom domain shows stale metadata | Update `src/content/config/site.yaml`, rebuild, and allow DNS/cache propagation |
| GitHub deployment does not start | Confirm the push targets `main`, or trigger the workflow manually from the Actions tab |

## 🔄 CI/CD Behavior

- Pull requests and manual runs execute `.github/workflows/check.yml`.
- Pushes to `main` and manual runs execute `.github/workflows/deploy.yml`.
- Both workflows use Node.js 22.13, audit dependencies, and run the same verification used locally.
- Pull requests also run Chromium regressions and Firefox/WebKit smoke tests.
- Same-repository pull requests receive a smoke-tested Cloudflare Pages preview; fork pull requests do not receive deployment credentials.
- Production deployment succeeds only after checks, the static build, upload, and deployed-URL smoke test pass.

## 📄 License

Released under the [MIT License](./LICENSE).
