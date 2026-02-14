import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin';
import { getRegistry, getShowcasesByProfileId, getProfileByUsername } from '@/lib/github/queries';
import { getOpenHireRequestCount, getBuilderReviews } from '@/lib/github/issues';

export async function GET() {
    const { isAdmin: admin } = await isAdmin();
    if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    try {
        const registry = await getRegistry();
        const users = registry.users;

        let totalShowcases = 0;
        let totalViews = 0;
        let totalReviews = 0;
        const builders: {
            username: string;
            name: string;
            avatar_url: string;
            role: string;
            showcase_count: number;
            total_views: number;
            available_for_hire: boolean;
            created_at: string;
        }[] = [];

        for (const u of users) {
            const profile = await getProfileByUsername(u.username);
            const showcases = await getShowcasesByProfileId(u.username);
            const published = showcases.filter(s => s.status === 'published');
            totalShowcases += published.length;
            totalViews += profile?.total_views || 0;

            builders.push({
                username: u.username,
                name: profile?.name || u.name,
                avatar_url: profile?.avatar_url || u.avatar_url,
                role: profile?.role || '',
                showcase_count: published.length,
                total_views: profile?.total_views || 0,
                available_for_hire: profile?.available_for_hire || false,
                created_at: profile?.created_at || '',
            });

            const reviews = await getBuilderReviews(u.username);
            totalReviews += reviews.length;
        }

        const openRequests = await getOpenHireRequestCount();

        // GitHub API rate limit check
        let rateLimit = { remaining: 0, limit: 0, reset: '' };
        try {
            const token = process.env.GITHUB_APP_TOKEN || process.env.GITHUB_CLIENT_SECRET || '';
            const rlRes = await fetch('https://api.github.com/rate_limit', {
                headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json' },
            });
            if (rlRes.ok) {
                const rl = await rlRes.json();
                rateLimit = {
                    remaining: rl.rate?.remaining || 0,
                    limit: rl.rate?.limit || 0,
                    reset: new Date((rl.rate?.reset || 0) * 1000).toISOString(),
                };
            }
        } catch { /* ignore */ }

        return NextResponse.json({
            stats: {
                total_builders: users.length,
                total_showcases: totalShowcases,
                total_views: totalViews,
                open_hire_requests: openRequests,
                total_reviews: totalReviews,
            },
            builders: builders.sort((a, b) => (b.total_views || 0) - (a.total_views || 0)),
            rate_limit: rateLimit,
        });
    } catch (error) {
        console.error('Admin API error:', error);
        return NextResponse.json({ error: 'Internal error' }, { status: 500 });
    }
}
