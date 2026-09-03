# Bundled Handwriting System

## Canonical asset

Use `assets/handwriting-latin-glyph-sheet.png` as the only handwriting-style reference. It was derived once from the historical blue marker numerals and is now self-contained; future runs must not inspect or reference the source portrait.

The sheet contains:

- uppercase Latin `A–Z`;
- lowercase Latin `a–z`;
- Arabic digits `0–9`;
- common punctuation: `. , : ; ! ? ' " - – — / \\ ( ) [ ] { } & @ # + = % ° *`.

This bitmap is an image-generation style reference, not an installable font file. Generate the date as its own transparent raster from this sheet, inspect it, then pass that approved layer to `composite-page-marks.mjs`. Do not ask the scene generator to draw the date.

## Visual rules

- Cobalt-blue paint-marker ink.
- Simple unconnected handwritten forms.
- Slightly irregular baseline and human spacing.
- Rounded blunt stroke ends with modest width variation.
- Casual and tactile, but clearly legible.
- No cursive joins, typographic perfection, faux calligraphy, or alternate handwriting source.

## Text use

- Always quote exact required text in the dedicated date/text prompt.
- Store dates as `YYYY-MM-DD`. By default render one horizontal `YY MM DD` line with single spaces; when the user explicitly supplies another exact visible format, preserve it verbatim and keep it horizontal.
- For optional annotations, keep text short and limit it to glyphs present in the sheet.
- Output only isolated cobalt-blue glyphs on transparency: no paper, box, shadow, seal, or extra mark.
- Inspect spelling, punctuation, count, order, and transparency in the generated raster. Retry once when exact text is wrong; do not register an incorrect result.
