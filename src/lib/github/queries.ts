/**
 * GitHub Branch-Based Query Layer
 *
 * Drop-in replacement for src/lib/db/queries.ts.
 * Same function signatures, backed by branch-per-user JSON files.
 */

import {
    branchExists, createOrphanBranch, readJSON, writeJSON, deleteFile,
    listFiles, userBranch, REGISTRY_BRANCH,
} from './client';
import type { Profile, ProfileInput, Showcase, ShowcaseInput, PublicMarketplace } from '@/lib/db/types';

function appToken(): string {
    return process.env.GITHUB_APP_TOKEN || process.env.GITHUB_CLIENT_SECRET || '';
}

function toSlug(title: string): string {
    return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'project';
}

// ─── Registry (global user index) ────────────────────────────

export interface RegistryUser {
    username: string;
    name: string;
    avatar_url: string;
    showcase_count: number;
}

export interface Registry {
    users: RegistryUser[];
    updated_at: string;
}

async function readRegistry(token?: string): Promise<{ data: Registry; sha: string }> {
    const result = await readJSON<Registry>('users.json', REGISTRY_BRANCH, token || appToken(), 60);
    if (result) return result;
    return { data: { users: [], updated_at: new Date().toISOString() }, sha: '' };
}

export async function getRegistry(): Promise<Registry> {
    const { data } = await readRegistry();
    return data;
}

async function updateRegistry(
    updater: (reg: Registry) => Registry,
    token: string,
    message: string,
): Promise<void> {
    const { data, sha } = await readRegistry(token);
    const updated = updater({ ...data, updated_at: new Date().toISOString() });
    await writeJSON('users.json', REGISTRY_BRANCH, updated, token, message, sha || undefined);
}

// ─── Profiles ────────────────────────────────────────────────

export async function getProfileByUsername(username: string): Promise<Profile | null> {
    const branch = userBranch(username);
    const result = await readJSON<Omit<Profile, 'id' | 'user_id'>>('profile.json', branch, undefined, 60);
    if (!result) return null;
    return { ...result.data, id: username, user_id: username } as Profile;
}

export async function getProfileByUserId(userId: string): Promise<Profile | null> {
    // In branch-based model, user_id === username (GitHub login)
    return getProfileByUsername(userId);
}

export async function createProfile(
    userId: string,
    username: string,
    name: string,
    avatarUrl?: string,
): Promise<Profile | null> {
    const token = appToken();
    const branch = userBranch(username);

    // Create user branch if it doesn't exist
    const exists = await branchExists(branch, token);
    if (!exists) {
        const created = await createOrphanBranch(branch, token);
        if (!created) return null;
    }

    const now = new Date().toISOString();
    const profile: Omit<Profile, 'id' | 'user_id'> = {
        username,
        name,
        role: '',
        bio: '',
        avatar_url: avatarUrl || '',
        website: '',
        location: '',
        social_links: {},
        showcase_count: 0,
        total_views: 0,
        total_clicks: 0,
        plan: 'free',
        created_at: now,
        updated_at: now,
    };

    const wrote = await writeJSON('profile.json', branch, profile, token, `Create profile for ${username}`);
    if (!wrote) return null;

    // Add to registry
    await updateRegistry(
        reg => ({
            ...reg,
            users: [...reg.users.filter(u => u.username !== username), {
                username, name, avatar_url: avatarUrl || '', showcase_count: 0,
            }],
        }),
        token,
        `Register user ${username}`,
    );

    return { ...profile, id: username, user_id: userId } as Profile;
}

export async function updateProfile(
    username: string,
    input: ProfileInput,
    token?: string,
): Promise<Profile | null> {
    const t = token || appToken();
    const branch = userBranch(username);
    const result = await readJSON<Omit<Profile, 'id' | 'user_id'>>('profile.json', branch, t);
    if (!result) return null;

    const updated = {
        ...result.data,
        ...input,
        social_links: { ...(result.data.social_links || {}), ...(input.social_links || {}) },
        updated_at: new Date().toISOString(),
    };

    const wrote = await writeJSON('profile.json', branch, updated, t, `Update profile for ${username}`, result.sha);
    if (!wrote) return null;

    // Update registry name if changed
    if (input.name) {
        await updateRegistry(
            reg => ({
                ...reg,
                users: reg.users.map(u => u.username === username ? { ...u, name: input.name! } : u),
            }),
            t,
            `Update registry for ${username}`,
        );
    }

    return { ...updated, id: username, user_id: username } as Profile;
}

