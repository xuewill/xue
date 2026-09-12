# Reference Art Prompts

The eight bundled references were regenerated with built-in imagegen on 2026-09-10 after the paper, composition and mark-placement update. They are **unmarked base spreads**: no date, seals, text, signatures or homepage marks. Pixel shell remains source-photo-driven and intentionally has no bundled image reference.

## Shared generation contract

Every call used only `assets/paper-geometry.png` as a geometry input; no prior travel scene and no legacy cover-bearing shell was passed. The input role was:

```text
Image 1 is a neutral single-sheet two-page geometry guide only. Do not copy its pixels, subject or texture and do not add another book.
```

Every style prompt ended with:

```text
Keep final top-right approximately 77%–88% width and 6%–27% height pale and calm for later marks. Show one thin open sheet with a subtle fold and clean bare-paper edge, with no cover or page stack. Exterior canvas should be transparent. Generate no text, date, seal, signature, frame, UI, logo or watermark. Stickers are prohibited except in gathered memory.
```

The original refresh generator returned RGB images with a rendered checkerboard/black surround; the retained raw files document that historical failure. Current reference assets use the reviewed inset hard seed mask before proportional normalization, so the black matte cannot enter interpolation. `validate-spread.mjs` now requires the canonical `1200x680+40+20` silhouette plus a clean semitransparent edge. Future generations must attempt and inspect native alpha first rather than treating this fallback as the normal route.

## Watercolor

```text
Original windswept tidal inlet. A small vermilion fishing skiff rests left of the fold; a pale S-shaped channel leads through reeds toward a low misty headland. Transparent reflections connect both halves. The sharpest edge and strongest color sit at the skiff, a soft reed mass supports it, and sky/water provide the release.

Use large transparent wet-on-wet washes, pigment blooms, granulation, backruns, lifted white-paper light and a few dry-brush reeds. Blue-gray atmosphere, sea-green water and raw-sienna reeds support one vermilion focal accent. Avoid outlines, uniformly sharp detail, photorealism, digital embossing, repeated paper-noise texture and opaque gouache.
```

Generated source: `exec-0eabdf1b-d635-4b9f-ae47-9b234e52cb04.png`. Reviewed mask: `55,22 → 1618,911`, radius `42`.

## Oil

```text
Original late-afternoon terraced hillside village. Three sunlit ochre stone houses form the left-middle focal cluster; a diagonal path crosses the fold and descends toward blue-violet fields. Cypress and olive masses support the architecture while the distant valley and pale sky release it.

Use directional loaded brushstrokes following planes, broken color, selective impasto on sunlit walls, dry scumbling in distance, palette-knife accents only near focal roofs and visible underpainting in quiet areas. Ochre/warm-white light, cobalt/violet shadow, olive/cypress support and small rust-red roofs. Avoid watercolor bleeding, an all-over raised texture filter, glossy 3D paint, photorealism and uniform tiny strokes.
```

A targeted edit moved the tallest upper-left cypress inward and restored a natural pale lavender-gold sky reserve without changing houses, path or valley. Accepted source: `exec-3dda0cb7-675b-440e-b957-aece7e4d5f6a.png`. Reviewed mask: `53,23 → 1619,913`, radius `42`.

## Chinese ink

```text
Original wind-cut basalt river gorge. One near-black cliff mass rises on the left; the river bends around a low rock just left of the fold and opens into mist on the right. Sparse dry shrubs and reed gestures provide scale. The cliff-to-water collision is the focal event.

Use varied ink load, wet bleeding, bone-dry broken rock strokes, splashed ink at the current, lost edges, visible paper and restrained mineral blue-green only in the river. Avoid bamboo, arched bridge, decorative Huangshan peaks, repeated pine silhouettes, watercolor outlines, photorealism, uniform gray filtering and calligraphy.
```

A targeted edit faded the lower-right foreground rocks/reeds into pale river wash so a location seal can sit without covering the focal cliff or central rock. Accepted source: `exec-353bca6a-dcc4-45a0-8107-f1f774fe4f71.png`. Reviewed mask: `53,23 → 1619,913`, radius `42`.

## Minimal zine

