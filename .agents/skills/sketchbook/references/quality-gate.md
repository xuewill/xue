# Quality Gate

Inspect the artwork layer, date layer, location seal, final composited layer, and shell preview. Prompt compliance is not evidence.

## Artwork-layer checks

- Exactly `1280x720`, landscape, RGBA.
- Genuine transparency; the asset is not fully opaque and contains no white/beige/gray page rectangle.
- All nontransparent pixels stay inside `x=144..1136`, `y=44..664`.
- No book cover, page edge, exposed paper layer, spine, gutter line, binding, contact shadow, tabletop, frame, or shell fragment.
- No seal, date, handwriting, signature, caption, logo, QR code, or invented readable text before deterministic composition.
- Place/landmark remains recognizable and derives from the supplied photo or named location.
- Artwork has a deliberate release zone and remains legible around 240px wide.

## Final-layer checks

- Still exactly `1280x720` RGBA and shell-free.
- Upper-right pixels come directly from `assets/seal.png` via `scripts/composite-page-marks.mjs`.
- Visible date appears once as a horizontal cobalt-blue handwritten line generated from the bundled glyph-sheet reference, matches the stored ISO date, and was inserted from a separate approved transparent date layer.
- Approved imagegen location stamp appears once at the lower-left with correct label, Chongxi-derived skeleton, declared composition, sampled shape, and preserved positions.
- No extra seals, dates, signatures, text, borders, or opaque backplates.

## Fixed-shell preview checks

Composite the final layer over `assets/canonical-book-shell.png` only for inspection:

- Shell stays fully visible and unchanged beneath the art.
- Art, date, and marks sit on page surfaces without crossing the outer page edges.
- Center gutter remains readable and no important anchor is bisected by it.
- Upper-right and lower-left marks have adequate quiet space.
- There is exactly one shell. The preview contains no nested page edge, second spine, or double shadow.
- At page turn, only artwork layers animate; the shell remains visually stationary.

Never save or register the flattened preview.

## Medium checks

- **Watercolor:** loose oversized washes, broad flowing shapes, restrained detail, pigment bleeding, wet-on-wet texture, no linework or opaque paper.
- **Oil:** impasto, broken color, scumbling, simplified forms, no canvas rectangle or photorealistic gloss.
- **Chinese ink:** layered ink values, brush rhythm, bleeding/dry-brush contrast, transparent release space, no calligraphy or paper rectangle.
- **Extended styles:** apply the shared and style-specific checks in `extended-styles.md`; a named style must be visible in construction.

## Location-seal checks

- Report exact label, character count, layout, shape, position map, reading order, Chongxi glyph string, and substitutions.
- `render-location-seal.mjs --style glyphs-only` supplied the control reference; imagegen created the final stamp.
- Shape metadata came from a fresh `choose-seal-shape.mjs` run.
- Actual positions match the map. Four-character 回文 reads `右上 → 左上 → 左下 → 右下`.
- The result remains legible around 80px and has no wrong, missing, repeated, mirrored, modern-font, or pseudo-Chinese glyph.

## Photo checks

- Actual user image was passed to generation.
- Identity, object, landmark, horizon, or spatial invariants match the declared preservation level.
- `distilled-scene` retains no photographic pixels; `gathered-memory` keeps its truthful anchor and source-derived fragments.

## Registration checks

- Shell exists at `static/home/sketchbook/book-shell.png` but is not listed as a page.
- Page source exists under `static/home/sketchbook/` and passes the shell-free safe-area validator.
- `home.yaml` contains a unique id/path and real `YYYY-MM-DD` date.
- Generated pages are ascending by date, then id.
- Dimensions match the actual file; `enabled` is true unless requested otherwise.
- `npm run check` and `git diff --check` pass.

Retry imagegen once for a central visual failure. If the retry fails, return the better preview with the limitation and do not register it.
