import { NextRequest, NextResponse } from 'next/server';
import { trackShowcaseClick, incrementShowcaseViews, incrementProfileViews } from '@/lib/github/queries';

export async function POST(req: NextRequest) {
    const { showcase_id, username, type } = (await req.json()) as { showcase_id?: string; username?: string; type?: 'click' | 'view' | 'page_view' };
    if (type === 'page_view' && username) {
        await incrementProfileViews(username);
        return NextResponse.json({ ok: true });
    }
    if (!showcase_id || !type) return NextResponse.json({ error: 'showcase_id and type required' }, { status: 400 });
    const referrer = req.headers.get('referer') || '';
    const userAgent = req.headers.get('user-agent') || '';
    if (type === 'click') await trackShowcaseClick(showcase_id, referrer, userAgent);
    else await incrementShowcaseViews(showcase_id);
    return NextResponse.json({ ok: true });
}
