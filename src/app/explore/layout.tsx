import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Explore Builders & Showcases',
    description: 'Browse vibe coders who ship with AI. Filter by skills, availability, and showcases. Find your next builder.',
    openGraph: {
        title: 'Explore VibeCoder Builders & Showcases',
        description: 'Browse vibe coders who ship with AI. Filter by skills, availability, and showcases.',
        url: '/explore',
    },
};

export default function ExploreLayout({ children }: { children: React.ReactNode }) {
    return children;
}
