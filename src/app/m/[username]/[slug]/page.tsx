import { notFound } from 'next/navigation';
import { getShowcaseBySlug } from '@/lib/github/queries';
import type { Metadata } from 'next';
import { ProjectEmbed } from './ProjectEmbed';

interface PageProps { params: Promise<{ username: string; slug: string }>; }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { username, slug } = await params;
    const data = await getShowcaseBySlug(username, slug);
    if (!data) return { title: 'Not Found' };
    const { profile, showcase } = data;
    const url = `/m/${username}/${slug}`;
    return {
        title: `${showcase.title} — ${profile.name}`,
        description: showcase.description || `${showcase.title} by ${profile.name}`,
        keywords: [...(showcase.tags || []), ...(showcase.ai_tools || []), profile.name, 'vibe coding'],
        alternates: { canonical: url },
        openGraph: {
            title: `${showcase.title} — ${profile.name}`,
            description: showcase.description || `${showcase.title} by ${profile.name}`,
            type: 'website',
            url,
            ...(showcase.preview_image_url
                ? { images: [{ url: showcase.preview_image_url, width: 1200, height: 630 }] }
                : { images: [{ url: `/api/marketplace/og?username=${username}&showcase=${slug}` }] }),
        },
    };
}

export default async function ProjectPage({ params }: PageProps) {
    const { username, slug } = await params;
    const data = await getShowcaseBySlug(username, slug);
    if (!data) notFound();
    const { profile, showcase } = data;

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'CreativeWork',
        name: showcase.title,
        description: showcase.description,
        url: `${process.env.NEXT_PUBLIC_APP_URL || ''}/m/${username}/${slug}`,
        author: { '@type': 'Person', name: profile.name, url: `${process.env.NEXT_PUBLIC_APP_URL || ''}/m/${username}` },
        ...(showcase.tags?.length ? { keywords: showcase.tags.join(', ') } : {}),
        ...(showcase.preview_image_url ? { image: showcase.preview_image_url } : {}),
        dateCreated: showcase.created_at,
    };

    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
            <ProjectEmbed profile={profile} showcase={showcase} />
        </>
    );
}
