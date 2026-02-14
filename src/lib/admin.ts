import { auth } from '@/auth';

/** Get admin usernames from env var (comma-separated) */
function getAdminUsernames(): string[] {
    const raw = process.env.ADMIN_USERNAMES || '';
    return raw.split(',').map(u => u.trim().toLowerCase()).filter(Boolean);
}

/** Check if the current session user is an admin */
export async function isAdmin(): Promise<{ isAdmin: boolean; username: string }> {
    const session = await auth();
    if (!session?.user) return { isAdmin: false, username: '' };
    const username = ((session.user as { username?: string }).username || session.user.name || '').toLowerCase();
    const admins = getAdminUsernames();
    return { isAdmin: admins.includes(username), username };
}
