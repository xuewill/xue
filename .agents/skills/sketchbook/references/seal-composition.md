# Location Seal Composition

Use this reference whenever choosing, prompting, inspecting, or retrying the location seal. Its page position and ink may vary, while the historical glyph composition and reading order remain exact.

## Reading terminology

- A seal is not automatically a `回文印`. Traditional seal text is generally read top-to-bottom within a column and columns proceed right-to-left.
- A conventional four-character 2x2 seal is read `右上 → 右下 → 左上 → 左下`.
- A four-character `回文印` is read `右上 → 左上 → 左下 → 右下`, tracing a counterclockwise loop from the upper-right. Do not confuse this with ordinary right-column-first reading.
- Both methods begin at the right side. Never arrange a Chinese location seal as ordinary modern left-to-right row text.
- `回文` is a composition method, not a claim that every seal text is a linguistic palindrome.

## Skill defaults by character count

These are generation defaults for small travel seals, not universal rules for every historical seal. Prefer a concise label of 1–6 Chinese characters. If a place cannot be represented unambiguously within six characters, ask the user to approve a shorter Chinese seal label.

| Count | Default shape and composition | Reading order |
| --- | --- | --- |
| 1 | Square or circular; one enlarged glyph centered optically, with irregular breathing room | the single glyph |
| 2 | Vertical rectangle or compact square; one vertical column, first glyph above the second | `上 → 下` |
| 3 | Vertical rectangle or near-square; split into two columns as `1+2` or `2+1` according to glyph weight and semantic grouping | right column top-to-bottom, then left column top-to-bottom |
| 4 | A 2x2 internal composition adapted inside the freshly randomized outer shape; **default to 回文 for this skill** when the label remains unambiguous and the diagonal weights balance well | `右上 → 左上 → 左下 → 右下` |
| 5 | Vertical rectangle or near-square; use two columns as `2+3` or `3+2`, placing the visually heavier group where the opposite blank space can balance it | right column top-to-bottom, then left column top-to-bottom |
| 6 | Square or vertical rectangle; two three-character columns, adjusted for stroke density rather than mechanically equal cells | right column top-to-bottom, then left column top-to-bottom |

For four characters, fall back to the conventional order `右上 → 右下 → 左上 → 左下` only when 回文 would split a name or fixed semantic unit awkwardly, reduce legibility, or create markedly worse red-white balance. Record the reason.

## Required position mapping

Before calling image generation, write a position map with the exact characters. The map is part of the generation contract and the quality gate.

Examples:

- `西湖` (two characters): `上=西, 下=湖`; read `上→下`.
- `凯旋门` (three characters, 1+2 example): `右=凯, 左上=旋, 左下=门`; read `右→左上→左下`.
- `橘子洲头` (four-character 回文): `右上=橘, 左上=子, 左下=洲, 右下=头`; read `右上→左上→左下→右下`.
- `桂林山水` (four-character 回文): `右上=桂, 左上=林, 左下=山, 右下=水`; read `右上→左上→左下→右下`.

Do not describe a 2x2 seal to the image model as “top row X Y / bottom row Z W”; that phrasing invites left-to-right typesetting. Name every absolute position instead.

## Choosing the composition

1. Write the exact label, count its Chinese characters, and note semantic units such as a surname, compound place name, or landmark suffix.
2. Estimate visual weight: dense/complex glyphs, sparse/simple glyphs, long verticals, and broad horizontal masses.
3. Choose the count-appropriate shape and column split. Keep semantic units together when possible.
4. For four characters, test the default 回文 map first. Prefer placing dense and sparse glyphs diagonally so they answer each other rather than forming one heavy side.
5. Record `layout name`, `shape`, `position map`, and `reading order` before writing the prompt.

## `分朱布白` and carving character

- Treat red strokes and unprinted space as one composition. Avoid four mechanically equal font cells.
- Use changes in stroke length, spacing, interlocking, and controlled contact with the border to balance dense and sparse glyphs.
- Keep enough inner margin that the characters do not become a solid block at 80px, while allowing one or two strokes to approach or borrow the border naturally.
- For four-character seals, preserve the 2x2 absolute position map while allowing imagegen to adapt the outer frame and internal negative space to the randomly selected shape. Dividers are optional visual treatment; they never redefine the reading order.
- Use a hand-cut border with consistent overall weight, small breaks, ink starvation, and modest corner wear. Texture must not obscure reading order.
- All generated location-seal glyphs must visibly match the borderless reference rendered from `assets/chongxi_seal.otf`. Imagegen may add carving and ink texture or adapt scale and spacing to the chosen shape, but it must not invent or replace the Chongxi glyph skeleton. Use an approved traditional form through `--glyphs` when the font does not contain the simplified input character.
- Prefer visual asymmetry with equilibrium: `疏可走马，密不透风` describes purposeful density contrast, not random gaps or illegibility.

## Inspection contract

Inspect the generated stamp at full size and about 80px wide. Reject it when:

- any glyph is wrong, duplicated, omitted, mirrored, or replaced by modern type;
- any glyph no longer visibly matches the bundled Chongxi-rendered reference;
- the final outline does not match the randomly selected shape metadata;
- the physical positions do not match the recorded map;
- the reading path does not begin at the declared right-side starting point;
- a four-character stamp claimed as 回文 uses conventional column order or ordinary horizontal row order;
- equal mechanical cells, border collisions, or excessive distress make the seal unreadable;
- the script no longer resembles Small Seal Script.

On retry, repeat the exact position map and reading path before any style language. Do not merely ask for “more traditional” composition.

## Sources and scope

The historical distinction and reading sequences follow seal-cutting teaching on four-character conventional and 回文 layouts, including discussion of Wu Yan's Yuan-dynasty `《三十五举》`. General right-to-left column order and count-dependent composition are supported by seal-composition instruction emphasizing character complexity, density, weight, and blank space.

- `https://www.sohu.com/a/331375557_346516`
- `http://www.sealbank.net/m3mainfind.asp?L1=5&L2=21&L3=460&SK=SD521460`
- `http://www.shufazidian.com/shuji/article.php?acid=21&arid=41`
- `https://www.ihchina.cn/project_details/20047.html`

The per-count table and the choice to default four-character travel seals to 回文 are explicit defaults of this skill, not claims that all historical seals follow one layout.
