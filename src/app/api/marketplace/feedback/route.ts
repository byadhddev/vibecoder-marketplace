import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { createShowcaseFeedback, getShowcaseFeedback, getBuilderFeedback } from '@/lib/github/issues';

export async function POST(req: NextRequest) {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: 'Sign in to leave feedback' }, { status: 401 });
    const authorGithub = (session.user as { username?: string }).username;
    if (!authorGithub) return NextResponse.json({ error: 'No username' }, { status: 400 });

    const { builder_username, showcase_slug, showcase_title, body } = await req.json();
    if (!builder_username || !showcase_slug || !showcase_title || !body) {
        return NextResponse.json({ error: 'builder_username, showcase_slug, showcase_title, body required' }, { status: 400 });
    }

    const result = await createShowcaseFeedback(
        builder_username, showcase_slug, showcase_title, body, authorGithub,
        (session as { accessToken?: string }).accessToken,
    );
    if (!result) return NextResponse.json({ error: 'Failed to create feedback' }, { status: 500 });
    return NextResponse.json({ ok: true, ...result });
}

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const builder = searchParams.get('builder');
    const showcase = searchParams.get('showcase');

    if (builder && showcase) {
        const feedback = await getShowcaseFeedback(builder, showcase);
        return NextResponse.json({ feedback, count: feedback.length });
    }
    if (builder) {
        const feedback = await getBuilderFeedback(builder);
        return NextResponse.json({ feedback, count: feedback.length });
    }
    return NextResponse.json({ error: 'builder param required' }, { status: 400 });
}
