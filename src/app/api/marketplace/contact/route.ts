import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { createHireRequest, getHireRequests, updateHireRequestStatus } from '@/lib/github/issues';
import { getProfileByUsername } from '@/lib/github/queries';

export async function POST(req: NextRequest) {
    const { username, name, email, description, budget, timeline } = await req.json();
    if (!username || !name || !email || !description) {
        return NextResponse.json({ error: 'username, name, email, description required' }, { status: 400 });
    }

    // Get builder's skills for labels
    const profile = await getProfileByUsername(username);
    const skills = profile?.skills || [];

    const result = await createHireRequest(username, { name, email, description, budget: budget || '', timeline: timeline || '' }, skills);
    if (!result) return NextResponse.json({ error: 'Failed to create request' }, { status: 500 });
    return NextResponse.json({ ok: true, issue_number: result.issue_number, html_url: result.html_url });
}

export async function GET(req: NextRequest) {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const username = (session.user as { username?: string }).username;
    if (!username) return NextResponse.json({ error: 'No username' }, { status: 400 });

    const { searchParams } = new URL(req.url);
    const state = (searchParams.get('state') || 'open') as 'open' | 'closed' | 'all';
    const requests = await getHireRequests(username, state, (session as { accessToken?: string }).accessToken);
    return NextResponse.json({ requests });
}

export async function PUT(req: NextRequest) {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { issue_number, state } = await req.json();
    if (!issue_number || !state) return NextResponse.json({ error: 'issue_number and state required' }, { status: 400 });
    const ok = await updateHireRequestStatus(issue_number, state, (session as { accessToken?: string }).accessToken);
    return NextResponse.json({ ok });
}