```text
Original micro-editorial relation: two weathered basalt sea stacks almost touch across the fold. Reduce them to two black xerox fragments with a deliberate narrow gap. An interrupted cobalt tide field enters from lower-right, stops before the left rock and resumes as a thin registration trace; a pale graphite horizon barely joins the pages.

Use one process: xerox softness, coarse-to-fine halftone, slight cobalt misregistration, one torn printed edge and at most two registration dots. Cobalt is the only high-chroma accent. Avoid a full landscape, realistic sea, centered poster block, headline, scrapbook, inventory collage or a photograph with one blue rectangle.
```

Generated source: `exec-e55205e3-7110-4586-926f-81ae84fc02a1.png`. Reviewed mask: `53,21 → 1618,913`, radius `42`.

## Mono riso

```text
Original coastal funicular climbing diagonally from lower-left across the fold to a small cliff station. The car is the focal event; track and cable connect the pages. A low sea horizon and sparse scrub support it.

Use exactly two plates: cobalt #2148B8 for roughly 78% of structure, shadow, sea and track; safety orange #E55D2B for roughly 22% of car, sunlit cliff and one cloud band. Use halftone density, paper knockouts, clipped highlights, uneven ink load and one restrained drift around the car. Avoid gradients, full color, digital duotone filters, equal orange scattering, photographic detail and a third ink.
```

Generated source: `exec-a422bb49-1bff-4239-8f43-838c127057a9.png`. Reviewed mask: `52,23 → 1619,911`, radius `42`.

## Pixel diary

```text
Original high-plateau radio telescope. One large parabolic dish sits left of the fold, tilted to upper-center; a stepped switchback path crosses the fold and dissolves toward a small equipment hut. A low mesa and sparse grasses support a wide sky.

Construct forms from square fine bitmap cells, stepped contours, missing-pixel gaps and density transitions. Violet-blue dominates; acid-lime appears only as a registration offset on the dish rim, path markers and a few grasses. Density decreases toward sky and edges. Avoid round riso dots, smooth stippling, sprites, chunky 8-bit blocks, voxels, game UI and photorealistic gradients.
```

Generated source: `exec-c5e179f2-014d-4aae-8cfb-2790867803d1.png`. Reviewed mask: `45,21 → 1626,913`, radius `42`.

## Distilled scene

```text
Original distilled departure scene: exactly two front-facing travelers sit at opposite ends of one low station bench. A vermilion scarf passes from one figure toward the other but stops across a narrow fold gap. One broken platform edge crosses pale rain reflections; a charcoal shelter mass supports the left figure. The tension is closeness interrupted by departure.

Remove about 80% of detail. Use charcoal dry-print silhouettes, one pale blue-gray reflection field and the scarf as the only bright bridge. Keep the paired cluster, two supporting forms, xerox breakup, fibrous edges and active paper. Avoid photorealistic faces, a detailed station, cute cartoons, polished vectors, arbitrary grids, multiple bright accents or turning either figure away.
```

Generated source: `exec-90926239-a13f-4035-a639-5d938b60df8b.png`. Reviewed mask: `52,22 → 1620,913`, radius `42`.

## Gathered memory

```text
Original night canal flower-stall memory. A narrow water lane enters from lower-center, passes a rust-orange awning and flower stall on the left and recedes toward cool indigo buildings; pale steps and dark foliage support the right. Cobalt, amber and restrained magenta reflections cross the fold.

Add exactly four source-derived die-cut stickers: awning corner, vertical canal-ripple strip, compact flower cluster and worn stone-step fragment. Group three unequal stickers asymmetrically along the left page; place the smallest stair fragment low-right. Use distinct silhouettes/scales, cream borders, tactile gouache/riso surfaces, varied tilt and small lifted shadows. Avoid one sticker in every corner, equal sizes, rectangular photos, tickets, labels and souvenir icons.
```

Generated source: `exec-d3b1781c-57cf-4f9a-8ed7-4345d991c4df.png`. Reviewed mask: `61,22 → 1610,902`, radius `42`.

## Acceptance

At about 240px, the eight references must remain distinguishable by structure rather than palette alone:

1. transparent washes and skiff;
2. loaded oil planes and hillside path;
3. ink load/lost-edge gorge;
4. two-fragment editorial relation;
5. two assigned plates and diagonal funicular;
6. square bitmap density and dish;
7. semantic reduction with front-facing pair;
8. truthful canal anchor plus asymmetrical die-cut stickers.

The full-size check covers pigment/print construction, one-sheet edges, fold, visual hierarchy and absence of generated marks. Light and dark contact sheets are preserved in the production directory for review.
