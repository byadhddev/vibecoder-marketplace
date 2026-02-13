import { NextResponse } from 'next/server';
import { getRegistry, getShowcasesByProfileId } from '@/lib/github/queries';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const tag = searchParams.get('tag');
        const registry = await getRegistry();

        const allShowcases = await Promise.all(
            registry.users.map(async (u) => {
                const showcases = await getShowcasesByProfileId(u.username);
                return showcases
                    .filter(s => s.status === 'published')
                    .map(s => ({ ...s, _user: { username: u.username, name: u.name, avatar_url: u.avatar_url } }));
            })
        );

        let flat = allShowcases.flat();
        if (tag) flat = flat.filter(s => s.tags.some(t => t.toLowerCase() === tag.toLowerCase()));
        flat.sort((a, b) => (b.views_count || 0) - (a.views_count || 0));

        // Collect all tags
        const tagSet = new Set<string>();
        flat.forEach(s => s.tags.forEach(t => tagSet.add(t)));

        return NextResponse.json({ showcases: flat, tags: [...tagSet].sort(), total: flat.length });
    } catch (error) {
        console.error('Explore API error:', error);
        return NextResponse.json({ showcases: [], tags: [], total: 0 });
    }
}
