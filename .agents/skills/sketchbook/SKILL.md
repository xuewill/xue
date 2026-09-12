---
name: sketchbook
description: Create dated travel illustrations as consistent 1280x720 paper spreads, with separate handwritten dates and location seals. Supports painted, printed, pixel and photo-derived styles, plus xue homepage registration.
---

# Sketchbook

Make a travel image worth looking at before adding marks. Deliver one thin open sheet with two facing halves and a subtle fold: opaque paper, transparent exterior, no hard cover or page stack. The xue album backing belongs to the website, not the image.

## Inputs and scope

Recover date, place, style and photo from the conversation before asking for missing inputs. Accept `YYYYMMDD` or `YYYY-MM-DD`, validate a real calendar date and store ISO format. Visible date defaults to `YY MM DD`. A user-specified format wins.

Watercolor is the default. Route explicit requests to `oil`, `chinese-ink`, `minimal-zine`, `mono-riso`, `pixel-diary`, `pixel-shell`, `distilled-scene` or `gathered-memory` (also called sticker memory). The last three require a source photo; ask only for missing inputs, unless the user explicitly authorizes a different route.

For **xue**, the user has authorized automatic homepage registration after quality review. Comparison batches and explicit preview-only requests remain candidates until selected. Retain existing assets. Registration is a local configuration change; it does not authorize commit, push or deployment. For other projects, use that project's integration intent.

## Read by stage

- Art direction: [style-system.md](references/style-system.md); for the five editorial/print/photo modes, also [extended-styles.md](references/extended-styles.md). Pixel shell has its own [pixel-shell-style.md](references/pixel-shell-style.md).
- Before prompting: [prompt-compiler.md](references/prompt-compiler.md) and [photo-and-seals.md](references/photo-and-seals.md).
- New marks only: [seal-composition.md](references/seal-composition.md) and [handwriting-system.md](references/handwriting-system.md).
- Production, recovery, exclusions and reproducibility: [production.md](references/production.md).
- Before accepting: [quality-gate.md](references/quality-gate.md).
- Homepage changes only: [project-integration.md](references/project-integration.md).

Read selected files fully, in bounded calls. Do not load every reference and every image for every task.

## Art direction before generation

Write a brief containing: the place's distinguishing geometry, two to four source anchors, one focal event, one quieter area, medium-specific mark-making, palette roles, and what can be simplified. For series, choose distinct compositions from each place rather than reuse one scenic layout. Geographic fidelity and medium fidelity are separate checks.

Inspect the source photo, when present, `assets/paper-geometry.png`, and exactly one relevant style reference. Pixel shell uses its dedicated recipe instead of a style bitmap. The paper image is a neutral geometry diagram; do not use it as an overlay. **Do not pass `canonical-book-shell.png` or a prior travel scene as paper guidance**: the former contains cover/page-stack cues, the latter contaminates subject and composition.

Keep reference roles explicit. Preserve people count, pose, gaze, clothing and relationships from photos; stylistic reduction is not permission to turn front-facing people into back views. For place-only work, verify unfamiliar geography and season from authoritative sources before prompting. A stored date does not establish actual weather, water level or a visible snowline; describe an interpretation, not a reconstruction of that day.

Before calling imagegen, state one visual thesis in a sentence: what the viewer notices first, how the eye crosses the fold, and where it rests. A polished result needs one dominant event, one supporting mass, deliberate detail compression, medium-specific edges and a palette with assigned roles. Reject technically valid but generic scenery, evenly detailed surfaces, repeated postcard compositions, weak focal hierarchy, filter-like styling, and noisy paper texture. For a series, vary viewpoint, focal side, depth pattern and negative-space shape while keeping the physical book system consistent.

## Production flow

1. Compile a compact scene prompt with the spatial and aesthetic priorities above. Generate the **unmarked base first**. Request genuine native alpha outside the thin paper. When the active image tool exposes model/output controls, prefer `gpt-image-2.5-sunburst` at high or xhigh quality with `background=transparent` and PNG output for final work; use the built-in tool normally when those controls are not exposed and never switch to paid API execution without authorization.
2. Immediately run `inspect-native-alpha.mjs` on the saved original. Native-alpha pass goes directly to normalization. RGB, opaque/checkerboard/matte output, or dark alpha fringe goes through the reviewed hard-seed recovery in `production.md`; do not use the old feathered black-matte mask.
3. Inspect the actual base: source truth, visual thesis, focal hierarchy, medium construction, single clean paper edge and clear mark reserves. Fix the largest visual defect before spending on new marks. A dimensionally correct but generic or muddy image is not a candidate.
4. Reuse an already approved transparent date with the exact same text. Reuse a location seal only if label, script, shape and map still match. For new seals, render Chongxi glyph control, sample a count-compatible shape once, then generate and inspect the seal at full size and ~80px. Date generation uses only the bundled handwriting sheet.
5. Normalize the accepted native-alpha base or recovered hard-seed base with `normalize-book-spread.mjs`; then run `validate-spread.mjs`. The validator checks geometry, interior opacity and dark semitransparent edge contamination. Do not stretch artwork or treat pixel checks as aesthetic approval.
6. Record protected face, landmark and sticker rectangles. Composite using `composite-page-marks.mjs --exclude-regions regions.json --seed ENTRY_ID --dry-run`, then the same command without dry-run. All marks must pass local stroke contrast. The output includes a report with seed, actual bounds and measurements.
7. Review full size, ~240px, and against light/dark backings. If fixed marks cover scenery, edit the **unmarked base** and recompose the same approved marks. Never send the marked final back to imagegen.
8. Save the PNG and its small production record, register when authorized, run required checks and verify the actual homepage carousel.

## Retry and service boundaries

Follow [production.md](references/production.md): one targeted visual retry per asset; alpha-only retries are optional after a demonstrated baked-alpha failure in the same session. Reuse good outputs. A quota error ends image calls until reset; report the blocker and preserve work. Do not silently switch to a paid API, launch duplicate hanging jobs or claim a candidate was accepted because generation returned successfully.

## Delivery

Show the final image with its file link, date/place/style, registration status and concise validation. Put exact prompts, source roles, geographic sources, seal map/shape, seed, exclusions and measured results in the production record rather than overwhelming the reply with coordinates. Disclose material source deviations or unresolved defects. Preserve prior files unless replacement was requested.
