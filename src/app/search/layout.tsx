import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Search',
    description: 'Search VibeCoder builders and showcases by name, skills, tags, and more.',
};

export default function SearchLayout({ children }: { children: React.ReactNode }) {
    return children;
}
