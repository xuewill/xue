---
name: sketchbook
description: Generate and chronologically register shell-free 1280x720 transparent Sketchbook artwork layers for one fixed homepage book background, with stable date and seal composition plus watercolor, oil, Chinese ink, minimal-zine, mono-riso, pixel-diary, distilled-scene, or gathered-memory styles. Use for dated homepage Sketchbook images from a place or landmark, optionally with a source photo; do not use for standalone posters or book-shell generation.
---

# Sketchbook

Create one transparent artwork layer for the homepage Sketchbook, composite the exact marks, and register it in chronological order. The site renders `static/home/sketchbook/book-shell.png` once beneath every layer; generated page images must never contain paper, a cover, a spine, page edges, or a book shadow.

## Input Gate

Before inspecting images, browsing, generating, or editing files, extract:

- a date;
- a place or landmark.

If either is missing, stop immediately and ask only for the missing information:

> 请提供时间和地点/景点，例如：`2026-09-18，杭州西湖`。也可以同时上传参考图片，并选择油画、中国水墨或水彩；未选择风格时默认水彩。

Normalize and store the full date as `YYYY-MM-DD`; it controls ascending homepage order. The default visible date is horizontal `YY MM DD` unless the user supplies another exact format.

## Route the Request

- **Watercolor:** default when no medium is chosen.
- **Oil:** `油画`, `oil`, or equivalent.
- **Chinese ink:** `中国水墨`, `水墨`, `ink wash`, or equivalent.
- **Minimal zine:** `极简杂志`, `留白`, `minimal zine`, or `微编辑`.
- **Mono riso:** `单色`, `双色`, `孔版`, `risograph`, or `网点印刷`.
- **Pixel diary:** `点阵`, `bitmap`, `像素日记`, or `fine pixel`.
- **Distilled scene:** `场景提纯`, `情绪提炼`, or `抽象重构`; requires a supplied photo.
- **Gathered memory:** `实景拼贴`, `多视角`, `旅行记忆`, or `cut-paper memory`; requires a supplied photo.
- A supplied image is the scene/subject source. With no image, derive the subject from the named place.

Read only the references needed for the current stage:

- Always: `references/style-system.md`, `references/quality-gate.md`.
- Before prompts or image inputs: `references/prompt-compiler.md`, `references/photo-and-seals.md`.
- For location marks: `references/seal-composition.md`.
- For dates or Latin glyphs: `references/handwriting-system.md`.
- For extended styles: `references/extended-styles.md`.
- Before saving: `references/project-integration.md`.

## Workflow

1. Validate date and place, then choose the requested style or Watercolor.
2. Inspect `assets/canonical-book-shell.png` only as the homepage alignment guide, plus `assets/seal.png`, `assets/chongxi_seal.otf`, `assets/handwriting-latin-glyph-sheet.png`, and exactly one shell-free style reference. Do not use host-project visual files as generation inputs.
3. When a photo is supplied, record its role and preservation invariants from `references/photo-and-seals.md`.
4. Build and generate the location seal exactly as defined in `references/seal-composition.md`: 1–6 characters, Chongxi-derived glyphs, a fresh randomized count-compatible outer shape, and right-starting order. Inspect at full size and about 80px; retry once for a wrong glyph, map, shape, script, or transparency.
5. Generate the base artwork as a genuine transparent 16:9 layer. The canonical shell is alignment-only and must not appear in the output. Generate no paper, book geometry, seal, date, text, border, shadow, or background. Preserve quiet zones for the later marks.
6. Generate the exact visible date as a separate isolated transparent cobalt-blue handwriting layer, using only `assets/handwriting-latin-glyph-sheet.png` as the style reference. Inspect every glyph and retry once if wrong.
7. Run `scripts/normalize-artwork-layer.mjs`, then `scripts/composite-page-marks.mjs` with the approved date layer and location seal. The compositor inserts the exact bundled upper seal and places all three marks deterministically. Never send the composited layer back to imagegen.
8. Apply `references/quality-gate.md` at full size, around 240px, and over `assets/canonical-book-shell.png`. The standalone PNG must remain shell-free; the preview composite must look physically aligned to the fixed pages.
9. Persist the approved layer and register its full date using `references/project-integration.md`. Set `enabled: true` unless requested otherwise.
10. Run project content/type checks and report the asset, prompt, style recipe, visible date, seal composition, photo preservation when applicable, and validation.

## Output Contract

Return the generated shell-free layer, exact prompts, selected style and recipe, ISO/visible dates, location-seal label/layout/map/order/shape, deterministic mark placements, photo role when applicable, saved path, homepage entry, and validation results.

The output is artwork for a fixed open-book background, not a complete book image or standalone poster. Do not generate promotional copy, UI, logos, extra signatures, invented dates, additional stamps, paper, page edges, a spine, a cover, or a book shadow.
