import { Suspense } from 'react';
import { getRegistry } from '@/lib/github/queries';
import HomeClient from './HomeClient';
import HomeLoading from './loading';

async function getVibelopers() {
    'use cache';
    const registry = await getRegistry();
    return registry.users.map(u => ({
        username: u.username,
        name: u.name,
        avatar_url: u.avatar_url,
        role: '',
        showcase_count: u.showcase_count,
    }));
}

export default async function HomePage() {
    const vibelopers = await getVibelopers();
    return (
        <Suspense fallback={<HomeLoading />}>
            <HomeClient initialVibelopers={vibelopers} />
        </Suspense>
    );
}