export async function getOrCreateDevProfile(): Promise<Profile | null> {
    const existing = await getProfileByUsername('dev');
    if (existing) return existing;
    return createProfile('dev', 'dev', 'Local Developer', '');
}

export async function listPublicProfiles(opts: { limit?: number; offset?: number } = {}): Promise<{ profiles: Profile[]; total: number }> {
    const { limit = 24, offset = 0 } = opts;
    const { data: registry } = await readRegistry();
    const total = registry.users.length;
    const slice = registry.users.slice(offset, offset + limit);

    // Fetch full profiles for the slice
    const profiles = await Promise.all(
        slice.map(u => getProfileByUsername(u.username)),
    );
    return {
        profiles: profiles.filter((p): p is Profile => p !== null),
        total,
    };
}

// ─── Showcases ───────────────────────────────────────────────

async function readShowcase(username: string, slug: string, token?: string, revalidate?: number): Promise<{ data: Showcase; sha: string } | null> {
    const result = await readJSON<Omit<Showcase, 'id' | 'profile_id'>>(
        `showcases/${slug}.json`, userBranch(username), token, revalidate,
    );
    if (!result) return null;
    return {
        data: { ...result.data, id: `${username}/${slug}`, profile_id: username } as Showcase,
        sha: result.sha,
    };
}

export async function getMarketplaceByUsername(username: string): Promise<PublicMarketplace | null> {
    const profile = await getProfileByUsername(username);
    if (!profile) return null;

    const branch = userBranch(username);
    const files = await listFiles('showcases', branch, undefined, 60);
    const jsonFiles = files.filter(f => f.name.endsWith('.json'));

    const showcases: Showcase[] = [];
    for (const file of jsonFiles) {
        const slug = file.name.replace(/\.json$/, '');
        const sc = await readShowcase(username, slug, undefined, 60);
        if (sc && sc.data.status === 'published') showcases.push(sc.data);
    }
    showcases.sort((a, b) => a.sort_order - b.sort_order);

    return { profile, showcases };
}

export async function getShowcasesByProfileId(profileId: string, includeAll = false): Promise<Showcase[]> {
    const username = profileId; // profile_id === username in branch model
    const branch = userBranch(username);
    const files = await listFiles('showcases', branch);
    const jsonFiles = files.filter(f => f.name.endsWith('.json'));

    const showcases: Showcase[] = [];
    for (const file of jsonFiles) {
        const slug = file.name.replace(/\.json$/, '');
        const sc = await readShowcase(username, slug);
        if (sc && (includeAll || sc.data.status === 'published')) showcases.push(sc.data);
    }
    showcases.sort((a, b) => a.sort_order - b.sort_order);
    return showcases;
}

export async function getShowcaseBySlug(username: string, slug: string): Promise<{ profile: Profile; showcase: Showcase } | null> {
    const profile = await getProfileByUsername(username);
    if (!profile) return null;
    const sc = await readShowcase(username, slug, undefined, 60);
    if (!sc || sc.data.status !== 'published') return null;
    return { profile, showcase: sc.data };
}

export async function createShowcase(profileId: string, input: ShowcaseInput, token?: string): Promise<Showcase | null> {
    const username = profileId;
    const t = token || appToken();
    const branch = userBranch(username);

    // Generate unique slug
    let slug = toSlug(input.title);
    const files = await listFiles('showcases', branch, t);
    const existingSlugs = new Set(files.map(f => f.name.replace(/\.json$/, '')));
    if (existingSlugs.has(slug)) {
        let n = 2;
        while (existingSlugs.has(`${slug}-${n}`)) n++;
        slug = `${slug}-${n}`;
    }

    const now = new Date().toISOString();
    const nextOrder = existingSlugs.size;
    const showcase: Omit<Showcase, 'id' | 'profile_id'> = {
        slug,
        title: input.title,
        description: input.description || '',
        url: input.url,
        source_url: input.source_url || '',
        post_url: input.post_url || '',
        preview_image_url: input.preview_image_url || '',
        tags: input.tags || [],
        col_span: input.col_span || 2,
        status: input.status || 'draft',
        sort_order: input.sort_order ?? nextOrder,
        clicks_count: 0,
        views_count: 0,
        created_at: now,
        updated_at: now,
    };

    const wrote = await writeJSON(
        `showcases/${slug}.json`, branch, showcase, t,
        `Add showcase: ${input.title}`,
    );
    if (!wrote) return null;

    // Update registry showcase count
    await updateRegistry(
        reg => ({
            ...reg,
            users: reg.users.map(u =>
                u.username === username ? { ...u, showcase_count: existingSlugs.size + 1 } : u,
            ),
        }),
        t,
        `Update showcase count for ${username}`,
    ).catch(() => {});

    return { ...showcase, id: `${username}/${slug}`, profile_id: username } as Showcase;
}

