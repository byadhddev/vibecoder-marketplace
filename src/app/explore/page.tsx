import { Suspense } from 'react';
import { getRegistry, getShowcasesByProfileId, getProfileByUsername } from '@/lib/github/queries';
import ExploreClient from './ExploreClient';
import ExploreLoading from './loading';

async function getExploreData() {
    'use cache';
    const registry = await getRegistry();
    const users = registry.users;

    const allShowcases = await Promise.all(
        users.map(async (u) => {
            const showcases = await getShowcasesByProfileId(u.username);
            return showcases
                .filter(s => s.status === 'published')
                .map(s => ({ ...s, _user: { username: u.username, name: u.name, avatar_url: u.avatar_url } }));
        })
    );
    const flat = allShowcases.flat().sort((a, b) => (b.views_count || 0) - (a.views_count || 0));

    const tagSet = new Set<string>();
    const skillSet = new Set<string>();
    flat.forEach(s => s.tags.forEach(t => tagSet.add(t)));
    users.forEach(u => (u.skills || []).forEach(s => skillSet.add(s)));

    const allBuilders = await Promise.all(users.map(u => getProfileByUsername(u.username)));
    const builders = allBuilders.filter(Boolean).map(p => ({
        username: p!.username, name: p!.name, avatar_url: p!.avatar_url,
        role: p!.role || '', skills: p!.skills || [],
        available_for_hire: p!.available_for_hire || false,
        showcase_count: p!.showcase_count || 0,
    }));

    return {
        showcases: flat.map(s => ({
            slug: s.slug, title: s.title, description: s.description, url: s.url,
            tags: s.tags, views_count: s.views_count || 0, clicks_count: s.clicks_count || 0,
            _user: s._user,
        })),
        builders,
        tags: [...tagSet].sort(),
        skills: [...skillSet].sort(),
    };
}

export default async function ExplorePage() {
    const data = await getExploreData();
    return (
        <Suspense fallback={<ExploreLoading />}>
            <ExploreClient initialData={data} />
        </Suspense>
    );
}
