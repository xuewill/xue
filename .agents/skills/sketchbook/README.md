<div align="center">

[中文](./README.zh.md) · **English**

# Sketchbook

**A dated, location-stamped artwork system for a fixed open-book homepage carousel.**

[![Skill](https://img.shields.io/badge/SKILL-Sketchbook-174c35?style=flat-square&labelColor=333)](./SKILL.md)
[![Canvas](https://img.shields.io/badge/CANVAS-1280%C3%97720-2148b8?style=flat-square&labelColor=333)](./references/style-system.md)
[![Styles](https://img.shields.io/badge/STYLES-8-c83232?style=flat-square&labelColor=333)](./references/extended-styles.md)

</div>

Turn a date, place, and optional source photo into a transparent Sketchbook artwork layer. The homepage owns one fixed book shell; each page turn moves only the artwork, date, and seals. This prevents the cover, spine, page edges, and book shadow from being regenerated or flipped on every page.

The skill supports traditional painting, editorial print, bitmap, and source-distillation directions while preserving one stable composition contract: exact canvas, transparent safe area, chronological registration, exact upper seal, handwriting-derived date, and a randomized Chongxi-guided location seal.

## Selected style references

| Watercolor | Oil | Chinese ink | Minimal zine |
|:---:|:---:|:---:|:---:|
| <img src="./assets/references/watercolor-reference.png" alt="Shell-free watercolor lighthouse study" width="220"> | <img src="./assets/references/oil-reference.png" alt="Shell-free oil railway platform study" width="220"> | <img src="./assets/references/ink-reference.png" alt="Shell-free Chinese ink landscape study" width="220"> | <img src="./assets/references/minimal-zine-reference.png" alt="Shell-free minimal ferry zine composition" width="220"> |

| Mono riso | Pixel diary | Distilled scene | Gathered memory |
|:---:|:---:|:---:|:---:|
| <img src="./assets/references/mono-riso-reference.png" alt="Shell-free two-ink cycling print" width="220"> | <img src="./assets/references/pixel-diary-reference.png" alt="Shell-free fine bitmap observatory study" width="220"> | <img src="./assets/references/distilled-scene-reference.png" alt="Shell-free distilled rainy crossing" width="220"> | <img src="./assets/references/gathered-memory-reference.png" alt="Shell-free gathered tram memory composition" width="220"> |

These original references demonstrate construction and density. They are style grammar, not subjects or layouts to copy.

## What it does

| System | Direction |
|---|---|
| **Required input** | A real date and a place or landmark |
| **Optional input** | A source photo and an explicit style |
| **Canvas** | `1280x720` RGBA with genuine transparency |
| **Shell** | One fixed homepage background, never embedded in a page image |
| **Marks** | Exact bundled upper seal, handwriting-derived date, randomized Chongxi-guided location seal |
| **Order** | Ascending ISO date, then id |
| **Output** | Artwork PNG, exact prompts, recipe, mark metadata, homepage entry, and validation |

## Why the shell is separate

```text
fixed homepage layer   book-shell.png
                            ↓
page-turn layer        transparent artwork + date + seals
                            ↓
browser result         one stable book, many moving visual pages
```

The saved page PNG contains no paper, cover, spine, gutter line, page edges, exposed layers, contact shadow, or table. A temporary shell composite is used only for visual QA.

## Styles

- **Watercolor** — loose wet-on-wet washes, broad shapes, no outlines
- **Oil** — impasto, broken color, scumbling, palette-knife accents
- **Chinese ink** — layered ink, brush rhythm, bleeding, atmospheric depth
- **Minimal zine** — one compact visual relation and 55%–75% transparent silence
- **Mono riso** — one or two assigned printing plates, halftone, controlled drift
- **Pixel diary** — fine dot-matrix construction, not game pixel art
- **Distilled scene** — photo-required semantic reduction with no retained photo pixels
- **Gathered memory** — photo-required truthful anchor plus unequal source-derived fragments

## How it works

```text
1  Validate input      →  require date and place; route the style
2  Compile the scene   →  record subject or photo-preservation invariants
3  Generate artwork    →  transparent layer, no shell, paper, marks, or text
4  Generate marks      →  separate exact date and Chongxi-guided location seal
5  Normalize/composite →  enforce safe area and deterministic mark positions
6  Inspect/register    →  test alone, over the shell, at thumbnail size, and in date order
```

## Try it

```text
Use $sketchbook to create a watercolor page for 2026-09-18, West Lake in Hangzhou.
```

```text
使用 $sketchbook 生成 2027-05-12 青岛栈桥的蓝橙双色孔版印刷版本。
```

```text
Use this photo to make a gathered-memory Sketchbook layer for 2027-09-10, Alishan.
```

If date or place is missing, the skill stops before tools and asks only for the missing field. Photo-required styles also stop for a missing photo.

## Stable mark system

- `assets/seal.png` is composited exactly; image generation never redraws it.
- `assets/handwriting-latin-glyph-sheet.png` guides a separate transparent date raster.
- `assets/chongxi_seal.otf` controls every location-seal glyph and absolute position.
- Four-character location seals default to the true 回文 path `右上 → 左上 → 左下 → 右下` when composition allows.
- The outer location-seal shape is freshly randomized from count-compatible candidates.

## Validation

```bash
python3 "${CODEX_HOME:-$HOME/.codex}/skills/.system/skill-creator/scripts/quick_validate.py" \
  .agents/skills/sketchbook

node .agents/skills/sketchbook/scripts/normalize-artwork-layer.mjs \
  --input GENERATED.png \
  --output NORMALIZED.png

npm run check
git diff --check
```

The page validator rejects wrong dimensions, missing alpha, fully opaque images, shell-baked bounds, and pixels outside the fixed page-safe area.

Image generation and registration use the project's installed `sharp` package. The three authoring helpers that render glyph controls or composite raster layers use ImageMagick 7's `magick` command; their integration tests run when that executable is available and skip cleanly on site-only CI hosts.

## Repository layout

```text
sketchbook/
├── agents/openai.yaml       # UI name and default invocation
├── assets/                  # Layout manifest, fixed shell, marks, font, handwriting, references
│   └── references/          # Eight shell-free original style examples
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
