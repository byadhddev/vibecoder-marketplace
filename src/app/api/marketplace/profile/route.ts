import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import type { ExtendedSession } from '@/auth';
import { getProfileByUsername, updateProfile } from '@/lib/github/queries';

export async function GET() {
    const session = (await auth()) as ExtendedSession | null;
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const profile = await getProfileByUsername(session.user.id);
    if (!profile) {
        return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }
    return NextResponse.json({ profile });
}

export async function PUT(req: Request) {
    const session = (await auth()) as ExtendedSession | null;
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const body = await req.json();
    const updated = await updateProfile(
        session.user.id,
        body,
        session.accessToken,
    );
    if (!updated) {
        return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
    }
    return NextResponse.json({ profile: updated });
}
