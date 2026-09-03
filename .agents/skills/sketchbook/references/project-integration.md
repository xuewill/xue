# Project Integration

The skill is self-contained. Its shell, fonts, marks, and references live under `assets/`; the paths below are only the current homepage adapter and output destinations.

## Fixed shell

- `assets/canonical-book-shell.png` is the skill-owned alignment guide.
- `assets/layout.json` is the shared geometry and runtime-path manifest consumed by the skill scripts and Velite.
- The homepage copy is `static/home/sketchbook/book-shell.png`.
- The component renders this shell once beneath all page layers.
- Do not list `book-shell.png` inside `hero.images`, pass it through page-turn state, or flatten it into a page source.

When intentionally changing the shell, replace both copies with the same `1280x720` RGBA raster and update the manifest only if geometry changes. Velite compares the two files byte-for-byte and validates the declared bounds, so `npm run check` fails on drift. Ordinary Sketchbook generation never changes either file.

## Final page layer

- Save under `static/home/sketchbook/` as lowercase kebab-case `<id>.png`.
- Exactly `1280x720`, RGBA, genuinely transparent.
- Artwork and marks stay inside `x=144..1136`, `y=44..664`.
- No paper, cover, spine, page edge, binding, gutter, shadow, or shell pixels.
- Run `normalize-artwork-layer.mjs` before mark composition.
- Run `composite-page-marks.mjs` with approved date and location-seal layers before saving.
- Do not overwrite an existing page unless the user explicitly asks; otherwise use a versioned or medium-specific id.

Built-in imagegen saves first under Codex generated images. Copy the approved original into the project and leave that generated original in place. Normalization handles source dimensions while preserving the full transparent composition:

```bash
node .agents/skills/sketchbook/scripts/normalize-artwork-layer.mjs \
  --input GENERATED.png \
  --output NORMALIZED.png
```

An opaque result must be regenerated; do not fake transparency by treating white paper as alpha.

## Homepage registration

```bash
node .agents/skills/sketchbook/scripts/register-sketchbook-entry.mjs \
  --id ID \
  --image /home/sketchbook/ID.png \
  --caption "USER-FACING PLACE OR LANDMARK" \
  --alt "DESCRIPTIVE ALT TEXT" \
  --date "YYYY-MM-DD"
```

The script validates slug, real date, source path, PNG dimensions/alpha, duplicate ids/paths, and insertion point. Velite additionally rejects shell-baked layers that exceed the page-safe area. It sorts enabled and disabled entries by ascending date, then id.

## Verification

1. Run `npm run check`.
2. Confirm generated content contains the id and responsive image.
3. Verify the final PNG alone is transparent and shell-free.
4. Verify a temporary shell composite aligns on desktop and mobile; do not save it as the source.
5. Confirm only the page art turns while `book-shell.png` remains stationary.
6. Run `git diff --check`.

Report the source path and exact `home.yaml` entry. Do not commit, push, or deploy unless requested.
