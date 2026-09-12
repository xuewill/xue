# Homepage Sketchbook Style System

## Full book, full-page artwork

The output is one thin paper spread, with a continuous scene or deliberate relation across two halves. Use `assets/paper-geometry.png` for geometry. The legacy `canonical-book-shell.png` contains cover and page-stack cues and must not be passed to generation.

Inspect the neutral paper geometry. Inspect exactly one bundled style image except for `pixel-shell`, which uses the supplied photo plus its prompt-defined grammar:

| Style id | Reference |
| --- | --- |
| `watercolor` | `assets/references/watercolor-reference.png` |
| `oil` | `assets/references/oil-reference.png` |
| `chinese-ink` | `assets/references/ink-reference.png` |
| `minimal-zine` | `assets/references/minimal-zine-reference.png` |
| `mono-riso` | `assets/references/mono-riso-reference.png` |
| `pixel-diary` | `assets/references/pixel-diary-reference.png` |
| `pixel-shell` | prompt-defined; supplied photo is the only visual source, read `references/pixel-shell-style.md` |
| `distilled-scene` | `assets/references/distilled-scene-reference.png` |
| `gathered-memory` | `assets/references/gathered-memory-reference.png` |

- Canvas is exactly `1280x720`, RGBA. Every pixel outside the book silhouette is genuinely transparent; no tabletop, gray-blue surround, or opaque rectangular backdrop remains.
- After normalization, every open book has the exact visible bounds `1200x680+40+20` inside the `1280x720` canvas. This fixed silhouette prevents size jumps when the homepage turns pages.
- Both page surfaces and their center sewn or folded binding are visible. The outer silhouette is one clean warm-paper edge, not a cover. Do not show dark or hard cover edges, layered exposed paper leaves, fore-edge stripes, or page signatures.
- Scene treatment spans both halves. Focal density depends on the medium: active paper, sky and mist count as deliberate composition. Do not force 80% pigment coverage or add detail to fill an arbitrary quota.
- The bundled red seal, blue date, and Chongxi-guided location seal remain independently generated then composited on top of the completed book.
- Do not create a small book floating in a large blank canvas, an isolated transparent cutout, a blank right page, a closed book, a loose page, a polished product mockup, a generic framed poster, a hard cover, a dark border, an exposed stacked-paper fore edge, or a sticker collage unless `gathered-memory` was selected.

## Mark placement

- Upper-right quiet zone: approximately `x=990..1125`, `y=44..195`.
- The exact bundled red seal is placed at upper-right by `composite-page-marks.mjs`.
- The exact visible date is generated separately from the handwriting sheet and placed below it.
- The compositor samples a grid and seeded jitter in left-edge, lower-right, and upper-inner-right zones, jointly checking each position and palette ink. Supply protected source/face/sticker rectangles as `--exclude-regions`.
- Randomness is confined to qualified choices. At least 90% of actual mark stroke pixels must meet 3.2:1 contrast. Fixed marks and explicit overrides are checked too; see `production.md`.

Keep the fixed upper-right zone quiet. When composition allows, avoid putting faces or the primary landmark in every outer-page candidate zone so the compositor can find at least one calm, high-contrast location-seal placement.

## Shared art direction

- Warm, tactile paper belongs inside the finished book image; it must visibly support the painting and not read as an empty template.
- Keep the place recognizable at carousel size while giving both pages meaningful pictorial work.
- Traditional, minimal, riso, pixel-diary, pixel-shell, and distilled-scene styles use no stickers, pasted fragments, tags, or badge-like accents. Only `gathered-memory` may use three to five physical sticker accents.
- Avoid long text, QR codes, brands, extra handwriting, extra seals, decorative clutter, blank-page product mockups, and glossy UI-like layers.

## Traditional media

### Watercolor

> Abstract watercolor wash of a [subject] across a visible two-page bound travel journal, loose oversized brushstrokes, broad flowing color shapes, minimal detail, soft pigment bleeding, expressive wet-on-wet texture, simplified forms, airy composition, no linework, no outlines.

Pigment lives on warm visible paper and can cross the binding. Keep both pages active and leave only purposeful small breathing zones.

### Oil

- Plein-air oil study made from isolated pigment shapes.
- Visible impasto, broken color, dry-brush scumbling, palette-knife accents, and confident blocky forms.
- No opaque canvas, varnish, frame, gallery wall, photorealistic gloss, or 3D paint mockup.

### Chinese ink

- Ink-wash and sparse mineral-pigment marks spread across a visible bound book.
- Expressive brush rhythm, pale-to-deep ink, wet bleeding, dry-brush texture, physical paper breathing room, and atmospheric depth.
- No calligraphy, poem, signature, or extra artist seal.

## Extended styles

Read `extended-styles.md` for detailed construction. Their focal event, page coverage, compression, and color systems vary; the full-book contract and mark reserves do not.

## Safe variation

- Subject placement: right-dominant, panoramic, or a restrained left-fragment/right-study relation.
- Viewpoint: eye-level, elevated, street approach, or architectural three-quarter view.
- Supporting forms: none, one source-derived visual echo, or one restrained color swatch. Ticket-like and pasted forms belong only to `gathered-memory`.
- Location seal: use the sampled shape and the count-dependent right-starting layout from `seal-composition.md`.

All assets are relative to this skill. The host project's stationary album backdrop is an interface-only adapter, never a generation dependency or part of the output image.

The exact prompt set used for the bundled references is recorded in `reference-art-prompts.md` for reproducibility.

## Composition and medium acceptance

Before prompting, choose one focal event, one supporting mass and a calmer counterweight. Plan where the eye enters, crosses the fold and rests. Keep strongest contrast and sharpest edges near the focal event; compress repeated leaves, waves and cliff cracks elsewhere. Paper texture should support brushwork, not cover every surface with the same noisy filter.

For place-only work, establish two to four geographically distinctive anchors from reliable sources before generation. Distinguish verified features from invented vantage points or weather. Do not transplant dramatic snow peaks into every highland lake, pine silhouettes onto every mountain, or a village into every valley. A dated illustration is not documentary evidence of that day's conditions.

For portraits, keep orientation, gaze, count, pose and clothing relationships unless the user requests a change. Turning a pair around is not simplification.

In comparisons, preserve identity anchors and marks while changing medium construction:
- Ink: variation in ink load, broken dry strokes, lost edges and restrained pigment. Reject a generic watercolor wash with dark outlines.
- Watercolor: transparent washes, blooms, white-paper light. Reject evenly sharp photo detail and excessive embossed paper.
- Oil: directional strokes and broken pigment. Reject watercolor with a uniform raised-paint texture.
- Minimal zine: one intentional printed relation and large active paper. A full landscape with a blue filter fails.
- Riso: assigned plate roles, overprint and halftone. Reduced saturation alone is insufficient.
- Pixel diary: visible fine grid and density changes, distinct from round-dot riso.
- Distilled scene: structural reduction, a specific metaphor and fewer descriptive forms, preserving source relationships.
- Gathered memory: spatial anchor plus asymmetrically grouped supporting stickers with different scales. Avoid a four-corner specimen catalog. Protect stickers before placing seals.
- Pixel shell: follow the material/dispersal recipe; avoid dense micro-mosaic.

Judge silhouette and hierarchy at ~240px, media texture at full size. If variants differ only in color, revisit construction.
