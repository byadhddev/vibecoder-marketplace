import { NextRequest, NextResponse } from 'next/server';
import { getAvgResponseTime } from '@/lib/github/issues';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const builder = searchParams.get('builder');
    if (!builder) return NextResponse.json({ error: 'builder param required' }, { status: 400 });

    const result = await getAvgResponseTime(builder);
    if (!result) return NextResponse.json({ avg_hours: null, label: null });

    const label = result.avgHours < 1 ? '< 1h' : result.avgHours < 24 ? `~${Math.round(result.avgHours)}h` : `~${Math.round(result.avgHours / 24)}d`;
    return NextResponse.json({ avg_hours: result.avgHours, count: result.count, label });
}
