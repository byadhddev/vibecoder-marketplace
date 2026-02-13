import { NextRequest, NextResponse } from 'next/server';
import { auth, type ExtendedSession } from '@/auth';
import { getShowcasesByProfileId, createShowcase, updateShowcase, deleteShowcase } from '@/lib/github/queries';
import type { ShowcaseInput } from '@/lib/db/types';

async function getSession() {
    return (await auth()) as ExtendedSession | null;
}

export async function GET() {
    const session = await getSession();
    if (!session?.user?.username) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const username = session.user.username;
    const showcases = await getShowcasesByProfileId(username, true);
    return NextResponse.json({ showcases, username });
}

export async function POST(req: NextRequest) {
    const session = await getSession();
    if (!session?.user?.username || !session.accessToken) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const body = (await req.json()) as ShowcaseInput;
    if (!body.title || !body.url) return NextResponse.json({ error: 'Title and URL are required' }, { status: 400 });
    const showcase = await createShowcase(session.user.username, body, session.accessToken);
    if (!showcase) return NextResponse.json({ error: 'Failed to create' }, { status: 500 });
    return NextResponse.json({ showcase }, { status: 201 });
}

export async function PUT(req: NextRequest) {
    const session = await getSession();
    if (!session?.user?.username || !session.accessToken) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const body = await req.json();
    const { id, ...input } = body as { id: string } & Partial<ShowcaseInput>;
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });
    const showcase = await updateShowcase(id, session.user.username, input, session.accessToken);
    if (!showcase) return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
    return NextResponse.json({ showcase });
}

export async function DELETE(req: NextRequest) {
    const session = await getSession();
    if (!session?.user?.username || !session.accessToken) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });
    const ok = await deleteShowcase(id, session.user.username, session.accessToken);
    if (!ok) return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
    return NextResponse.json({ ok: true });
}
