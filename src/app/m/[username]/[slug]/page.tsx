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
    return {
        title: `${showcase.title} — ${profile.name} — VibeCoder`,
        description: showcase.description || `${showcase.title} by ${profile.name}`,
        openGraph: {
            title: showcase.title,
            description: showcase.description,
            type: 'website',
            url: `/m/${username}/${slug}`,
            ...(showcase.preview_image_url ? { images: [{ url: showcase.preview_image_url }] } : {}),
        },
    };
}

export default async function ProjectPage({ params }: PageProps) {
    const { username, slug } = await params;
    const data = await getShowcaseBySlug(username, slug);
    if (!data) notFound();
    return <ProjectEmbed profile={data.profile} showcase={data.showcase} />;
}
