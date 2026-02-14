import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { getMarketplaceByUsername, getEarnings } from '@/lib/github/queries';
import type { Metadata } from 'next';
import { MarketplaceGrid } from './MarketplaceGrid';
import ProfileLoading from './loading';

interface PageProps { params: Promise<{ username: string }>; }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { username } = await params;
    const data = await getMarketplaceByUsername(username);
    if (!data) return { title: 'Not Found' };
    const { profile, showcases } = data;
    const url = `/m/${username}`;
    return {
        title: `${profile.name} — VibeCoder Marketplace`,
        description: profile.role
            ? `${profile.role} — ${showcases.length} showcase${showcases.length === 1 ? '' : 's'}. ${(profile.skills || []).slice(0, 5).join(', ')}`
            : `${showcases.length} showcase${showcases.length === 1 ? '' : 's'} by ${profile.name}`,
        keywords: [...(profile.skills || []), profile.name, 'vibe coder', 'hire developer'],
        alternates: { canonical: url },
        openGraph: {
            title: `${profile.name} — VibeCoder`,
            type: 'profile',
            url,
            images: [{ url: `/api/og?username=${username}`, width: 1200, height: 630 }],
        },
    };
}

export default async function UserMarketplacePage({ params }: PageProps) {
    const { username } = await params;
    const data = await getMarketplaceByUsername(username);
    if (!data) notFound();
    const earningsStore = await getEarnings(username);
    const hasVerifiedEarnings = earningsStore.earnings.some((e: { proof_url: string }) => e.proof_url);
    const { profile, showcases } = data;

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Person',
        name: profile.name,
        url: `${process.env.NEXT_PUBLIC_APP_URL || ''}/m/${username}`,
        image: profile.avatar_url,
        jobTitle: profile.role || 'Vibe Coder',
        knowsAbout: profile.skills || [],
        ...(profile.social_links?.github ? { sameAs: [`https://github.com/${profile.social_links.github}`] } : {}),
    };

    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
            <Suspense fallback={<ProfileLoading />}>
                <MarketplaceGrid profile={profile} showcases={showcases} hasVerifiedEarnings={hasVerifiedEarnings} />
            </Suspense>
        </>
    );
}
