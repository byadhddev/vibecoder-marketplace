import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { endorseShowcase, getShowcaseEndorsements } from '@/lib/github/issues';

export async function POST(req: NextRequest) {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: 'Sign in to endorse' }, { status: 401 });
    const endorserGithub = (session.user as { username?: string }).username;
    if (!endorserGithub) return NextResponse.json({ error: 'No username' }, { status: 400 });

    const { builder_username, showcase_slug, showcase_title } = await req.json();
    if (!builder_username || !showcase_slug || !showcase_title) {
        return NextResponse.json({ error: 'builder_username, showcase_slug, showcase_title required' }, { status: 400 });
    }

    const result = await endorseShowcase(
        builder_username, showcase_slug, showcase_title, endorserGithub,
        (session as { accessToken?: string }).accessToken,
    );
    if (!result) return NextResponse.json({ error: 'Failed to endorse' }, { status: 500 });
    return NextResponse.json({ ok: true, ...result });
}

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const builder = searchParams.get('builder');
    const showcase = searchParams.get('showcase');
    if (!builder || !showcase) return NextResponse.json({ error: 'builder and showcase params required' }, { status: 400 });

    const endorsements = await getShowcaseEndorsements(builder, showcase);
    return NextResponse.json({ endorsements, count: endorsements.length });
}
