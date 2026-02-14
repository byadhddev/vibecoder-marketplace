import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Leaderboard',
    description: 'From token burn to token earn. See the top vibe coders ranked by showcases shipped, views, and reputation.',
    openGraph: {
        title: 'VibeCoder Leaderboard',
        description: 'The top vibe coders ranked by showcases shipped, views, and reputation.',
        url: '/leaderboard',
    },
};

export default function LeaderboardLayout({ children }: { children: React.ReactNode }) {
    return children;
}
