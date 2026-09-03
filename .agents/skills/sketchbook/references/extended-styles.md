# Extended Sketchbook Styles

These styles adapt useful design principles from editorial print, minimal zine, bitmap, scene-distillation, gathered-scene, and travel-memory systems. They remain shell-free Sketchbook artwork layers: the fixed homepage shell, exact date, canonical upper seal, Chongxi-guided location seal, place recognition, and transparent output contract never change.

## Routing summary

| Style id | User triggers | Photo requirement | Reference |
| --- | --- | --- | --- |
| `minimal-zine` | 极简杂志, 留白, zine, 微编辑 | optional | `assets/references/minimal-zine-reference.png` |
| `mono-riso` | 单色, 双色, 孔版, risograph, 网点印刷 | optional | `assets/references/mono-riso-reference.png` |
| `pixel-diary` | 点阵, bitmap, 像素日记, fine pixel | optional | `assets/references/pixel-diary-reference.png` |
| `distilled-scene` | 场景提纯, 情绪提炼, 抽象重构 | required | `assets/references/distilled-scene-reference.png` |
| `gathered-memory` | 实景拼贴, 多视角, 旅行记忆, cut-paper memory | required | `assets/references/gathered-memory-reference.png` |

When a photo-required style is explicitly requested without a photo, ask only for the missing photo after the date/place gate passes. Never silently downgrade it to place-only generation.

## Shared extended-style rules

- Preserve one semantic nucleus and one dominant spatial gesture. A style may simplify the scene but may not replace the place.
- Keep one focal event and one visibly quieter release zone. Judge both at full size and around 240px wide.
- Compress repeated foliage, windows, crowds, waves, stones, rails, or other micro-detail into a few masses or rhythms.
- Use controlled reproduction defects only: uneven ink density, dry-edge breakup, halftone drift, or restrained registration drift. Keep the same defect logic across a retry.
- Preserve active transparency. In the shell preview, the fixed paper showing through must clarify hierarchy rather than look unfinished.
- Add no readable display typography beyond the required date and user-approved annotation. Poster headlines, keyword footers, microcopy, coordinates, issue numbers, and decorative pseudo-metadata do not belong in the homepage spread.
- The fixed red upper seal, blue date, and generated location seal are exempt from a page-artwork ink limit; do not recolor them to satisfy a style palette.

## Minimal zine

Use one small, source-derived visual relation instead of a full descriptive scene.

- Keep 55%–75% of the safe area transparent so the fixed paper reads as quiet space.
- One focal cluster occupies about 15%–30% of the spread and may cross the gutter without hiding it.
- Choose one concrete relation: two fragments nearly touching, one interrupted path, one object leaving a color field, two states separated by a narrow gap, or one missing repeated form.
- Use one high-chroma accent carried by the subject, cut-paper block, or printed fragment. Keep grayscale and the revealed fixed paper subordinate.
- Allow at most three supporting marks from one family: a fine line, two registration dots, one torn edge, or one transparent block.
- Use xerox softness, halftone, risograph grain, letterpress bleed, or slight misregistration as one coherent reproduction process.
- Avoid a full-bleed landscape, commercial headline, inventory collage, decorative scrapbook, and unrelated tiny objects.

## Mono riso

Treat the page artwork as one or two physical printing plates, not a digital monochrome filter.

- Use one ink when explicitly requested; otherwise use one dominant plate at 70%–85% of printed color and one accent plate at 15%–30%.
- Approved travel-friendly pairs include Cobalt `#2148B8` + Terracotta `#C65F38`, Mint `#5EB783` + Charcoal `#302D2E`, and Ultramarine `#263E99` + Safety Orange `#E55D2B`.
- Keep 25%–55% of the page surfaces visibly unprinted.
- Choose exactly one focal event: an extreme landmark crop, a giant identifying detail, a moving figure/object relation, or one concentrated overprint collision.
- Keep exactly one release zone with sparse screening or open transparency.
- Build detail through plate density, halftone, clipped highlights, transparent paper knockouts, and at most two subtle imperfections.
- Registration drift may affect image plates but never the date, seals, or factual user annotation.
- Avoid more than two artwork inks, gradients, full-color photography, equal accent scattering, grunge overload, and vintage aging by default.

