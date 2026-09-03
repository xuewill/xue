# Prompt Compiler

Generate three independent transparent assets: artwork, handwritten date, and location seal. The deterministic compositor adds those two generated marks plus the exact canonical seal. The fixed book shell is never part of a generated page PNG.

## 1. Chongxi control and location seal

Render the glyph-and-position control:

```bash
node .agents/skills/sketchbook/scripts/render-location-seal.mjs \
  --label "[USER_VISIBLE_LABEL]" \
  --glyphs "[CHONGXI_GLYPHS]" \
  --layout "[auto|huiwen|conventional|1+2|2+1|2+3|3+2]" \
  --style "glyphs-only" \
  --ink "[#HEX]" \
  --output "[GLYPH_REFERENCE_PNG]"
```

Use `--glyphs` for an approved traditional form when needed, such as `橘子洲頭` for the user-visible `橘子洲头`. Inspect the returned map.

Sample a shape once per new location seal:

```bash
node .agents/skills/sketchbook/scripts/choose-seal-shape.mjs --count "[CHARACTER_COUNT]"
```

Location-seal imagegen prompt:

```text
Use case: logo-brand
Asset type: transparent Chinese travel seal insert
Input images: Image 1 is the mandatory Chongxi Small Seal glyph-and-position control, not a finished seal.

Create one hand-carved Chinese location seal for "[STAMP_LABEL]" from exact glyph string "[STAMP_GLYPHS]". Mandatory outer shape: [RANDOM_SHAPE_PROMPT]. Preserve Image 1's glyph skeletons and absolute positions with high fidelity. Required map: [POSITION_MAP]. Required reading path: [READ_ORDER]. Keep the right-starting order inside the sampled shape. Do not substitute another Chinese script or invent glyphs.

Use exactly one ink with hand-stamped uneven pressure, absorption, worn edges, small ink-starvation gaps, and balanced 分朱布白. Keep every glyph legible near 80px. Output only the isolated seal on genuine transparency with padding. No paper, mockup, date, Latin text, translation, symbol, watermark, or duplicate glyph.
```

Retry once with mismatched positions or glyphs named first. A beautiful but incorrect seal fails.

## 2. Shell-free artwork prompt

Write four compact paragraphs in this order. For extended styles, use `extended-styles.md` for paragraph 2.

### Paragraph 1: canvas and alignment

```text
Horizontal 16:9 transparent artwork layer intended for a 1280x720 homepage Sketchbook. Image [SHELL] is alignment-only: use its centered open pages to understand placement, but reproduce none of its pixels. Keep artwork within x=144..1136 and y=44..664, with a natural pause around future gutter x=640. Output no paper, page color, cover, binding, spine, gutter line, page edge, exposed layer, contact shadow, tabletop, or book geometry.
```

### Paragraph 2: scene and medium

Place-only route:

```text
Depict [SUBJECT] at [PLACE] as a recognizable [MEDIUM] artwork layer. [MEDIUM_RECIPE] Use [LAYOUT] and keep the place readable at carousel size without becoming a travel advertisement.
```

Photo route:

```text
Use Image [N] as the scene edit target with [PRESERVATION] preservation. Keep [VISIBLE_INVARIANTS] recognizable; change only medium, composition, and nonessential atmosphere. Recompose it as a [MEDIUM] artwork layer with no retained background rectangle. [MEDIUM_RECIPE]
```

Traditional recipes:

- **Watercolor:** `Abstract watercolor wash of [SUBJECT], loose oversized brushstrokes, broad flowing color shapes, minimal detail, soft pigment bleeding, expressive wet-on-wet texture, simplified forms, airy composition, no linework, no outlines.`
- **Oil:** `Plein-air oil study of [SUBJECT], tactile impasto, broken color, broad blocky brushwork, dry-brush scumbling, a few palette-knife accents, simplified but recognizable forms.`
- **Chinese ink:** `Chinese ink-wash study of [SUBJECT], calligraphic brush rhythm, layered pale/deep ink, controlled bleeding, dry-brush texture, atmospheric depth, simplified recognizable forms, no Western photorealistic shading.`

### Paragraph 3: quiet mark zones

```text
Keep upper-right x=990..1125,y=44..195 and lower-left x=150..300,y=490..645 visually quiet for later marks. Do not draw, imitate, ghost, or suggest any seal, stamp, date, handwriting, caption, border, or readable text.
```

### Paragraph 4: output and avoids

```text
Export only isolated painted, drawn, printed, photographed, or collaged forms on a genuinely transparent background. Transparent negative space must remain visible between and around forms. Avoid opaque backplates, white/beige page rectangles, book or notebook mockups, closed books, loose paper sheets, UI, glossy 3D, frames, unrelated landmarks, invented text, brands, QR codes, watermarks, and decorative signatures.
```

The canonical shell may be passed as a layout reference, but label it alignment-only. The selected style reference must already be shell-free.

## 3. Handwritten date prompt

Pass only `assets/handwriting-latin-glyph-sheet.png`:

```text
Use case: text-localization
Asset type: isolated handwritten date insert
Input images: Image 1 is the mandatory handwriting glyph-style reference.

Render exactly "[VISIBLE_DATE]" once on one horizontal line. Match Image 1's cobalt-blue paint-marker forms, rounded blunt ends, slight baseline irregularity, human spacing, and modest stroke variation. Preserve every character and space exactly. Output only the blue handwritten glyphs on a genuinely transparent background with padding. No paper, box, shadow, seal, icon, extra mark, alternate text, or watermark.
```

Inspect spelling, glyph count, order, and transparency. Retry once with the exact wrong glyph named.

## 4. Normalize and composite

```bash
node .agents/skills/sketchbook/scripts/normalize-artwork-layer.mjs \
  --input "[BASE_ARTWORK_PNG]" \
  --output "[NORMALIZED_ARTWORK_PNG]"

node .agents/skills/sketchbook/scripts/composite-page-marks.mjs \
  --input "[NORMALIZED_ARTWORK_PNG]" \
  --date-image "[APPROVED_DATE_PNG]" \
  --location-seal "[APPROVED_LOCATION_SEAL_PNG]" \
  --output "[FINAL_LAYER_PNG]"
```

Never flatten `assets/canonical-book-shell.png` into the result. For QA only, composite the final layer over that shell in a temporary preview.

## Text contract

- Visible date is horizontal and corresponds to stored ISO date; default `YY MM DD`, explicit format wins.
- Location label, Chongxi glyph string, sampled shape, map, and right-starting reading order must remain exact.
- Four-character 回文 reads `右上 → 左上 → 左下 → 右下`.
- Canonical upper seal pixels come directly from `assets/seal.png`.
- Latin letters, Arabic numerals, and punctuation derive only from the bundled handwriting sheet.
