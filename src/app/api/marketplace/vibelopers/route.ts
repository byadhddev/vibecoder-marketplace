import { NextResponse } from 'next/server';
import { getRegistry } from '@/lib/github/queries';

export async function GET() {
    try {
        const registry = await getRegistry();
        return NextResponse.json({ vibelopers: registry.users, total: registry.users.length });
    } catch (error) {
        console.error('Failed to fetch vibelopers:', error);
        return NextResponse.json({ vibelopers: [], total: 0 });
    }
}
