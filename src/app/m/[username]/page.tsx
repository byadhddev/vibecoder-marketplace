import { notFound } from 'next/navigation';
import { getMarketplaceByUsername } from '@/lib/github/queries';
import type { Metadata } from 'next';
import { MarketplaceGrid } from './MarketplaceGrid';

interface PageProps { params: Promise<{ username: string }>; }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { username } = await params;
    const data = await getMarketplaceByUsername(username);
    if (!data) return { title: 'Not Found' };
    const { profile, showcases } = data;
    return {
        title: `${profile.name} — VibeCoder Marketplace`,
        description: `${showcases.length} showcase${showcases.length === 1 ? '' : 's'} by ${profile.name}`,
        openGraph: { title: `${profile.name} — VibeCoder`, type: 'profile', url: `/m/${username}` },
    };
}

export default async function UserMarketplacePage({ params }: PageProps) {
    const { username } = await params;
    const data = await getMarketplaceByUsername(username);
    if (!data) notFound();
    return <MarketplaceGrid profile={data.profile} showcases={data.showcases} />;
}
