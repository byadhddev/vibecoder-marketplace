import { NextResponse } from 'next/server';
import {
    checkDiscussionsEnabled,
    getRecentDiscussions,
    getDiscussionsUrl,
    getNewDiscussionUrl,
    DISCUSSION_CATEGORIES,
} from '@/lib/github/issues';

export async function GET() {
    try {
        const enabled = await checkDiscussionsEnabled();
        if (!enabled) {
            return NextResponse.json({
                enabled: false,
                discussions: [],
                categories: DISCUSSION_CATEGORIES,
                urls: { discussions: getDiscussionsUrl() },
            });
        }

        const discussions = await getRecentDiscussions(6);
        return NextResponse.json({
            enabled: true,
            discussions,
            categories: DISCUSSION_CATEGORIES.map(c => ({
                ...c,
                url: getNewDiscussionUrl(c.name),
            })),
            urls: {
                discussions: getDiscussionsUrl(),
                new: getNewDiscussionUrl(),
            },
        }, {
            headers: { 'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=300' },
        });
    } catch {
        return NextResponse.json({ enabled: false, discussions: [], categories: [] });
    }
}
