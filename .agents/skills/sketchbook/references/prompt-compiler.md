# Prompt Compiler

Generate a full-book base spread whose exterior canvas is transparent plus two independent transparent marks: a handwritten date and a location seal. The deterministic compositor adds those two marks plus the exact canonical seal on top of the finished book.

For final work, when execution controls are available, select `gpt-image-2.5-sunburst`, high or xhigh quality, `background=transparent`, and PNG. These are execution settings, not prose substitutes. Built-in imagegen may not expose them; in that case keep the same native-transparency requirement in the prompt, save the original, and validate the actual alpha channel.

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

## 2. Full-book base spread prompt

Write four compact paragraphs in this order, typically 200–350 words total for a base. Use the art brief to specify hierarchy; avoid long repeated exclusions. Coordinates describe the final canvas, so also use spatial/percentage cues. For extended styles, use `extended-styles.md` for paragraph 2.

### Paragraph 1: physical book and composition

```text
Horizontal 16:9 RGBA open-paper image intended for a 1280x720 homepage Sketchbook. Aim for one complete pair of warm paper pages at a 1200x680 silhouette centered at x=40,y=20; the normalizer will enforce these exact final bounds, rounded outer corners, and top/bottom center-gutter notches. It is one thin sheet opened into two facing halves with a subtle fold. Use the neutral paper-geometry guide, without a hard cover or dark rim. Every pixel outside the actual paper silhouette must be genuine transparent alpha, with clean light-paper RGB at the antialiased boundary; do not draw or bake a checkerboard, black/white/gray matte, tabletop, colored rectangle, dark rim or outline around the paper. Keep both pages visibly active; do not create a small floating book, a blank right page, a closed book, a loose sheet, an empty canvas, a hardback edge, or a layered exposed stack of paper leaves along the far-left edge.
```

### Paragraph 2: scene and medium

Place-only route:

```text
Depict [SUBJECT] at [PLACE] as a recognizable [MEDIUM] travel-journal scene spread across both visible pages. [MEDIUM_RECIPE] Use [LAYOUT], connect the two pages with continuous atmosphere, architecture, terrain, or pavement, and keep the place readable at carousel size without becoming a travel advertisement.
```

Photo route:

```text
Use Image [N] as the scene edit target with [PRESERVATION] preservation. Keep [VISIBLE_INVARIANTS] recognizable; change only medium, composition, and nonessential atmosphere. Recompose across the thin paper, preserving count, pose, gaze, front/back orientation, clothing and relationships. [MEDIUM_RECIPE]
```

Traditional recipes:

- **Watercolor:** `Abstract watercolor wash of [SUBJECT], loose oversized brushstrokes, broad flowing color shapes, minimal detail, soft pigment bleeding, expressive wet-on-wet texture, simplified forms, airy composition, no linework, no outlines.`
- **Oil:** `Plein-air oil study of [SUBJECT], tactile impasto, broken color, broad blocky brushwork, dry-brush scumbling, a few palette-knife accents, simplified but recognizable forms.`
- **Chinese ink:** `Chinese ink-wash study of [SUBJECT], calligraphic brush rhythm, layered pale/deep ink, controlled bleeding, dry-brush texture, atmospheric depth, simplified recognizable forms, no Western photorealistic shading.`

### Paragraph 3: mark reserves

```text
Reserve pale uninterrupted paper at top-right, about 77%–88% of canvas width and 6%–27% of canvas height (final x=990..1125,y=44..195). Keep branches, dark forms, stickers and focal subjects out; marks are added later. When composition allows, leave at least two calm patches among upper-left, middle-left, lower-left, lower-right, and the right page's upper-inner area so the compositor can sample a readable location-seal position and contrasting ink. Do not draw, imitate, ghost, or suggest any seal, stamp, date, handwriting, caption, logo, signature, or readable text.
```

### Paragraph 4: output and avoids

```text
Export one complete PNG RGBA full-page open-paper spread. Keep the two pages opaque, make every exterior canvas pixel genuinely transparent, and preserve a clean warm-paper antialiased edge with no black matte. Unless `gathered-memory` is explicitly selected, use no sticker, pasted fragment, luggage tag, route badge, paper cutout, or collage panel. Avoid sparse cutout art, a miniature book, blank pages, UI, glossy 3D product renders, frames, tabletop backgrounds, layered paper leaves, dark cover edges, unrelated landmarks, invented text, brands, QR codes, watermarks, and decorative signatures.
```

Use a supplied reference only for visual grammar. Do not copy its subject, readable text, stamps, or exact composition.

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
node .agents/skills/sketchbook/scripts/inspect-native-alpha.mjs \
  --input "[GENERATED_BASE.png]"

# Run only when native-alpha inspection fails and the scene itself is worth keeping.
node .agents/skills/sketchbook/scripts/mask-book-exterior.mjs \
  --input "[OPAQUE_OR_MATTE_BOOK_PNG]" \
  --output "[BOOK_WITH_ALPHA_PNG]" \
  --left "[CONFIRMED_LEFT]" \
  --top "[CONFIRMED_TOP]" \
  --right "[CONFIRMED_RIGHT]" \
  --bottom "[CONFIRMED_BOTTOM]" \
  --radius "[CONFIRMED_CORNER_RADIUS]" \
  --inset "3"

node .agents/skills/sketchbook/scripts/normalize-book-spread.mjs \
  --input "[BASE_ARTWORK_PNG_OR_BOOK_WITH_ALPHA_PNG]" \
  --output "[NORMALIZED_BOOK_SPREAD_PNG]"

node .agents/skills/sketchbook/scripts/composite-page-marks.mjs \
  --input "[NORMALIZED_BOOK_SPREAD_PNG]" \
  --date-image "[APPROVED_DATE_PNG]" \
  --location-seal "[APPROVED_LOCATION_SEAL_PNG]" \
  --output "[FINAL_BOOK_SPREAD_PNG]"
```

If native-alpha inspection passes, feed the generated original directly to the normalizer and skip the mask command. For alpha recovery follow `production.md`. Provide protected rectangles and use `--seed ENTRY_ID --exclude-regions regions.json --report marks.json --dry-run` before composition. Repeat without dry-run to write. The selector rejects low local contrast including explicit overrides and tests fixed marks. Save model/tool mode, output settings when exposed, exact prompts and reports in the production directory. Never send a composited final to imagegen.

## Text contract

- Visible date is horizontal and corresponds to stored ISO date; default `YY MM DD`, explicit format wins.
- Location label, Chongxi glyph string, sampled shape, map, and right-starting reading order must remain exact.
- Four-character 回文 reads `右上 → 左上 → 左下 → 右下`.
- Canonical upper seal pixels come directly from `assets/seal.png`.
- Latin letters, Arabic numerals, and punctuation derive only from the bundled handwriting sheet.
