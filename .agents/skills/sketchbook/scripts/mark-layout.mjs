// Pure, deterministic geometry and contrast helpers.
export function luminance(rgb) {
    const c = rgb.map(v => v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4);
    return c[0] * .2126 + c[1] * .7152 + c[2] * .0722;
}
export function hexRgb(hex) {
    if (!/^#[0-9a-f]{6}$/i.test(hex))
        throw new Error('Ink must be a six-digit hex color.');
    return [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255);
}
export function overlaps(a, b, gap = 0) {
    return a.x < b.x + b.width + gap && a.x + a.width + gap > b.x && a.y < b.y + b.height + gap && a.y + a.height + gap > b.y;
}
export function inspectRect(r, canvas) {
    for (const k of ['x', 'y', 'width', 'height'])
        if (!Number.isInteger(r[k]))
            throw new Error('Region coordinates must be integers.');
    if (r.x < 0 || r.y < 0 || r.width < 1 || r.height < 1 || r.x + r.width > canvas.width || r.y + r.height > canvas.height)
        throw new Error('Region exceeds the canvas.');
}
export function seededRandom(seed) {
    let state = 2166136261;
    for (const c of String(seed))
        state = Math.imul(state ^ c.charCodeAt(0), 16777619) >>> 0;
    return () => {
        state += 0x6D2B79F5;
        let t = Math.imul(state ^ state >>> 15, 1 | state);
        t ^= t + Math.imul(t ^ t >>> 7, 61 | t);
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
}
// Actual mark strokes, including alpha blending, not just a background average.
export function strokeMetrics(base, mark, x, y, ink, minimumContrast = 3.2) {
    const ratios = [];
    let sum = 0, squares = 0, paper = true;
    for (let row = 0; row < mark.height; row++)
        for (let col = 0; col < mark.width; col++) {
            const i = (row * mark.width + col) * 4, alpha = mark.data[i + 3] / 255;
            if (alpha < .8)
                continue;
            const px = x + col, py = y + row;
            if (px < 0 || py < 0 || px >= base.width || py >= base.height)
                return null;
            const j = (py * base.width + px) * 4;
            if (base.data[j + 3] < 250)
                paper = false;
            const bg = [0, 1, 2].map(c => base.data[j + c] / 255);
            const fg = ink ?? [0, 1, 2].map(c => mark.data[i + c] / 255);
            const a = luminance(bg), b = luminance(fg.map((v, c) => alpha * v + (1 - alpha) * bg[c]));
            ratios.push((Math.max(a, b) + .05) / (Math.min(a, b) + .05));
            sum += a;
            squares += a * a;
        }
    if (!ratios.length)
        throw new Error('Mark has no legible strokes at output size.');
    ratios.sort((a, b) => a - b);
    const n = ratios.length;
    return { paper, contrast: ratios[Math.floor((n - 1) * .1)], medianContrast: ratios[Math.floor((n - 1) * .5)],
        passingFraction: ratios.filter(v => v >= minimumContrast).length / n,
        backgroundDeviation: Math.sqrt(Math.max(0, squares / n - (sum / n) ** 2)) };
}
export function selectPlacement({ base, mark, candidates, palette, excluded = [], random, minimumContrast = 3.2, gap = 12 }) {
    const viable = [];
    for (const p of candidates) {
        if (excluded.some(r => overlaps({ ...p, width: mark.width, height: mark.height }, r, gap)))
            continue;
        for (const ink of palette) {
            const m = strokeMetrics(base, mark, p.x, p.y, hexRgb(ink.hex), minimumContrast);
            if (!m?.paper || m.passingFraction < .9)
                continue;
            viable.push({ ...p, ink: { ...ink, contrast: m.contrast }, metrics: m });
        }
    }
    if (!viable.length)
        throw new Error('No safe location-seal placement: revise composition, exclusions or explicit position; contrast is never relaxed.');
    viable.sort((a, b) => a.metrics.backgroundDeviation - b.metrics.backgroundDeviation || b.metrics.contrast - a.metrics.contrast);
    const shortlist = viable.filter(v => v.metrics.backgroundDeviation <= viable[0].metrics.backgroundDeviation + .015).slice(0, 8);
    return shortlist[Math.floor(random() * shortlist.length)];
}
