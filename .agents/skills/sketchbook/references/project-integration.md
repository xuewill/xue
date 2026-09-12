# Project Integration

The skill is self-contained. Its geometry guide, fonts, marks, and references live under `assets/`; the paths below are only the current homepage adapter and output destinations.

## Homepage adapter

- The homepage carousel renders one complete `1280x720` transparent-exterior book spread at a time on coordinated stationary responsive `hero.albumBackdrops.light` and `hero.albumBackdrops.dark` assets. These imagegen-created theme backings are UI-only and must never be generated into or composited onto a Sketchbook source image.
- The page source itself includes clean warm paper pages, the central binding, painting, fixed upper marks, one recorded contrast-aware random location seal, and only a narrow transparent exterior margin.
- Save an approved image as lowercase kebab-case `<id>.png` under `static/home/sketchbook/`. The old `book-shell.png` must not be registered or passed to generation; use `paper-geometry.png`.

## Full-book registration source

- Exactly `1280x720`, RGBA, with genuine transparent pixels outside an exact `1200x680+40+20` full-book silhouette.
- The full physical paper spread has visible clean pages and a center binding. It has no hard cover, dark outer edge, or exposed stacked paper leaves.
- Run `normalize-book-spread.mjs` before mark composition.
- Follow `production.md` for native alpha, reviewed masking, proportional normalization and visual edge checks.
- Run `composite-page-marks.mjs` with approved date and location-seal layers before saving.
- Do not overwrite an existing page unless the user explicitly asks; otherwise use a versioned or medium-specific id.

Built-in imagegen saves first under Codex generated images. Copy the approved original into the project and leave that generated original in place. Normalize the complete book while preserving exterior alpha:

```bash
node .agents/skills/sketchbook/scripts/normalize-book-spread.mjs \
  --input GENERATED.png \
  --output NORMALIZED.png
```

An image without an open book, binding, intentional two-page treatment, or transparent exterior must be regenerated; do not create a flat background or an exposed stacked-paper edge to hide an incomplete book. Quiet modes may use large deliberate negative space only within their declared cluster ranges.

## Homepage registration

```bash
node .agents/skills/sketchbook/scripts/register-sketchbook-entry.mjs \
  --id ID \
  --image /home/sketchbook/ID.png \
  --caption "USER-FACING PLACE OR LANDMARK" \
  --alt "DESCRIPTIVE ALT TEXT" \
  --date "YYYY-MM-DD"
```

The command validates dimensions, bounds, interior opacity and exterior/notch transparency. It inserts by ISO date then id while preserving unrelated YAML. Repeating an exact entry is a read-only no-op; conflicting metadata is rejected. Existing entries must already be sorted. `--dry-run` writes nothing.

For xue, successful single-image requests auto-register under the user's standing instruction. Candidate/comparison requests wait for selection. Other repositories follow their own integration intent.

## Verification

1. Inspect the book and its exterior transparency at full size and 240px wide.
2. Verify its binding, full-page content, mark placement, and sticker behavior where applicable.
3. Register after technical and visual acceptance under the intent above; preserve other assets.
4. Run `npm run check` and `git diff --check` once per batch. Verify new carousel entries after the flip animation settles: image source, natural size, caption and captured errors. A transition screenshot is not a completed visual check.

Report the source path and exact `home.yaml` entry. Do not commit, push, or deploy unless requested.
