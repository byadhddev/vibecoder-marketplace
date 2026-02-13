'use client';

import type { Profile, Showcase } from '@/lib/db/types';
import { VibeloperCard } from '@/components/card/VibeloperCard';

interface EmbedCardProps {
    profile: Profile;
    showcases: Showcase[];
}

export function EmbedCard({ profile, showcases }: EmbedCardProps) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-transparent p-4">
            <VibeloperCard profile={profile} showcases={showcases} />
        </div>
    );
}
