# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

Node.js 22.13+ is required. `npm ci` runs `prepare` (`svelte-kit sync && velite`), which generates the content modules everything else depends on.

| Task | Command |
| --- | --- |
| Dev server | `npm run dev` |
| Full gate (what CI runs) | `npm run verify` |
| Unit tests | `npm test` (runs `velite` first, then `vitest run`) |
| Single unit test | `npx vitest run tests/unit/xml.test.ts` |
| Single test by name | `npx vitest run -t 'partial test name'` |
| E2E (all projects) | `npm run test:e2e` |
| Single E2E spec | `npx playwright test tests/e2e/toc.spec.ts --project=chromium` |
| Type/diagnostics | `npm run check` |

`npm run verify` = lint → unit tests → content+type check → build → performance budgets → draft-leakage check → link check. Run it before proposing a change is complete.

Two prerequisites that cause confusing failures if skipped:

- Any command touching `src/lib/generated/content/` needs Velite to have run. If a test fails on a missing generated import, run `npx velite`.
- Playwright's `webServer` runs `npm run preview`, which serves `build/`. Run `npm run build` before an E2E run against fresh code.

## Architecture

### Content is compiled, not read at runtime

This is a fully pre-rendered static site — no Node server, database, or SSR runtime in production. The data flow is one-directional:

```
src/content/**  (Markdown + YAML — the only hand-edited source)
      │  velite.config.ts   schemas, relations, sorting, draft filtering, Sharp media, Shiki
      ▼
src/lib/generated/content/  (gitignored)  +  static/generated/  (gitignored)
      │  src/lib/server/content.ts   joins, reverse relations, summaries
      ▼
src/routes/**  prerendered at build → build/
```

`src/routes/+layout.ts` sets `prerender = true` globally. Dynamic routes export an `EntryGenerator` (`entries`) backed by `get*Entries()` in `src/lib/server/content.ts`, so every page is enumerated at build time. `svelte.config.js` sets `prerender.handleHttpError: 'fail'` and adapter `strict: true` — a broken internal link fails the build rather than shipping.

Never hand-edit `src/lib/generated/content/`, `static/generated/`, or `.velite/`. They are regenerated and gitignored. The one generated file that *is* tracked is `static/site.webmanifest`, written by Velite's `complete` hook from `site.yaml`; CI runs `npm run validate:generated` to reject drift.

### velite.config.ts doubles as the validation library

At ~1300 lines it is the largest and most important file in the repo. Beyond defining the seven collections (`site`, `home`, `album`, `tagConfig`, `contentMetadata`, `posts`, `projects`), it *exports* its schemas and pure helpers (`prepareCollections`, `validateContentRelations`, `validateContentMetadata`, `isFutureCalendarDate`, `findDuplicateValues`, …) which `tests/unit/velite-content.test.ts` imports directly. When changing validation rules, update the exported helper — the unit tests exercise it in isolation, not through a build.

Schemas are `.strict()`: unknown frontmatter or YAML fields are errors. Validation happens in the `prepare` hook *before* draft filtering, so drafts are checked too. Rules enforced there:

- Published posts cannot carry a future date in `site.yaml`'s timezone — they must stay `draft: true`. The static site has no scheduled rebuild.
- Project `order` must be unique across all projects, drafts included.
- Tags must be slugs declared in `tags.yaml`; locations/roles/media must be slugs from `metadata.yaml`.
- Cross-references (post ↔ project ↔ album, series) are checked for missing, duplicate, self-referential, and draft-only targets.

Relations are declared on one side but resolved bidirectionally in `src/lib/server/content.ts` — a project listing `relatedPosts` also appears in that post's related projects. Don't add both directions in frontmatter; that trips the duplicate check.

### A second validation layer for media

`scripts/content-validation.mjs` (invoked by `npm run validate:content` and inside `npm run build`) checks that every image path referenced from Markdown and YAML exists under `static/`, and that body-image alt text is meaningful — blank, filename-only, and placeholder alt text fail.

Sharp generates content-hashed WebP variants into `static/generated/media/<role>/` per the `responsiveImageSpecs` roles (`hero`, `album-thumbnail`, `album-lightbox`, `cover`, `logo`, `portrait`, `content`), plus 1200×630 OG PNGs. The hash covers the encoding recipe including `mediaPipelineVersion` — bump that constant when the encoding logic changes, otherwise stale artifacts are reused.

### Performance budgets are enforced, with a committed baseline

`npm run check:performance` applies `performance-budget.json` after a build: per-role image byte caps, per-resource and per-route gzip caps for JS/CSS, then a diff of semantic Vite chunks against `plans/performance-baseline.json`. Growth ≥1 KiB is reported even under the hard limit. Only run `node scripts/check-performance-budget.mjs --write-baseline` after deliberately accepting a size increase. Playwright additionally gates Home and Album under a fixed 4× CPU / 40 ms laboratory profile (LCP ≤ 2.5 s, CLS ≤ 0.1, interaction ≤ 200 ms).

### Styling and components

Framework-neutral design tokens come from `@webaseui/core/theme.css`, imported by `src/app.css`. The site adds its local fonts and page-specific editorial styles on top of that paper/ink theme; there is no CSS framework.

The prerendered `/design-system` route consumes the published `@webaseui/svelte` package. Its public components and Props types use the `WeBase*` prefix, and its public design tokens use `--webase-*`. Make reusable component changes in the separate `WeOpen/WeBaseUI` repository, publish a version, then update this site's exact registry dependency.

Theme state lives in `src/lib/theme.ts`: `data-theme` on `<html>` is the source of truth, mirrored into a Svelte store via `MutationObserver` and synced across tabs through the `storage` event.

## Constraints to respect

**Content trust boundary.** The two detail routes render Velite-compiled HTML with `{@html}`, and ESLint disables `svelte/no-at-html-tags` only for `src/routes/blog/*/+page.svelte` and `src/routes/home/*/+page.svelte`. This is safe *only* because Markdown is repository-owned. Never route visitor input, an external feed, or CMS content into that path without build-time sanitization.

**CSP is hash-mode.** `svelte.config.js` allows only `self` plus Cloudflare Insights for scripts. Inline scripts that SvelteKit doesn't hash, and new third-party origins, will be blocked — update the directives deliberately.

**Analytics beacon is injected by Cloudflare at deploy time.** Do not add a token or a second beacon script to the repo.

**Product direction** (from `plans/development-roadmap.md`, written in Chinese): keep the editorial paper/ink identity rather than a generic card-based product site; keep the Hero autoplay sequence intact through any performance work; honor `prefers-reduced-motion` by skipping the page-turn physics while preserving content; stay static-first; and treat Markdown/YAML as the only human-maintained source.

## Publishing

Use the CLI rather than hand-creating files — it writes current-schema frontmatter and never commits, pushes, or deploys:

```bash
npm run content -- new post
npm run content -- check post/article-title
npm run content -- preview post/article-title --open
npm run content -- publish post/article-title --dry-run
npm run content -- publish post/article-title
```

The filename is the slug (lowercase kebab-case): posts become `/blog/<slug>`, projects `/home/<slug>`. Legacy `/work/*` redirects to `/home/*`. `publish` flips `draft: false` and runs `npm run verify`, restoring the original file on failure. Exit codes: `2` usage, `3` content/publication validation, `1` other runtime failure. Pass `--no-input` with explicit flags for non-interactive use; `npm run --silent content -- check --json` avoids npm's banner.

The README documents the full frontmatter reference, Cloudflare Pages setup, and CI behavior in detail.
