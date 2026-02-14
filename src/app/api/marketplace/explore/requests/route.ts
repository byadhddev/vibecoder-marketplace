import { NextResponse } from 'next/server';
import { getRecentHireRequests } from '@/lib/github/issues';

export async function GET() {
    try {
        const requests = await getRecentHireRequests(5);
        return NextResponse.json({
            requests: requests.map(r => ({
                issue_number: r.issue_number,
                description: r.description,
                html_url: r.html_url,
                created_at: r.created_at,
                builder: (r as unknown as { builder?: string }).builder || '',
            })),
        });
    } catch {
        return NextResponse.json({ requests: [] });
    }
}
