import { NextRequest, NextResponse } from 'next/server';
import { fetchOGMetadata } from '@/lib/og-metadata';

export async function POST(req: NextRequest) {
    const { url } = (await req.json()) as { url?: string };
    if (!url) return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    try { new URL(url); } catch { return NextResponse.json({ error: 'Invalid URL' }, { status: 400 }); }
    const metadata = await fetchOGMetadata(url);
    return NextResponse.json(metadata);
}
