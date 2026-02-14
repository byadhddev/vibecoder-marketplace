import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { createReview, getBuilderReviews } from '@/lib/github/issues';

export async function POST(req: NextRequest) {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: 'Sign in to leave a review' }, { status: 401 });
    const reviewerGithub = (session.user as { username?: string }).username;
    if (!reviewerGithub) return NextResponse.json({ error: 'No username' }, { status: 400 });

    const { builder_username, stars, body } = await req.json();
    if (!builder_username || !stars || !body) {
        return NextResponse.json({ error: 'builder_username, stars, body required' }, { status: 400 });
    }

    const result = await createReview(
        builder_username, stars, body, reviewerGithub,
        (session as { accessToken?: string }).accessToken,
    );
    if (!result) return NextResponse.json({ error: 'Failed to create review' }, { status: 500 });
    return NextResponse.json({ ok: true, ...result });
}

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const builder = searchParams.get('builder');
    if (!builder) return NextResponse.json({ error: 'builder param required' }, { status: 400 });

    const reviews = await getBuilderReviews(builder);
    const avgStars = reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.stars, 0) / reviews.length
        : 0;

    return NextResponse.json({ reviews, count: reviews.length, avg_stars: Math.round(avgStars * 10) / 10 });
}
