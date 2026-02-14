import { NextRequest, NextResponse } from 'next/server';
import { getRegistry, getShowcasesByProfileId, getProfileByUsername } from '@/lib/github/queries';

interface SearchResult {
    type: 'builder' | 'showcase';
    title: string;
    subtitle: string;
    url: string;
    avatar_url?: string;
    tags?: string[];
    score: number;
}

function matchScore(query: string, ...fields: (string | undefined)[]): number {
    const q = query.toLowerCase();
    let score = 0;
    for (const field of fields) {
        if (!field) continue;
        const f = field.toLowerCase();
        if (f === q) score += 10;
        else if (f.startsWith(q)) score += 5;
        else if (f.includes(q)) score += 2;
    }
    return score;
}

function matchArray(query: string, items: string[]): number {
    const q = query.toLowerCase();
    return items.reduce((s, item) => {
        const i = item.toLowerCase();
        if (i === q) return s + 8;
        if (i.startsWith(q)) return s + 4;
        if (i.includes(q)) return s + 1;
        return s;
    }, 0);
}

export async function GET(req: NextRequest) {
    const q = req.nextUrl.searchParams.get('q')?.trim();
    if (!q || q.length < 2) return NextResponse.json({ results: [], query: q || '' });

    try {
        const registry = await getRegistry();
        const results: SearchResult[] = [];

        // Search builders
        for (const u of registry.users) {
            const profile = await getProfileByUsername(u.username);
            if (!profile) continue;

            const nameScore = matchScore(q, profile.name, profile.username);
            const roleScore = matchScore(q, profile.role);
            const skillScore = matchArray(q, profile.skills || []);
            const total = nameScore + roleScore + skillScore;

            if (total > 0) {
                results.push({
                    type: 'builder',
                    title: profile.name,
                    subtitle: profile.role || 'Builder',
                    url: `/m/${profile.username}`,
                    avatar_url: profile.avatar_url,
                    tags: (profile.skills || []).slice(0, 4),
                    score: total,
                });
            }

            // Search showcases for this builder
            const showcases = await getShowcasesByProfileId(profile.username);
            for (const s of showcases.filter(s => s.status === 'published')) {
                const titleScore = matchScore(q, s.title);
                const descScore = matchScore(q, s.description);
                const tagScore = matchArray(q, s.tags || []);
                const toolScore = matchArray(q, s.ai_tools || []);
                const sTotal = titleScore + descScore + tagScore + toolScore;

                if (sTotal > 0) {
                    results.push({
                        type: 'showcase',
                        title: s.title,
                        subtitle: `by ${profile.name}`,
                        url: `/m/${profile.username}/${s.slug}`,
                        avatar_url: profile.avatar_url,
                        tags: (s.tags || []).slice(0, 4),
                        score: sTotal,
                    });
                }
            }
        }

        results.sort((a, b) => b.score - a.score);

        return NextResponse.json({ results: results.slice(0, 20), query: q });
    } catch {
        return NextResponse.json({ results: [], query: q });
    }
}
