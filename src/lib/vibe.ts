/**
 * Vibe Tile Design System
 * Ported from Artode Lab's Minis page — the editorial tile grid with
 * radial gradient vibes, accent lines, and random shuffle.
 */

// Radial gradient backgrounds for vibe mode
export const VIBE_BGS = [
    'radial-gradient(circle at center, rgba(179, 32, 31, 0.15) 0%, rgba(255, 255, 255, 0) 70%)',
    'radial-gradient(circle at center, rgba(18, 43, 178, 0.15) 0%, rgba(255, 255, 255, 0) 70%)',
    'radial-gradient(circle at center, rgba(202, 138, 4, 0.15) 0%, rgba(255, 255, 255, 0) 70%)',
    'radial-gradient(circle at center, rgba(220, 38, 38, 0.12) 0%, rgba(255, 255, 255, 0) 70%)',
    'radial-gradient(circle at center, rgba(30, 64, 175, 0.12) 0%, rgba(255, 255, 255, 0) 70%)',
];

// Tailwind text color classes for vibe mode
export const VIBE_TEXT_COLORS = [
    'text-[#B3201F]',
    'text-[#122BB2]',
    'text-[#a16207]',
    'text-[#dc2626]',
    'text-[#1e40af]',
];

// Raw hex colors for inline styles
export const VIBE_RAW_COLORS = ['#B3201F', '#122BB2', '#a16207', '#dc2626', '#1e40af'];

// Accent colors for editorial lines
export const ACCENTS = ['#D80018', '#122BB2', '#37352f', '#9b9a97', '#B3201F', '#122BB2', '#D80018', '#37352f'];

// Helpers
export function vibeColor(index: number) { return VIBE_BGS[index % VIBE_BGS.length]; }
export function vibeText(index: number) { return VIBE_TEXT_COLORS[index % VIBE_TEXT_COLORS.length]; }
export function vibeRaw(index: number) { return VIBE_RAW_COLORS[index % VIBE_RAW_COLORS.length]; }

// Fisher-Yates shuffle
export function randomShuffle<T>(array: T[]): T[] {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
}

// Grid wrapper classes (the 1px-gap bordered grid)
export const GRID_CLASSES = 'border border-vc-border rounded-lg overflow-hidden bg-vc-border grid grid-cols-2 md:grid-cols-4 gap-px';
