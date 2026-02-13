import { notFound } from 'next/navigation';
import { getMarketplaceByUsername } from '@/lib/github/queries';
import type { Metadata } from 'next';
import { EmbedCard } from './EmbedCard';

interface PageProps { params: Promise<{ username: string }>; }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { username } = await params;
    const data = await getMarketplaceByUsername(username);
    if (!data) return { title: 'Not Found' };
    return {
        title: `${data.profile.name} — VibeCoder Card`,
        description: `Vibeloper card for ${data.profile.name}`,
        openGraph: {
            title: `${data.profile.name} — VibeCoder`,
            images: [`/api/og?username=${username}`],
        },
    };
}

export default async function EmbedPage({ params }: PageProps) {
    const { username } = await params;
    const data = await getMarketplaceByUsername(username);
    if (!data) notFound();
    return <EmbedCard profile={data.profile} showcases={data.showcases} />;
}
