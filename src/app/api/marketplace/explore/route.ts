import { NextResponse } from 'next/server';
import { getRegistry, getShowcasesByProfileId, getProfileByUsername } from '@/lib/github/queries';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const tag = searchParams.get('tag');
        const skill = searchParams.get('skill');
        const available = searchParams.get('available');
        const registry = await getRegistry();

        // Filter users by availability/skill if requested
        let users = registry.users;
        if (available === 'true') users = users.filter(u => u.available_for_hire);
        if (skill) users = users.filter(u => (u.skills || []).some(s => s.toLowerCase() === skill.toLowerCase()));

        const allShowcases = await Promise.all(
            users.map(async (u) => {
                const showcases = await getShowcasesByProfileId(u.username);
                return showcases
                    .filter(s => s.status === 'published')
                    .map(s => ({ ...s, _user: { username: u.username, name: u.name, avatar_url: u.avatar_url } }));
            })
        );

        let flat = allShowcases.flat();
        if (tag) flat = flat.filter(s => s.tags.some(t => t.toLowerCase() === tag.toLowerCase()));
        flat.sort((a, b) => (b.views_count || 0) - (a.views_count || 0));

        // Collect all tags and skills
        const tagSet = new Set<string>();
        flat.forEach(s => s.tags.forEach(t => tagSet.add(t)));
        const skillSet = new Set<string>();
        registry.users.forEach(u => (u.skills || []).forEach(s => skillSet.add(s)));

        // Fetch profiles for builders
        const allBuilders = await Promise.all(
            registry.users.map(u => getProfileByUsername(u.username))
        );

        return NextResponse.json({
            showcases: flat,
            tags: [...tagSet].sort(),
            skills: [...skillSet].sort(),
            total: flat.length,
            builders: allBuilders.filter(Boolean).map(p => ({
                username: p!.username, name: p!.name, avatar_url: p!.avatar_url,
                role: p!.role, skills: p!.skills || [], hourly_rate: p!.hourly_rate || 0,
                rate_type: p!.rate_type || 'negotiable', showcase_count: p!.showcase_count || 0,
                total_views: p!.total_views || 0, available_for_hire: p!.available_for_hire || false,
                created_at: p!.created_at || '',
            })),
        });
    } catch (error) {
        console.error('Explore API error:', error);
        return NextResponse.json({ showcases: [], tags: [], skills: [], total: 0, builders: [] });
    }
}
