import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { addEarning, getEarnings } from '@/lib/github/queries';

export async function POST(req: NextRequest) {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const username = (session.user as { username?: string }).username;
    if (!username) return NextResponse.json({ error: 'No username' }, { status: 400 });

    const { amount, currency, client_name, showcase_id, note, proof_url } = await req.json();
    if (!amount || amount <= 0) return NextResponse.json({ error: 'Valid amount required' }, { status: 400 });

    const earning = await addEarning(username, { amount, currency, client_name, showcase_id, note, proof_url }, (session as { accessToken?: string }).accessToken);
    return earning ? NextResponse.json({ earning }) : NextResponse.json({ error: 'Failed' }, { status: 500 });
}

export async function GET() {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const username = (session.user as { username?: string }).username;
    if (!username) return NextResponse.json({ error: 'No username' }, { status: 400 });
    const data = await getEarnings(username, (session as { accessToken?: string }).accessToken);
    return NextResponse.json(data);
}