## Pixel diary

Use fine bitmap printing, not game pixel art.

- The place remains recognizable through one large subject or path occupying about 40%–75% of the page area.
- Build form with fine square-pixel grids, small dot-matrix halftone, stepped edges, missing-pixel gaps, and tonal change through density.
- Default to one dominant ink and at most one registration-offset accent.
- Keep 30%–55% transparent quiet space and one clear subject-to-empty-space relationship.
- Allow tiny non-readable rule fragments or curves, but no invented date, caption, headline, UI, or pseudo-interface.
- Organic detail uses dense-to-sparse pixel fields rather than chunky blocks or smooth stippling.
- Avoid sprites, 8-bit landscapes, game UI, voxel forms, neon cyberpunk, chunky pixels, cartoon mascots, and photorealistic facial details.

## Distilled scene

Use the supplied photo as semantic evidence and generate original page illustration rather than retaining photographic pixels.

- Record a semantic nucleus, one central tension, one visual metaphor, two to four identity anchors, and a discard list.
- Remove roughly 65%–90% of descriptive detail while preserving the dominant gesture and one source-specific spatial cue.
- Choose one primary grammar: cut-paper mass, dry-print silhouette, broken contour, rhythm field, or fragment stack; allow at most one supporting grammar.
- Use one dominant mass, one to three supporting forms, and one restrained texture field.
- Keep 50%–75% quiet page area and leave one meaningful relationship unresolved.
- One high-chroma accent acts as a focal entry, counterweight, bridge, or directional cue; it cannot be detached decoration.
- Use natural isolated contours or one source-derived torn/fibrous transition only when it clarifies the metaphor.
- Do not reproduce, embed, crop, collage, trace, or retain photographic pixels or photorealistic regions from the reference.
- Avoid universal-symbol clichés, cute cartoons, polished vector figures, arbitrary dots/grids, multiple bright hues, and decorative ambiguity.

## Gathered memory

Use one truthful photo anchor or recognizable main scene plus a small family of source-derived memory fragments.

- Preserve the source horizon, main subject relationship, path/gaze direction, and one identification anchor.
- Allocate one page or 45%–65% of the spread to the dominant scene; place three to five unequal fragments on the other page.
- Fragments must come from the source: a structural detail, environmental form, functional object, grouped natural motif, or scale cue.
- Use opaque gouache, cut paper, risograph, or screen-print-like fills with 5–8 broad source-derived color families.
- Compress dense foliage into one main canopy mass, one to three branch gestures, at most two supporting clusters, and one sparse texture sample.
- Use one high-chroma source-derived hue as shared structural color across the main scene and one or two fragments.
- Use relaxed spacing, irregular fragment edges, and shallow flat fragment shadows. Fragments read as memories, not a sticker catalog.
- Preserve 25%–45% quiet page area and a clear eye path from a fragment across the gutter into the main scene.
- Avoid detailed leaves/anatomy, equal fragment sizes, keyword footers, postal marks, photographic patches unless explicitly chosen as the truthful anchor, gradients, glossy 3D, and dense scrapbook layering.

## Extended-style quality checks

- The place is identifiable without relying on the caption.
- The chosen style id is visible in construction, not only named in the prompt.
- The focal event and release zone survive thumbnail reduction.
- Detail compression is stronger in foliage/crowd-heavy scenes than in simple architecture.
- Color accents perform one structural role and stay subordinate to place recognition.
- Required photo invariants survive for `gathered-memory`; no source pixels survive for `distilled-scene`.
- The fixed shell stays outside the asset; date, seals, safe area, and page-turn geometry remain identical to every other style.
