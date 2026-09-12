# Photo and Mark Input Workflow

## Self-contained assets

- `assets/paper-geometry.png`: neutral single-sheet guide; no cover, stack or previous travel scene. Exclude the legacy canonical-book-shell from generation inputs.
- `assets/seal.png`: exact upper-right canonical seal inserted by the compositor.
- `assets/chongxi_seal.otf`: sole glyph source for the location-seal control.
- `assets/handwriting-latin-glyph-sheet.png`: sole style source for the separate date layer and optional Latin annotation.
- One style reference under `assets/references/` matching the selected style, except `pixel-shell`, which is prompt-defined and uses the supplied photo as its only visual source.
- A borderless Chongxi glyph/map control for the location-seal imagegen call.
- Approved transparent imagegen outputs for the date and location seal.

Inspect the relevant assets before generation. Do not describe them from memory or substitute host-project copies.

## User photo role

A supplied photo is the scene **edit target**.

- **High preservation:** identifiable people, products, artworks, distinctive vehicles, and iconic landmark geometry. Record identity, count, silhouette, proportions, defining colors, pose, and viewpoint.
- **Medium preservation:** ordinary landscapes or streets. Record horizon, building masses, viewpoint, vegetation/water, and landmark relationships.

For `distilled-scene`, preserve the semantic nucleus and two to four identity anchors while retaining no photographic pixels. For `pixel-shell`, additionally record basic composition, perspective, structural direction, visual memory points, atmosphere, and a discard list, then retain no photographic pixels or source-photo panel. For `gathered-memory`, preserve a truthful anchor or recognizable main scene plus declared spatial invariants and source-derived fragments.

## Built-in imagegen routing

Create independent scene/date/seal assets, reusing approved marks when exact text and style match. Generate the base first so scene rejection does not waste marks:

1. **Book-spread call:** user photo when present, a physical-paper geometry reference, and one style reference unless the mode is prompt-defined `pixel-shell`. It outputs a full-page clean two-page paper spread with center binding and genuine transparent alpha outside the pages, but no generated marks, date, or readable text. Handle alpha failures using `production.md`; avoid repeating a demonstrated alpha-only failure for every asset. Require no cover, no dark edge, and no exposed stacked paper leaves. Include stickers only for an explicit `gathered-memory` request.
2. **Date call:** handwriting sheet only. It outputs exact horizontal text on transparency.
3. **Location-seal call:** Chongxi glyph/map control only. It outputs the randomized-shape one-ink seal on transparency.

When all inputs have local paths, use `referenced_image_paths` in these orders:

- Book spread: user photo when present, `assets/paper-geometry.png`, selected style reference. Pixel shell uses the photo, neutral geometry and dedicated recipe.
- Date: `assets/handwriting-latin-glyph-sheet.png`.
- Location seal: rendered Chongxi control PNG.

If a required user photo exists only in conversation, inspect local supporting inputs with `view_image`, then use `num_last_images_to_include` with the smallest count that includes every required image. Never provide both input mechanisms.

Label every image role in the prompt. Say explicitly that references are visual grammar, not pixels, text, stamps, subjects, or layouts to copy.

## No-photo route

Generate from the named place/landmark using the shortest recognizable subject description. Do not invent a different city, landmark, season, or event. Ask only when the location is genuinely ambiguous and changes the scene materially.

## Source truth and recovery

Preserve front/back orientation, gaze and pose as well as person count. A place-only request permits an interpreted viewpoint, not assertions about weather on a historic day. Verify unfamiliar geography before adding landmarks. Retry, reuse and service-error rules live in `production.md`.
