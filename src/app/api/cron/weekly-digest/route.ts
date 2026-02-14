import { NextResponse } from 'next/server';
import { getRegistry, getProfileByUsername } from '@/lib/github/queries';
import { getHireRequests, getBuilderReviews, getBuilderEndorsementCount } from '@/lib/github/issues';
import { sendDigest } from '@/lib/email/send';
import type { DigestData } from '@/lib/email/send';

// Vercel Cron: add to vercel.json: { "crons": [{ "path": "/api/cron/weekly-digest", "schedule": "0 9 * * 1" }] }

export async function POST(req: Request) {
    const authHeader = req.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!process.env.RESEND_API_KEY) {
        return NextResponse.json({ error: 'RESEND_API_KEY not configured' }, { status: 500 });
    }

    try {
        const registry = await getRegistry();
        const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
        let sent = 0;
        let skipped = 0;

        const allProfiles = await Promise.all(registry.users.map(u => getProfileByUsername(u.username)));
        const ranked = allProfiles
            .filter(Boolean)
            .sort((a, b) => (b!.total_views || 0) - (a!.total_views || 0));

        for (const user of registry.users) {
            const profile = await getProfileByUsername(user.username);
            if (!profile) { skipped++; continue; }
            if (profile.email_notifications === false) { skipped++; continue; }

            const email = `${user.username}@users.noreply.github.com`;

            const [hireRequests, reviews, endorsementCount] = await Promise.all([
                getHireRequests(user.username, 'all'),
                getBuilderReviews(user.username),
                getBuilderEndorsementCount(user.username),
            ]);

            const newHireRequests = hireRequests.filter(r => r.created_at >= oneWeekAgo).length;
            const newReviews = reviews.filter(r => r.created_at >= oneWeekAgo).length;
            const leaderboardRank = ranked.findIndex(p => p!.username === user.username) + 1;

            const digestData: DigestData = {
                builderName: profile.name,
                username: user.username,
                newViews: profile.total_views || 0,
                newHireRequests,
                newReviews,
                leaderboardRank: leaderboardRank > 0 ? leaderboardRank : null,
                newEndorsements: endorsementCount,
            };

            if (newHireRequests > 0 || newReviews > 0 || (profile.total_views || 0) > 0) {
                const ok = await sendDigest(email, digestData);
                if (ok) sent++; else skipped++;
            } else {
                skipped++;
            }
        }

        return NextResponse.json({ sent, skipped, total: registry.users.length });
    } catch (error) {
        console.error('Digest cron error:', error);
        return NextResponse.json({ error: 'Internal error' }, { status: 500 });
    }
}
