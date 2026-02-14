import { NextRequest, NextResponse } from 'next/server';
import { getShowcasesByProfileId, getProfileByUsername, getEarnings } from '@/lib/github/queries';
import { getRepeatHiredCount } from '@/lib/github/issues';
import { computeBadges } from '@/lib/badges';
import type { Earning } from '@/lib/db/types';

export async function GET(req: NextRequest) {
    const username = req.nextUrl.searchParams.get('builder');
    const rankParam = req.nextUrl.searchParams.get('rank');
    if (!username) return NextResponse.json({ error: 'builder required' }, { status: 400 });

    try {
        const [showcases, profile, earningsStore, repeatHired] = await Promise.all([
            getShowcasesByProfileId(username),
            getProfileByUsername(username),
            getEarnings(username),
            getRepeatHiredCount(username),
        ]);

        const totalEarned = earningsStore.earnings.reduce((s: number, e: Earning) => s + e.amount, 0);
        const rank = rankParam ? parseInt(rankParam, 10) : undefined;

        const badges = computeBadges({
            showcases: showcases.filter(s => s.status === 'published'),
            totalEarned: totalEarned,
            leaderboardRank: rank,
            repeatHiredCount: repeatHired,
        });

        return NextResponse.json({ badges }, {
            headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' },
        });
    } catch {
        return NextResponse.json({ badges: [] });
    }
}
