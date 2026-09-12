<div align="center">

[中文](./README.zh.md) · **English**

# Sketchbook

**A dated, location-stamped full-book travel-journal system.**

[![Skill](https://img.shields.io/badge/SKILL-Sketchbook-174c35?style=flat-square&labelColor=333)](./SKILL.md)
[![Canvas](https://img.shields.io/badge/CANVAS-1280%C3%97720-2148b8?style=flat-square&labelColor=333)](./references/style-system.md)
[![Styles](https://img.shields.io/badge/STYLES-9-c83232?style=flat-square&labelColor=333)](./references/extended-styles.md)

</div>

Turn a date, place, and optional source photo into one complete Sketchbook spread. Each result visibly contains two clean tactile paper pages, one center binding, and a full-page travel scene. It has no hard cover or dark outer edge. The paper is opaque while every pixel outside its silhouette stays genuinely transparent.

The skill supports traditional painting, editorial print, bitmap, and source-distillation directions while preserving one stable composition contract: a `1280×720` canvas with exact `1200×680+40+20` book bounds, exact upper seal, handwriting-derived date, and a randomized Chongxi-guided location seal. The homepage renders these complete spreads over a separate stationary album backdrop.

## Selected style references

| Watercolor | Oil | Chinese ink | Minimal zine |
|:---:|:---:|:---:|:---:|
| <img src="./assets/references/watercolor-reference.png" alt="Watercolor grammar reference" width="220"> | <img src="./assets/references/oil-reference.png" alt="Oil-paint grammar reference" width="220"> | <img src="./assets/references/ink-reference.png" alt="Chinese-ink grammar reference" width="220"> | <img src="./assets/references/minimal-zine-reference.png" alt="Minimal-zine grammar reference" width="220"> |

| Mono riso | Pixel diary | Distilled scene | Gathered memory |
|:---:|:---:|:---:|:---:|
| <img src="./assets/references/mono-riso-reference.png" alt="Two-ink cycling grammar reference" width="220"> | <img src="./assets/references/pixel-diary-reference.png" alt="Fine bitmap grammar reference" width="220"> | <img src="./assets/references/distilled-scene-reference.png" alt="Distilled-scene grammar reference" width="220"> | <img src="./assets/references/gathered-memory-reference.png" alt="Travel-memory grammar reference" width="220"> |

These original references demonstrate construction and density. They are style grammar, not subjects or layouts to copy.

Pixel shell is the ninth, prompt-defined style. It deliberately uses the uploaded photo as its only visual source and reads [`pixel-shell-style.md`](./references/pixel-shell-style.md) instead of a bundled image reference.

## What it does

| System | Direction |
|---|---|
| **Required input** | A real date and a place or landmark |
| **Optional input** | A source photo and an explicit style |
| **Canvas** | `1280x720` RGBA full-book spread with transparent exterior |
| **Book** | Exact `1200×680+40+20` bounds, two active clean paper pages, and a center binding, without cover edges or stacked leaves |
| **Marks** | Exact bundled upper seal and date; randomized Chongxi location-seal shape, position, and contrast-checked ink |
| **Order** | Ascending ISO date, then id |
| **Output** | Full-book PNG, exact prompts, recipe, mark metadata, registration status, and validation |

## Full-book mode

```text
full-book base          paper + pages + binding + full-page travel illustration
                            ↓
composited marks        exact red seal + handwritten date + contrast-aware random location seal
                            ↓
registered output       one composed, tactile travel-journal image
```

The finished PNG deliberately contains one full open paper spread. Its exterior is transparent, while the pages themselves are not a transparent cutout. It must not be a miniature book in a blank canvas, a blank-page product mockup, a hard cover, a dark rim, or a stack of exposed left-side paper leaves. Stickers belong only to an explicit Sticker Memory request. The complete spread is the image registered directly in the homepage carousel.

## Styles

- **Watercolor** — loose wet-on-wet washes, broad shapes, no outlines
- **Oil** — impasto, broken color, scumbling, palette-knife accents
- **Chinese ink** — layered ink, brush rhythm, bleeding, atmospheric depth
- **Minimal zine** — one compact visual relation with quiet but still treated book pages
- **Mono riso** — one or two assigned printing plates, halftone, controlled drift
- **Pixel diary** — fine dot-matrix construction, not game pixel art
- **Pixel shell** — photo-required semantic reconstruction from source-adaptive matte shell/mineral modules; no photo panel, retained photo pixels, or dense micro-tiling
- **Distilled scene** — photo-required semantic reduction with no retained photo pixels
- **Sticker memory** — photo-required truthful anchor plus three to five source-derived die-cut stickers with paper borders and lift shadows

## How it works

```text
1  Validate input      →  require date and place; route the style
2  Compile the scene   →  record subject or photo-preservation invariants
3  Generate book        →  clean paper spread with binding, transparent exterior, full-page art, no generated text, marks, or default stickers
4  Generate marks      →  separate exact date and Chongxi-guided location seal
5  Normalize/composite →  normalize the book, then sample a quiet location-seal anchor and contrasting ink
6  Inspect/register    →  test binding, coverage, exterior alpha, thumbnail clarity, and sticker behavior only when that style was selected
```

## Try it

```text
Use $sketchbook to create a watercolor page for 2026-09-18, West Lake in Hangzhou.
```

```text
使用 $sketchbook 生成 2027-05-12 青岛栈桥的蓝橙双色孔版印刷版本。
```

```text
Use this photo to make a gathered-memory Sketchbook spread for 2027-09-10, Alishan.
```

```text
Use this photo to make a pixel-shell Sketchbook spread for 2027-10-12, Qinghai Lake.
```

If date or place is missing, the skill stops before tools and asks only for the missing field. Photo-required styles also stop for a missing photo.

## Stable mark system

- `assets/seal.png` is composited exactly; image generation never redraws it.
- `assets/handwriting-latin-glyph-sheet.png` guides a separate transparent date raster.
- `assets/chongxi_seal.otf` controls every location-seal glyph and absolute position.
- Four-character location seals default to the true 回文 path `右上 → 左上 → 左下 → 右下` when composition allows.
- The outer location-seal shape is freshly randomized from count-compatible candidates.
- Location-seal position is sampled from quiet page-edge anchors; ink is randomized only among colors that meet the configured contrast threshold against the selected patch.

## Validation

```bash
python3 "${CODEX_HOME:-$HOME/.codex}/skills/.system/skill-creator/scripts/quick_validate.py" \
  .agents/skills/sketchbook

node .agents/skills/sketchbook/scripts/inspect-native-alpha.mjs \
  --input GENERATED.png

node .agents/skills/sketchbook/scripts/normalize-book-spread.mjs \
  --input GENERATED.png \
  --output NORMALIZED.png

npm run check
git diff --check
```

The spread workflow asks for native transparent PNG first and validates the actual alpha before resizing. When execution controls are available, final generation prefers GPT Image 2.5 Sunburst at high or xhigh quality with a transparent background. A failed native-alpha check falls back to a reviewed inset hard seed mask, preventing a baked black matte from entering resize interpolation. Geometry validation then rejects interior holes, gutter/exterior leaks, and dark semitransparent edge contamination; visual review still checks intentionally drawn outlines and aesthetic quality.

Use the neutral `assets/paper-geometry.png` as geometry guidance; the old cover-bearing canonical shell is retired from generation inputs. Rebuild the guide with `node scripts/create-paper-reference.mjs` from the skill directory.

The mark compositor uses output-size core strokes, requires 90% to meet 3.2:1 contrast, checks fixed marks, and honors protected face/landmark/sticker rectangles. It supports `--seed`, `--exclude-regions`, `--dry-run` and `--report`. No low-contrast fallback is allowed. See [production.md](./references/production.md) for commands and recovery rules.

The xue adapter defaults to homepage registration after quality review under the user's standing preference. Comparison/preview batches await selection. Registration inserts by date then id, exact replays are no-ops, and conflicts leave the YAML unchanged. Existing images remain available.

Runtime dependencies are Node, `sharp` and `yaml`; ImageMagick 7 is used by glyph rendering and normalization. No image API key is required for the built-in generator. Tests of mark layout, alpha validation and registration run without image-generation calls.

## Repository layout

```text
sketchbook/
├── agents/openai.yaml       # UI name and default invocation
├── assets/                  # Layout manifest, material reference, marks, font, handwriting, references
│   └── references/          # Eight image references; pixel-shell is prompt-defined
├── evals/evals.json         # Representative behavior cases
├── references/              # Style, prompt/provenance, seal, photo, QA, integration rules
├── scripts/                 # Normalization, mark composition, seal helpers, registration
├── SKILL.md                 # Entrypoint and workflow
├── README.md                # English documentation
└── README.zh.md             # 中文说明
```

## Originality

References define medium, spacing, reproduction, and detail-compression systems. Every result rebuilds composition from the requested place, date, and photo; it does not copy a bundled reference's subject or arrangement.

## Asset license

`assets/chongxi_seal.otf` is redistributed unmodified under CC BY-ND 3.0 Taiwan or later. Attribution, provenance, checksum, and the authoritative license URL are recorded in [`ASSET-LICENSE.md`](./ASSET-LICENSE.md). It is not covered by the repository's MIT license.
