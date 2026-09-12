import sharp from 'sharp';
import { readFileSync } from 'node:fs';
export const layout = JSON.parse(readFileSync(new URL('../assets/layout.json', import.meta.url), 'utf8'));
export function paperPath() {
    const { left: l, top: t, width: w, height: h } = layout.book.bounds;
    const { outerCornerRadius: r, gutterNotchHalfWidth: n, gutterNotchDepth: d } = layout.book.silhouette;
    const x = l + w - 1, y = t + h - 1, c = l + w / 2;
    return [
        `M ${l + r} ${t} L ${c - n} ${t}`,
        `C ${c - n * .62} ${t} ${c - n * .2} ${t + d * .45} ${c} ${t + d}`,
        `C ${c + n * .2} ${t + d * .45} ${c + n * .62} ${t} ${c + n} ${t}`,
        `L ${x - r} ${t} Q ${x} ${t} ${x} ${t + r} L ${x} ${y - r} Q ${x} ${y} ${x - r} ${y}`,
        `L ${c + n} ${y} C ${c + n * .62} ${y} ${c + n * .2} ${y - d * .45} ${c} ${y - d}`,
        `C ${c - n * .2} ${y - d * .45} ${c - n * .62} ${y} ${c - n} ${y}`,
        `L ${l + r} ${y} Q ${l} ${y} ${l} ${y - r} L ${l} ${t + r} Q ${l} ${t} ${l + r} ${t} Z`
    ].join(' ');
}
export async function inspectSpread(input) {
    const meta = await sharp(input).metadata();
    if (meta.width !== 1280 || meta.height !== 720 || !meta.hasAlpha)
        throw new Error('Spread must be 1280x720 RGBA with a transparent exterior.');
    const [alpha, raster] = await Promise.all([
        sharp(input).extractChannel('alpha').raw().toBuffer(),
        sharp(input).toColourspace('srgb').ensureAlpha().raw().toBuffer({ resolveWithObject: true })
    ]);
    let left = 1280, top = 720, right = -1, bottom = -1;
    for (let y = 0; y < 720; y++)
        for (let x = 0; x < 1280; x++)
            if (alpha[y * 1280 + x] > 1) {
                left = Math.min(left, x);
                right = Math.max(right, x);
                top = Math.min(top, y);
                bottom = Math.max(bottom, y);
            }
    const bounds = { left, top, width: right - left + 1, height: bottom - top + 1 };
    const expected = layout.book.bounds;
    if (Object.keys(expected).some(k => bounds[k] !== expected[k]))
        throw new Error('Sketchbook full-book bounds are ' + JSON.stringify(bounds) + '; expected 1200x680+40+20.');
    const mask = await sharp(Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720"><path d="${paperPath()}" fill="white"/></svg>`)).ensureAlpha().extractChannel('alpha').raw().toBuffer();
    let holes = 0, leaks = 0;
    // Three-pixel tolerance for rasterizer antialiasing; check the entire interior/exterior.
    for (let y = 3; y < 717; y++)
        for (let x = 3; x < 1277; x++) {
            let inside = true, outside = true;
            for (const dy of [-3, 0, 3])
                for (const dx of [-3, 0, 3]) {
                    const m = mask[(y + dy) * 1280 + x + dx];
                    inside = inside && m === 255;
                    outside = outside && m === 0;
                }
            const a = alpha[y * 1280 + x];
            if (inside && a < 250)
                holes++;
            if (outside && a > 1)
                leaks++;
        }
    if (holes || leaks)
        throw new Error(`Paper alpha invalid: ${holes} interior holes/translucent pixels, ${leaks} exterior/gutter leaks.`);
    let semitransparentPixels = 0, darkSemitransparentPixels = 0, edgeLumaTotal = 0;
    for (let index = 0; index < raster.data.length; index += raster.info.channels) {
        const a = raster.data[index + 3];
        if (a <= 1 || a >= 254)
            continue;
        semitransparentPixels++;
        const luma = 0.2126 * raster.data[index] + 0.7152 * raster.data[index + 1] + 0.0722 * raster.data[index + 2];
        edgeLumaTotal += luma;
        if (luma < 96)
            darkSemitransparentPixels++;
    }
    const darkEdgeFraction = semitransparentPixels ? darkSemitransparentPixels / semitransparentPixels : 0;
    const meanEdgeLuma = semitransparentPixels ? edgeLumaTotal / semitransparentPixels : 255;
    if (darkEdgeFraction > .2 || meanEdgeLuma < 150)
        throw new Error(`Paper edge matte invalid: ${darkSemitransparentPixels}/${semitransparentPixels} semitransparent pixels are dark; mean edge luma ${meanEdgeLuma.toFixed(2)}. Recover from clean inset paper pixels before normalization.`);
    return { canvas: { width: 1280, height: 720 }, bounds, interiorAlphaMinimum: 250, edgeTolerance: 3,
        edgeMatte: { semitransparentPixels, darkSemitransparentPixels,
            darkEdgeFraction: Number(darkEdgeFraction.toFixed(6)), meanEdgeLuma: Number(meanEdgeLuma.toFixed(2)) },
        status: 'pixel-geometry-and-edge-pass', visualReview: 'Still inspect covers, generated outlines, glyphs, place fidelity, medium construction and aesthetic quality.' };
}
