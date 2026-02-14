/**
 * Builder badges — computed from profile data, showcases, and GitHub Issues.
 */

import type { Showcase } from '@/lib/db/types';

export interface Badge {
    id: string;
    emoji: string;
    label: string;
    description: string;
}

/** Compute badges for a builder based on their data */
export function computeBadges(opts: {
    showcases: Showcase[];
    totalEarned?: number;
    availableForHire?: boolean;
    leaderboardRank?: number;
    repeatHiredCount?: number;
}): Badge[] {
    const badges: Badge[] = [];
    const { showcases, totalEarned = 0, leaderboardRank, repeatHiredCount = 0 } = opts;

    // ⚡ Fast Shipper — avg build hours < 24 and at least 3 showcases with build_hours
    const withHours = showcases.filter(s => s.build_hours > 0);
    if (withHours.length >= 3) {
        const avg = withHours.reduce((sum, s) => sum + s.build_hours, 0) / withHours.length;
        if (avg < 24) {
            badges.push({ id: 'fast-shipper', emoji: '⚡', label: 'Fast Shipper', description: `Avg ${Math.round(avg)}h build time` });
        }
    }

    // 🏆 Top 10 — leaderboard rank
    if (leaderboardRank && leaderboardRank <= 10) {
        badges.push({ id: 'top-10', emoji: '🏆', label: 'Top 10', description: `#${leaderboardRank} on leaderboard` });
    }

    // 💰 Earner — has logged earnings with proof
    if (totalEarned > 0) {
        badges.push({ id: 'earner', emoji: '💰', label: 'Earner', description: `$${totalEarned.toLocaleString()} earned` });
    }

    // 🚀 Prolific — 5+ published showcases
    const published = showcases.filter(s => s.status === 'published');
    if (published.length >= 5) {
        badges.push({ id: 'prolific', emoji: '🚀', label: 'Prolific', description: `${published.length} showcases shipped` });
    }

    // 🔁 Repeat Hired — 1+ seekers have hired 3+ times
    if (repeatHiredCount > 0) {
        badges.push({ id: 'repeat-hired', emoji: '🔁', label: 'Repeat Hired', description: `${repeatHiredCount} repeat client${repeatHiredCount > 1 ? 's' : ''}` });
    }

    return badges;
}
