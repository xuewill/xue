# Homepage Sketchbook Style System

## Fixed shell, variable artwork

The homepage owns one fixed shell: `static/home/sketchbook/book-shell.png`, copied from `assets/canonical-book-shell.png`. The component renders it once beneath every page. Generated images and bundled style references are transparent artwork layers only. `assets/layout.json` is the machine-readable source of truth for canvas, shell, safe-area, runtime-path, and mark-placement geometry.

Always inspect the canonical shell as an **alignment guide**, then exactly one shell-free style reference:

| Style id | Reference |
| --- | --- |
| `watercolor` | `assets/references/watercolor-reference.png` |
| `oil` | `assets/references/oil-reference.png` |
| `chinese-ink` | `assets/references/ink-reference.png` |
| `minimal-zine` | `assets/references/minimal-zine-reference.png` |
| `mono-riso` | `assets/references/mono-riso-reference.png` |
| `pixel-diary` | `assets/references/pixel-diary-reference.png` |
| `distilled-scene` | `assets/references/distilled-scene-reference.png` |
| `gathered-memory` | `assets/references/gathered-memory-reference.png` |

- Canvas is exactly `1280x720`, RGBA.
- Artwork, date, and seals stay inside safe area `x=144..1136`, `y=44..664`.
- The outer canvas and all negative space between marks are genuinely transparent.
- Never include paper, warm page color, cover, binding, center gutter, page edges, exposed layers, contact shadow, tabletop, or any other book geometry in an artwork layer or style reference.
- Judge alignment by previewing the layer over `assets/canonical-book-shell.png`; never flatten that preview into the saved layer.
- Artwork may cross the future center gutter visually, but important faces, type, or landmark anchors should not sit directly on `x=640`.
- The canonical upper seal, date, and location seal are separate transparent inputs composited after the art is generated.

## Mark reserves

- Upper-right quiet zone: approximately `x=990..1125`, `y=44..195`.
- Lower-left quiet zone: approximately `x=150..300`, `y=490..645`.
- The exact bundled red seal is placed at upper-right by `composite-page-marks.mjs`.
- The exact visible date is generated separately from the handwriting sheet and placed below it.
- The approved imagegen location seal is placed at lower-left.

These zones may contain transparent texture wisps, but no focal landmark, face, high-contrast edge, or readable text.

## Shared art direction

- The fixed shell supplies warm tactile paper; page art must not paint an opaque substrate underneath itself.
- Keep the place recognizable at carousel size while preserving transparent release zones.
- Traditional and minimal styles use at most three supporting fragments; `gathered-memory` may use three to five.
- Avoid long text, QR codes, brands, extra handwriting, extra seals, decorative clutter, opaque backplates, and glossy UI-like layers.

## Traditional media

### Watercolor

> Abstract watercolor wash of a [subject], loose oversized brushstrokes, broad flowing color shapes, minimal detail, soft pigment bleeding, expressive wet-on-wet texture, simplified forms, airy composition, no linework, no outlines, transparent background.

Pigment and subject forms are isolated on transparency. Paper white comes from the fixed shell beneath the layer.

### Oil

- Plein-air oil study made from isolated pigment shapes.
- Visible impasto, broken color, dry-brush scumbling, palette-knife accents, and confident blocky forms.
- No opaque canvas, varnish, frame, gallery wall, photorealistic gloss, or 3D paint mockup.

### Chinese ink

- Isolated ink-wash and sparse mineral-pigment marks.
- Expressive brush rhythm, pale-to-deep ink, wet bleeding, dry-brush texture, transparent breathing room, atmospheric depth.
- No xuan-paper rectangle, calligraphy, poem, signature, or extra artist seal.

## Extended styles

Read `extended-styles.md` for detailed construction. Their focal event, release zone, compression, and color systems vary; the shell-free artifact contract and mark reserves do not.

## Safe variation

- Subject placement: right-dominant, panoramic, or a restrained left-fragment/right-study relation.
- Viewpoint: eye-level, elevated, street approach, or architectural three-quarter view.
- Supporting forms: none, one source-derived fragment, one abstract ticket-like shape without readable data, or one restrained color swatch.
- Location seal: use the sampled shape and the count-dependent right-starting layout from `seal-composition.md`.

All assets are relative to this skill. The host project's shell is an output adapter only, never a generation dependency.

The exact prompt set used for the bundled references is recorded in `reference-art-prompts.md` for reproducibility.
