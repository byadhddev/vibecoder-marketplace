/**
 * Extract dominant colors from an image using canvas pixel analysis.
 * Adapted from the lab's VibeloperLanding approach.
 */

type RGB = [number, number, number];

export interface ExtractedColors {
    primary: string;    // hex
    secondary: string;  // hex
}

function rgbToHex([r, g, b]: RGB): string {
    return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
}

function avg(bucket: { sum: [number, number, number]; count: number }): RGB {
    return [
        Math.round(bucket.sum[0] / bucket.count),
        Math.round(bucket.sum[1] / bucket.count),
        Math.round(bucket.sum[2] / bucket.count),
    ];
}

export function extractColorsFromImage(src: string): Promise<ExtractedColors> {
    return new Promise((resolve) => {
        const fallback: ExtractedColors = { primary: '#d80018', secondary: '#242423' };
        if (typeof window === 'undefined') { resolve(fallback); return; }

        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
            try {
                const cvs = document.createElement('canvas');
                const sz = 64;
                cvs.width = sz; cvs.height = sz;
                const ctx = cvs.getContext('2d')!;
                ctx.drawImage(img, 0, 0, sz, sz);
                const d = ctx.getImageData(0, 0, sz, sz).data;

                const pixels: RGB[] = [];
                for (let i = 0; i < d.length; i += 16) {
                    const a = d[i + 3];
                    if (a < 128) continue;
                    const lum = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
                    if (lum > 25 && lum < 230) pixels.push([d[i], d[i + 1], d[i + 2]]);
                }

                if (pixels.length === 0) { resolve(fallback); return; }

                // Quantize into 4-bit buckets
                const buckets = new Map<string, { sum: [number, number, number]; count: number }>();
                for (const px of pixels) {
                    const key = `${px[0] >> 4},${px[1] >> 4},${px[2] >> 4}`;
                    const b = buckets.get(key);
                    if (b) {
                        b.sum[0] += px[0]; b.sum[1] += px[1]; b.sum[2] += px[2];
                        b.count++;
                    } else {
                        buckets.set(key, { sum: [px[0], px[1], px[2]], count: 1 });
                    }
                }

                const sorted = [...buckets.values()].sort((a, b) => b.count - a.count);
                const primary = avg(sorted[0]);
                let secondary = primary;
                for (let j = 1; j < sorted.length; j++) {
                    const c = avg(sorted[j]);
                    const dist = Math.sqrt(
                        (c[0] - primary[0]) ** 2 +
                        (c[1] - primary[1]) ** 2 +
                        (c[2] - primary[2]) ** 2
                    );
                    if (dist > 60) { secondary = c; break; }
                }

                resolve({ primary: rgbToHex(primary), secondary: rgbToHex(secondary) });
            } catch {
                resolve(fallback);
            }
        };
        img.onerror = () => resolve(fallback);
        img.src = src;
    });
}
