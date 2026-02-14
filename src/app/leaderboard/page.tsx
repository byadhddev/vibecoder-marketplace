import { Suspense } from 'react';
import { getRegistry, getProfileByUsername } from '@/lib/github/queries';
import LeaderboardClient from './LeaderboardClient';
import LeaderboardLoading from './loading';

async function getLeaderboardData() {
    'use cache';
    const registry = await getRegistry();
    const allBuilders = await Promise.all(
        registry.users.map(u => getProfileByUsername(u.username))
    );
    return allBuilders.filter(Boolean).map(p => ({
        username: p!.username, name: p!.name, avatar_url: p!.avatar_url,
        role: p!.role || '', skills: p!.skills || [],
        available_for_hire: p!.available_for_hire || false,
        showcase_count: p!.showcase_count || 0,
        total_views: p!.total_views || 0,
        hourly_rate: p!.hourly_rate || 0,
        created_at: p!.created_at || '',
    }));
}

export default async function LeaderboardPage() {
    const builders = await getLeaderboardData();
    return (
        <Suspense fallback={<LeaderboardLoading />}>
            <LeaderboardClient initialBuilders={builders} />
        </Suspense>
    );
}
