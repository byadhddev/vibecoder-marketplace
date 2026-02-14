import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { submitContactRequest, getContactRequests, updateContactRequestStatus } from '@/lib/github/queries';

export async function POST(req: NextRequest) {
    const { username, name, email, description, budget, timeline } = await req.json();
    if (!username || !name || !email || !description) {
        return NextResponse.json({ error: 'username, name, email, description required' }, { status: 400 });
    }
    const ok = await submitContactRequest(username, { name, email, description, budget: budget || '', timeline: timeline || '' });
    return NextResponse.json({ ok });
}

export async function GET() {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const username = (session.user as { username?: string }).username;
    if (!username) return NextResponse.json({ error: 'No username' }, { status: 400 });
    const requests = await getContactRequests(username, (session as { accessToken?: string }).accessToken);
    return NextResponse.json({ requests });
}

export async function PUT(req: NextRequest) {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const username = (session.user as { username?: string }).username;
    if (!username) return NextResponse.json({ error: 'No username' }, { status: 400 });
    const { request_id, status } = await req.json();
    if (!request_id || !status) return NextResponse.json({ error: 'request_id and status required' }, { status: 400 });
    const ok = await updateContactRequestStatus(username, request_id, status, (session as { accessToken?: string }).accessToken);
    return NextResponse.json({ ok });
}
