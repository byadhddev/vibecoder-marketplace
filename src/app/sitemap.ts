import type { MetadataRoute } from 'next';
import { getRegistry, getShowcasesByProfileId } from '@/lib/github/queries';

const BASE = process.env.NEXT_PUBLIC_APP_URL || 'https://vibecoder.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const staticPages: MetadataRoute.Sitemap = [
        { url: BASE, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
        { url: `${BASE}/explore`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
        { url: `${BASE}/leaderboard`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.7 },
    ];

    try {
        const registry = await getRegistry();
        const profilePages: MetadataRoute.Sitemap = registry.users.map(u => ({
            url: `${BASE}/m/${u.username}`,
            lastModified: new Date(),
            changeFrequency: 'weekly' as const,
            priority: 0.8,
        }));

        const showcasePages: MetadataRoute.Sitemap = [];
        for (const u of registry.users) {
            const showcases = await getShowcasesByProfileId(u.username);
            for (const s of showcases.filter(s => s.status === 'published')) {
                showcasePages.push({
                    url: `${BASE}/m/${u.username}/${s.slug}`,
                    lastModified: new Date(s.updated_at || s.created_at),
                    changeFrequency: 'weekly',
                    priority: 0.6,
                });
            }
        }

        return [...staticPages, ...profilePages, ...showcasePages];
    } catch {
        return staticPages;
    }
}
