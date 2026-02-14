import { NextResponse } from 'next/server';
import { readJSON, writeJSON, branchExists, createOrphanBranch } from '@/lib/github/client';

const WAITLIST_BRANCH = `${process.env.GITHUB_DATA_ENV || 'prod'}/waitlist`;
const WAITLIST_FILE = 'entries.json';

function appToken(): string {
    return process.env.GITHUB_APP_TOKEN || process.env.GITHUB_CLIENT_SECRET || '';
}

interface WaitlistEntry {
    email: string;
    joined_at: string;
}

interface WaitlistData {
    entries: WaitlistEntry[];
}

async function ensureWaitlistBranch(): Promise<boolean> {
    const exists = await branchExists(WAITLIST_BRANCH);
    if (exists) return true;
    const token = appToken();
    if (!token) return false;
    return createOrphanBranch(WAITLIST_BRANCH, token);
}

async function getWaitlistData(): Promise<{ data: WaitlistData; sha: string } | null> {
    return readJSON<WaitlistData>(WAITLIST_FILE, WAITLIST_BRANCH, undefined, 60);
}

/** GET — return waitlist count */
export async function GET() {
    try {
        const result = await getWaitlistData();
        const count = result?.data?.entries?.length ?? 0;
        return NextResponse.json({ count }, {
            headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120' },
        });
    } catch {
        return NextResponse.json({ count: 0 });
    }
}

/** POST — add email to waitlist */
export async function POST(req: Request) {
    try {
        const { email } = await req.json();
        if (!email || typeof email !== 'string') {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 });
        }

        const normalized = email.toLowerCase().trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(normalized)) {
            return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
        }

        const token = appToken();
        if (!token) {
            return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
        }

        await ensureWaitlistBranch();

        const existing = await readJSON<WaitlistData>(WAITLIST_FILE, WAITLIST_BRANCH, token);
        const entries = existing?.data?.entries ?? [];

        // Duplicate check
        if (entries.some(e => e.email === normalized)) {
            return NextResponse.json({
                ok: true,
                message: "You're already on the list!",
                count: entries.length,
            });
        }

        const newEntry: WaitlistEntry = {
            email: normalized,
            joined_at: new Date().toISOString(),
        };

        const updated: WaitlistData = { entries: [...entries, newEntry] };
        await writeJSON(WAITLIST_FILE, WAITLIST_BRANCH, updated, token, `Add waitlist entry`, existing?.sha);

        return NextResponse.json({
            ok: true,
            message: "You're in! We'll be in touch soon.",
            count: updated.entries.length,
        });
    } catch (error) {
        console.error('Waitlist POST error:', error);
        return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
    }
}