export async function updateShowcase(id: string, profileId: string, input: Partial<ShowcaseInput>, token?: string): Promise<Showcase | null> {
    const username = profileId;
    const slug = id.includes('/') ? id.split('/').pop()! : id;
    const t = token || appToken();
    const branch = userBranch(username);

    const existing = await readJSON<Omit<Showcase, 'id' | 'profile_id'>>(
        `showcases/${slug}.json`, branch, t,
    );
    if (!existing) return null;

    const updated = {
        ...existing.data,
        ...input,
        updated_at: new Date().toISOString(),
    };

    const wrote = await writeJSON(
        `showcases/${slug}.json`, branch, updated, t,
        `Update showcase: ${updated.title}`,
        existing.sha,
    );
    if (!wrote) return null;

    return { ...updated, id: `${username}/${slug}`, profile_id: username } as Showcase;
}

export async function deleteShowcase(id: string, profileId: string, token?: string): Promise<boolean> {
    const username = profileId;
    const slug = id.includes('/') ? id.split('/').pop()! : id;
    const t = token || appToken();
    const branch = userBranch(username);

    const file = await readJSON<unknown>(`showcases/${slug}.json`, branch, t);
    if (!file) return false;

    const ok = await deleteFile(
        `showcases/${slug}.json`, branch, file.sha, t,
        `Delete showcase: ${slug}`,
    );

    if (ok) {
        // Update registry showcase count
        const files = await listFiles('showcases', branch, t);
        await updateRegistry(
            reg => ({
                ...reg,
                users: reg.users.map(u =>
                    u.username === username ? { ...u, showcase_count: Math.max(0, files.length) } : u,
                ),
            }),
            t,
            `Update showcase count for ${username}`,
        ).catch(() => {});
    }

    return ok;
}

// ─── Tracking ────────────────────────────────────────────────

export async function trackShowcaseClick(showcaseId: string, _referrer: string, _userAgent: string): Promise<void> {
    // showcaseId = "username/slug"
    const [username, slug] = showcaseId.split('/');
    if (!username || !slug) return;
    const token = appToken();
    const branch = userBranch(username);

    const existing = await readJSON<Omit<Showcase, 'id' | 'profile_id'>>(
        `showcases/${slug}.json`, branch, token,
    );
    if (!existing) return;

    const updated = { ...existing.data, clicks_count: (existing.data.clicks_count || 0) + 1 };
    await writeJSON(
        `showcases/${slug}.json`, branch, updated, token,
        `Track click: ${slug}`,
        existing.sha,
    ).catch(() => {});

    // Increment profile-level total_clicks
    const profile = await readJSON<Omit<Profile, 'id' | 'user_id'>>('profile.json', branch, token);
    if (profile) {
        const updatedProfile = { ...profile.data, total_clicks: (profile.data.total_clicks || 0) + 1 };
        await writeJSON('profile.json', branch, updatedProfile, token, `Track click on profile: ${username}`, profile.sha).catch(() => {});
    }
}

export async function incrementShowcaseViews(showcaseId: string): Promise<void> {
    const [username, slug] = showcaseId.split('/');
    if (!username || !slug) return;
    const token = appToken();
    const branch = userBranch(username);

    const existing = await readJSON<Omit<Showcase, 'id' | 'profile_id'>>(
        `showcases/${slug}.json`, branch, token,
    );
    if (!existing) return;

    const updated = { ...existing.data, views_count: (existing.data.views_count || 0) + 1 };
    await writeJSON(
        `showcases/${slug}.json`, branch, updated, token,
        `Track view: ${slug}`,
        existing.sha,
    ).catch(() => {});
}

export async function incrementProfileViews(username: string): Promise<void> {
    const token = appToken();
    const branch = userBranch(username);

    const existing = await readJSON<Omit<Profile, 'id' | 'user_id'>>('profile.json', branch, token);
    if (!existing) return;

    const updated = { ...existing.data, total_views: (existing.data.total_views || 0) + 1 };
    await writeJSON(
        'profile.json', branch, updated, token,
        `Track profile view: ${username}`,
        existing.sha,
    ).catch(() => {});
}
