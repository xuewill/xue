# Photo and Mark Input Workflow

## Self-contained assets

- `assets/canonical-book-shell.png`: alignment-only guide matching the fixed homepage background. It must never appear in generated output.
- `assets/seal.png`: exact upper-right canonical seal inserted by the compositor.
- `assets/chongxi_seal.otf`: sole glyph source for the location-seal control.
- `assets/handwriting-latin-glyph-sheet.png`: sole style source for the separate date layer and optional Latin annotation.
- One shell-free reference under `assets/references/` matching the selected style.
- A borderless Chongxi glyph/map control for the location-seal imagegen call.
- Approved transparent imagegen outputs for the date and location seal.

Inspect the relevant assets before generation. Do not describe them from memory or substitute host-project copies.

## User photo role

A supplied photo is the scene **edit target**.

- **High preservation:** identifiable people, products, artworks, distinctive vehicles, and iconic landmark geometry. Record identity, count, silhouette, proportions, defining colors, pose, and viewpoint.
- **Medium preservation:** ordinary landscapes or streets. Record horizon, building masses, viewpoint, vegetation/water, and landmark relationships.

For `distilled-scene`, preserve the semantic nucleus and two to four identity anchors while retaining no photographic pixels. For `gathered-memory`, preserve a truthful anchor or recognizable main scene plus declared spatial invariants and source-derived fragments.

## Built-in imagegen routing

Use three independent calls:

1. **Artwork call:** user photo when present, canonical shell as alignment-only guide, and one shell-free style reference. It outputs no shell, marks, date, text, paper, or background.
2. **Date call:** handwriting sheet only. It outputs exact horizontal text on transparency.
3. **Location-seal call:** Chongxi glyph/map control only. It outputs the randomized-shape one-ink seal on transparency.

When all inputs have local paths, use `referenced_image_paths` in these orders:

- Artwork: user photo when present, `assets/canonical-book-shell.png`, selected style reference.
- Date: `assets/handwriting-latin-glyph-sheet.png`.
- Location seal: rendered Chongxi control PNG.

If a required user photo exists only in conversation, inspect local supporting inputs with `view_image`, then use `num_last_images_to_include` with the smallest count that includes every required image. Never provide both input mechanisms.

Label every image role in the prompt. Say explicitly that the shell is alignment-only and references are visual grammar, not pixels to copy.

## No-photo route

Generate from the named place/landmark using the shortest recognizable subject description. Do not invent a different city, landmark, season, or event. Ask only when the location is genuinely ambiguous and changes the scene materially.

## Retry boundary

- Retry location seal once for wrong label, Chongxi skeleton, order, shape, or transparency.
- Retry date once for wrong text or transparency.
- Retry artwork once for scene/photo drift, opaque background, or any book/paper geometry.

If a retry still fails, show the better result with the limitation and do not register it.
