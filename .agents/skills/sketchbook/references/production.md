# Production and recovery

## Minimal durable record

Use a workspace `output/sketchbook/<entry-id>/` directory for approved base, reusable mark layers, exclusions, exact prompts and the compositor report. The website PNG goes in `static/home/sketchbook/`; intermediate variants do not go there. A record contains ISO/visible dates, style, input roles, source paths or URLs, scene invariants, generation result paths, chosen seal shape/map, reviewed crop, exclusions, seed, QA findings and registration status.

Check existing records on continuation. Do not rely solely on /tmp or an unreturned Promise result. Save/report each completed tool result immediately. For batches, default to one image request at a time; at most two independent requests when service is healthy. Do not wrap a whole batch in an all-or-nothing Promise.all. Keep updates within a minute while waiting.

A 429 usage/quota response is a service limit, not a prompt defect. Save progress and report the supplied reset information accurately; Codex account usage is not proof of image-generation allowance. After a 500, retry once only when appropriate. After an uncertain timeout, inspect already returned or newly saved outputs before resubmitting. Do not assume cancelling an orchestration cell cancelled a remote image job.

## Alpha and paper geometry

Native RGBA is the primary path, not an optional polish step. When model/output controls are exposed, final generation should use `gpt-image-2.5-sunburst`, high or xhigh quality, `background=transparent`, and PNG. In built-in imagegen mode, explicitly require genuine transparent exterior pixels and preserve the returned PNG; do not claim parameter control that the tool does not expose. Never switch to a paid API merely to gain model or background controls without user authorization.

Save the untouched generation result, then inspect it before any crop or resize:

```bash
node .agents/skills/sketchbook/scripts/inspect-native-alpha.mjs \
  --input "[GENERATED_BASE.png]"
```

`native-alpha-pass` requires a substantial opaque paper region, at least 1% fully transparent exterior, and no predominantly dark semitransparent matte. If it passes, normalize that original directly. RGB-only output, opaque/checkerboard/solid surround, or a dark alpha fringe is a fallback condition, not an acceptable final.

If the output shows a baked checkerboard or solid matte:
- One targeted alpha-only retry is optional when the scene is exceptional and the service is healthy. Once the same session demonstrates the same failure, do not spend another call per asset repeating identical wording.
- For a visually correct paper spread, use `mask-book-exterior.mjs` with reviewed outer paper bounds. Its default three-pixel inset discards the generated rim, and its non-antialiased seed mask prevents the black matte from entering resize interpolation. `normalize-book-spread.mjs` then reconstructs the final canonical antialiased silhouette from opaque interior pixels.
- Keep the original, masked seed and normalized output separate. Do not feed the recovered or marked final back into imagegen.
- Never color-key cream or white from a painting. Never erase highlights, snow, sky or water to fake transparency.
- If the painted background reaches into the paper edge, geometry alone will not remove it. Reject the contaminated edge or request a targeted edit. Exact trim dimensions cannot detect RGB checkerboard inside opaque paper.
- Inspect corners, side edges and gutter notches over both light and dark backings at 4x. Check the paper interior for holes and the light backing for a dark hairline. Do not report these as passed using only four corner samples.

`normalize-book-spread.mjs` uses proportional cover resizing, never independent width/height stretching. Its default rejects aspect mismatch greater than 5%. Use `--fit cover` only after judging what a centered crop will remove; for faces near edges or large corrections, recompose instead. A pre-mask must not clip a face, sticker or defining landmark. `validate-spread.mjs --input BASE.png` checks exact bounds, opaque interior, exterior/notches, and dark semitransparent matte contamination with a three-pixel geometry tolerance. It still cannot certify an intentionally drawn opaque outline, place truth or aesthetic quality.

## Aesthetic acceptance

Treat aesthetic quality as a production gate. At full size, check medium-specific construction, selective edge control, texture variety, source/place truth and whether quiet paper supports rather than empties the composition. At ~240px, the focal event, fold-crossing path and resting area must remain obvious. Reject outputs whose only distinction is color grading, whose detail is uniform everywhere, whose geography reads as a generic postcard, or whose paper noise and generated outlines overpower the actual marks. In a series, compare neighboring entries and revise repeated camera positions, mountain/lake templates or identical mark reserves before registration.

Standalone one-ink marks: reuse native alpha when available. If background cleanup is required, only derive alpha from a clearly separable colored ink against an achromatic backdrop, keeping the original and recording the extraction settings. Inspect thin strokes, counters and ink gaps before acceptance. Do not apply a generic HSL threshold to photographs, paintings, black/gray ink, multicolor assets or saturated backgrounds. If separability is uncertain, regenerate. Do not silently convert a damaged glyph into a passing stamp.

## Mark layout

The compositor needs Node and `sharp`. ImageMagick 7 is needed for glyph rendering and paper normalization. Do not install missing runtimes globally without reason; check project dependencies first.

Exclusions are a JSON array of **final 1280x720 coordinates**:
```json
[
  { "x": 340, "y": 250, "width": 230, "height": 330, "reason": "two travelers" },
  { "x": 100, "y": 80, "width": 170, "height": 170, "reason": "roof sticker" }
]
```
Use the inspected normalized base to draw these rectangles. Include every sticker, important face, isolated focal rock, and other recognition anchors. An empty array is a deliberate reviewed choice. The script does not detect semantics.

```bash
node .agents/skills/sketchbook/scripts/composite-page-marks.mjs \
  --input BASE.png --date-image DATE.png --location-seal SEAL.png \
  --exclude-regions regions.json --seed ENTRY_ID \
  --report marks.json --output FINAL.png --dry-run
```
Repeat the exact command without `--dry-run` after inspecting the report. Dry-run writes no files. Existing outputs require a different filename or explicit `--overwrite` for an authorized replacement. Same seed + same inputs + same options reproduce position and color. The report is saved beside the PNG by default; prefer a production-directory `--report`.

The selector tests a grid plus seeded jitter in each configured zone, including an upper-inner-right option that stays clear of fixed marks. It compares colors and positions jointly and chooses only among quiet qualified results. It uses actual output-size core stroke pixels (alpha >= 0.8), including alpha blending: at least 90% must have contrast >= 3.2:1. This excludes antialiased fringe pixels, whose intentional translucency otherwise fails even on blank paper. Reported `contrast` is the 10th percentile, **not the old average-patch estimate and not a WCAG conformance claim**. The fixed seal and date receive the same check. No candidate or explicit override can bypass the threshold.

If no candidate works, revise the mark reserve on the unmarked base or provide a visually reviewed explicit location. All explicit locations still obey paper opacity, exclusions, fold avoidance and contrast. Do not resample random seeds until a bad composition happens to pass. Do not put a seal in the middle of a waterway or mountain merely because it contrasts there.

## Review and registration

A pixel test pass and a visual pass are different evidence. Review scene fidelity and aesthetic hierarchy independently of technical dimensions. Keep failed previews separate from accepted assets. The xue adapter auto-registers successful single-image requests under the user's standing preference; comparisons stay unregistered until selected. Never equate local registration with Production deployment.
