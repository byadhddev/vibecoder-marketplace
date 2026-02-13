export interface OGMetadata {
    title: string;
    description: string;
    image: string;
}

export async function fetchOGMetadata(url: string): Promise<OGMetadata> {
    const fallback: OGMetadata = { title: '', description: '', image: '' };
    try {
        const res = await fetch(url, {
            headers: { 'User-Agent': 'VibeCoder-Bot/1.0' },
            signal: AbortSignal.timeout(5000),
        });
        if (!res.ok) return fallback;
        const html = await res.text();
        return {
            title: extractMeta(html, 'og:title') || extractTag(html, 'title') || '',
            description: extractMeta(html, 'og:description') || extractMeta(html, 'description') || '',
            image: extractMeta(html, 'og:image') || '',
        };
    } catch { return fallback; }
}

function extractMeta(html: string, property: string): string {
    const esc = property.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const patterns = [
        new RegExp(`<meta[^>]*(?:property|name)=["']${esc}["'][^>]*content=["']([^"']*)["']`, 'i'),
        new RegExp(`<meta[^>]*content=["']([^"']*)["'][^>]*(?:property|name)=["']${esc}["']`, 'i'),
    ];
    for (const p of patterns) { const m = html.match(p); if (m?.[1]) return m[1].replace(/&amp;/g, '&').replace(/&quot;/g, '"'); }
    return '';
}

function extractTag(html: string, tag: string): string {
    const m = html.match(new RegExp(`<${tag}[^>]*>([^<]*)</${tag}>`, 'i'));
    return m?.[1]?.trim() || '';
}
