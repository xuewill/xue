# Quality Gate

Inspect the full-book base spread, date layer, location seal, and final composited spread. Prompt compliance is not evidence. Visual acceptance is separate from `validate-spread.mjs` pixel geometry.

## Full-book checks

- Exactly `1280x720`, landscape, RGBA, with genuine transparency outside the book silhouette.
- The normalized open-book silhouette is exactly `1200x680+40+20`; exterior margin is transparent, not a tabletop. Reject any different trim bounds because they cause visible size jumps in the carousel.
- Four outer corners plus the upper and lower center-gutter notches are genuinely transparent outside the canonical silhouette. Reject white, gray, checkerboard, or matte halos that become visible over a dark album backing.
- `inspect-native-alpha.mjs` passes before normalization, or the production record names the failed native-alpha metric and the reviewed hard-seed recovery. No silent matte cleanup.
- `validate-spread.mjs` reports `pixel-geometry-and-edge-pass`; dark semitransparent edge pixels stay below the allowed contamination fraction and mean edge luminance remains paper-like. Reject a one-pixel dark fringe visible on a light backing even when geometry passes.
- Both clean paper pages and a central binding or gutter are visibly part of the image. Do not render a hard cover, dark cover edge, or exterior page stack.
- Reject layered paper leaves, repeated page signatures, dark rims, hardback outlines, or any exposed stacked-paper treatment along the far-left outer edge.
- Prefer native alpha; follow `production.md` for hard-seed fallback masks and proportional crops. A passing trim box does not prove an opaque generated outline was removed.
- Both halves participate in the scene; use medium-specific focal/quiet-space guidance without requiring uniform density.
- No seal, date, handwriting, signature, caption, logo, QR code, or invented readable text before deterministic composition.
- Place/landmark remains recognizable and derives from the supplied photo or named location.
- The illustration keeps deliberate local quiet zones and remains legible around 240px wide.
- The image has one clear visual thesis, focal hierarchy and medium-specific construction; reject generic postcard composition, evenly sharp detail, repeated series layouts and filter-only style changes.
- Unless `gathered-memory` was selected, reject stickers, pasted fragments, luggage tags, route badges, collage panels, or lifted paper pieces.

## Final-spread checks

- Still exactly `1280x720` RGBA with transparent exterior canvas.
- Upper-right pixels come directly from `assets/seal.png` via `scripts/composite-page-marks.mjs`.
- Visible date appears once as a horizontal cobalt-blue handwritten line generated from the bundled glyph-sheet reference, matches the stored ISO date, and was inserted from a separate approved transparent date layer.
- Approved imagegen location stamp appears once at a recorded candidate anchor with correct label, Chongxi-derived skeleton, declared composition, sampled shape, chosen ink, and measured background contrast.
- No extra seals, dates, signatures, text, borders, or opaque backplates.

## Physical-spread checks

- Date and seals sit on page surfaces without crossing outer page edges. The location seal uses one recorded contrast-aware random placement and must remain obvious at thumbnail size.
- Center binding remains readable and no important face, landmark, or sticker edge is bisected by it.
- All marks pass stroke-level contrast and exclusions protect faces, landmarks and stickers. Fixed reserves remain clear. Contrast does not excuse covering a focal subject.
- There is exactly one book, one binding, and one restrained outer shadow.
- A sticker-memory spread uses three to five tactile die-cut stickers with visible paper borders and subtle lifted-edge shadows. It does not use loose photo rectangles or a generic sticker catalog.

## Medium checks

- **Watercolor:** loose oversized washes, broad flowing shapes, restrained detail, pigment bleeding, wet-on-wet texture, and visible warm journal paper.
- **Oil:** impasto, broken color, scumbling, simplified forms, no canvas rectangle or photorealistic gloss.
- **Chinese ink:** layered ink values, brush rhythm, bleeding/dry-brush contrast, quiet paper areas, and no calligraphy.
- **Pixel shell:** source photo is absent from output; structure and atmosphere remain recognizable through a source-appropriate density of visibly distinct matte shell/mineral near-square modules. The cluster occupies `30%–45%`, progressively disperses, and leaves large balanced warm-paper negative space. Reject dense micro-mosaic, undifferentiated tiny noise, game pixels, glossy pearl, plastic tiles, retained photo pixels, split layouts, or generated editorial text. Do not enforce a numeric module limit.
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
- `distilled-scene` and `pixel-shell` retain no photographic pixels; `gathered-memory` keeps its truthful anchor and source-derived fragments.

## Registration checks

- The page source must exist under `static/home/sketchbook/`, have a unique id/path and real `YYYY-MM-DD` date, be sorted by date then id, and trim to exactly `1200x680+40+20`.
- Dimensions match the actual file; `enabled` is true unless requested otherwise.
- `npm run check` and `git diff --check` pass after integration.

Follow bounded retries in `production.md`. After a failed visual retry, keep a candidate and report the defect. Source identity and medium construction must pass: front-facing people becoming back views or a zine becoming a tinted full landscape are failures unless specifically requested.
