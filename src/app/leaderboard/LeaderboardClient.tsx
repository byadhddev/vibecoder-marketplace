'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { PageShell } from '@/components/layout/PageShell';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { VIBE_RAW_COLORS, ACCENTS, GRID_CLASSES } from '@/lib/vibe';
import { extractColorsFromImage, type ExtractedColors } from '@/lib/colors';
import { computeBadges } from '@/lib/badges';

interface Builder {
    username: string;
    name: string;
    avatar_url: string;
    role: string;
    skills: string[];
    available_for_hire: boolean;
    showcase_count: number;
    total_views: number;
    hourly_rate: number;
    created_at: string;
}

type SortField = 'showcases' | 'views';
type TimeFilter = 'all-time' | 'this-month';
type TileVariant = 'artode' | 'title' | 'filler' | 'sort' | 'builder';

interface Tile {
    id: string;
    colSpan: string;
    variant: TileVariant;
    href?: string;
    builder?: Builder;
    rank?: number;
}

export default function LeaderboardClient({ initialBuilders }: {
    initialBuilders?: Builder[];
}) {
    const [builders, setBuilders] = useState<Builder[]>(initialBuilders ?? []);
    const [sortBy, setSortBy] = useState<SortField>('showcases');
    const [timeFilter, setTimeFilter] = useState<TimeFilter>('all-time');
    const [vibeLocked, setVibeLocked] = useState(false);
    const [hovered, setHovered] = useState(false);
    const [avatarColors, setAvatarColors] = useState<Record<string, ExtractedColors>>({});
    const isVibe = vibeLocked || hovered;
    const toggleVibe = useCallback(() => setVibeLocked(v => !v), []);

    useEffect(() => {
        if (initialBuilders) return;
        fetch('/api/marketplace/explore')
            .then(r => r.json())
            .then(d => setBuilders(d.builders || []))
            .catch(() => {});
    }, [initialBuilders]);

    useEffect(() => {
        builders.forEach(b => {
            if (b.avatar_url && !avatarColors[b.username]) {
                extractColorsFromImage(b.avatar_url).then(c => setAvatarColors(prev => ({ ...prev, [b.username]: c })));
            }
        });
    }, [builders]); // eslint-disable-line react-hooks/exhaustive-deps

    // Filter by time
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const filtered = timeFilter === 'this-month'
        ? builders.filter(b => b.created_at >= monthStart)
        : builders;

    const sorted = [...filtered].sort((a, b) => {
        if (sortBy === 'views') return (b.total_views || 0) - (a.total_views || 0);
        return (b.showcase_count || 0) - (a.showcase_count || 0);
    });

    const tiles: Tile[] = [
        { id: 'artode', colSpan: 'col-span-1', variant: 'artode' },
        { id: 'title', colSpan: 'col-span-2 md:col-span-2', variant: 'title' },
        { id: 'sort', colSpan: 'col-span-1', variant: 'sort' },
        ...sorted.map((b, i) => ({
            id: `builder-${b.username}`,
            colSpan: 'col-span-2 md:col-span-2' as const,
            variant: 'builder' as const,
            href: `/m/${b.username}`,
            builder: b,
            rank: i + 1,
        })),
    ];
    if (sorted.length % 2 !== 0) tiles.push({ id: 'filler', colSpan: 'col-span-2 md:col-span-2', variant: 'filler' });

    function renderTile(tile: Tile, index: number) {
        const extractedHexes = Object.values(avatarColors).flatMap(c => [c.primary, c.secondary]);
        const palette = extractedHexes.length > 0 ? extractedHexes : VIBE_RAW_COLORS;
        const palColor = palette[index % palette.length];
        const dynBg = `radial-gradient(circle at center, ${palColor}26 0%, rgba(255,255,255,0) 70%)`;
        const dynTextStyle = { color: palColor };
        const bg = isVibe ? dynBg : 'white';

        switch (tile.variant) {
            case 'artode':
                return (
                    <div
                        className={`${tile.colSpan} aspect-square flex items-center justify-center cursor-pointer transition-all duration-300 bg-vc-dark ${vibeLocked ? 'ring-2 ring-inset ring-brand-red/50' : ''}`}
                        onMouseEnter={() => setHovered(true)}
                        onMouseLeave={() => setHovered(false)}
                        onClick={(e) => { e.stopPropagation(); toggleVibe(); }}
                    >
                        <div className={`w-10 h-10 transition-all duration-300 ${vibeLocked ? 'bg-brand-red scale-110' : isVibe ? 'bg-brand-red scale-105' : 'bg-vc-surface'}`} />
                    </div>
                );
            case 'title':
                return (
                    <div className={`${tile.colSpan} p-6 md:p-8 flex flex-col justify-center min-h-[120px] transition-all duration-300`} style={{ background: isVibe ? dynBg : 'var(--vc-dark)' }}>
                        <span className={`text-[9px] font-mono uppercase tracking-[0.2em] mb-3 transition-colors duration-300 ${isVibe ? 'opacity-60' : 'text-white/40'}`} style={isVibe ? dynTextStyle : undefined}>VibeCoder</span>
                        <span className={`text-lg md:text-xl font-serif leading-tight transition-colors duration-300 ${isVibe ? '' : 'text-white'}`} style={isVibe ? dynTextStyle : undefined}>Leaderboard</span>
                        <span className={`text-[11px] font-serif italic mt-2 transition-colors duration-300 ${isVibe ? 'opacity-60' : 'text-white/40'}`} style={isVibe ? dynTextStyle : undefined}>From token burn to token earn.</span>
                    </div>
                );
            case 'sort':
                return (
                    <div className={`${tile.colSpan} flex flex-col items-center justify-center gap-2 p-4 min-h-[120px] transition-all duration-300`} style={{ background: bg }}>
                        <div className="flex gap-2 mb-1">
                            <button onClick={() => setTimeFilter('all-time')}
                                className={`text-[8px] font-mono uppercase tracking-[0.15em] px-2 py-0.5 rounded-sm transition-colors ${timeFilter === 'all-time' ? 'bg-vc-dark text-white' : 'text-vc-text-secondary hover:text-vc-text'}`}>
                                All Time
                            </button>
                            <button onClick={() => setTimeFilter('this-month')}
                                className={`text-[8px] font-mono uppercase tracking-[0.15em] px-2 py-0.5 rounded-sm transition-colors ${timeFilter === 'this-month' ? 'bg-vc-dark text-white' : 'text-vc-text-secondary hover:text-vc-text'}`}>
                                This Month
                            </button>
                        </div>
                        <button onClick={() => setSortBy('showcases')}
                            className={`text-[9px] font-mono uppercase tracking-[0.15em] transition-colors ${sortBy === 'showcases' ? 'text-brand-red font-bold' : 'text-vc-text-secondary hover:text-vc-text'}`}>
                            By Showcases
                        </button>
                        <button onClick={() => setSortBy('views')}
                            className={`text-[9px] font-mono uppercase tracking-[0.15em] transition-colors ${sortBy === 'views' ? 'text-brand-red font-bold' : 'text-vc-text-secondary hover:text-vc-text'}`}>
                            By Views
                        </button>
                    </div>
                );
            case 'filler':
                return (
                    <div className={`${tile.colSpan} min-h-[120px] transition-all duration-300`} style={{ backgroundColor: isVibe ? `${palColor}1A` : 'var(--vc-skeleton)' }} />
                );
            case 'builder': {
                const b = tile.builder!;
                const userColors = avatarColors[b.username];
                const accent = userColors?.primary || ACCENTS[index % ACCENTS.length];
                const rank = tile.rank || index;
                return (
                    <div className={`${tile.colSpan} p-5 md:p-6 flex flex-col justify-between min-h-[140px] md:min-h-[160px] group transition-all duration-300`} style={{ background: bg }}>
                        <div className="flex items-center gap-3">
                            <span className="text-[10px] font-mono transition-colors duration-300" style={{ color: isVibe ? palColor : accent }}>#{rank}</span>
                            {b.avatar_url && (
                                <Image src={b.avatar_url} alt="" width={24} height={24} className="rounded-sm" />
                            )}
                            <span className={`text-sm font-serif transition-colors duration-300 ${isVibe ? '' : 'text-vc-text group-hover:text-brand-red'}`} style={isVibe ? { color: accent } : undefined}>
                                {b.name}
                            </span>
                            <div className="flex-1 h-px transition-colors duration-300" style={{ backgroundColor: isVibe ? `${accent}4D` : `${accent}20` }} />
                            {b.available_for_hire && (
                                <span className="flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                    <span className="text-[8px] font-mono uppercase tracking-wider text-green-600">Hire</span>
                                </span>
                            )}
                        </div>
                        <div>
                            <p className={`text-[11px] font-mono transition-colors duration-300 ${isVibe ? 'opacity-60' : 'text-vc-text-secondary'}`} style={isVibe ? { color: accent } : undefined}>
                                {b.role}
                            </p>
                            {b.skills.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                    {b.skills.slice(0, 5).map(s => (
                                        <span key={s} className="text-[8px] font-mono px-1.5 py-0.5 rounded-sm bg-vc-surface-raised text-vc-text-secondary">{s}</span>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="flex items-center gap-4 mt-2">
                            <span className={`text-[10px] font-mono transition-colors duration-300 ${isVibe ? 'opacity-40' : 'text-vc-text-secondary'}`} style={isVibe ? { color: accent } : undefined}>
                                {b.showcase_count} showcase{b.showcase_count !== 1 ? 's' : ''}
                            </span>
                            <span className={`text-[10px] font-mono transition-colors duration-300 ${isVibe ? 'opacity-40' : 'text-vc-text-secondary'}`} style={isVibe ? { color: accent } : undefined}>
                                {b.total_views} views
                            </span>
                            {(() => {
                                const badges = computeBadges({ showcases: [], leaderboardRank: rank });
                                return badges.map(badge => (
                                    <span key={badge.id} className={`text-[8px] font-mono px-1.5 py-0.5 rounded-sm ${isVibe ? 'opacity-60' : 'bg-vc-surface-raised text-vc-text'}`}
                                        style={isVibe ? { backgroundColor: `${accent}20`, color: accent } : undefined}>
                                        {badge.emoji} {badge.label}
                                    </span>
                                ));
                            })()}
                        </div>
                    </div>
                );
            }
        }
    }

    const breadcrumbs = (
        <div className="flex items-center gap-2 text-vc-text-secondary">
            <Link href="/" className="flex items-center gap-2 hover:text-vc-text transition-colors font-medium">
                <div className="w-3 h-3 bg-brand-red rounded-[2px]" />
                <span>VibeCoder</span>
            </Link>
            <span className="text-vc-text-muted">/</span>
            <span className="text-vc-text font-medium">leaderboard</span>
        </div>
    );

    return (
        <PageShell>
            <Header breadcrumbs={breadcrumbs} />
            <section>
                <div className={GRID_CLASSES}>
                    {tiles.map((tile, i) => {
                        const rendered = renderTile(tile, i);
                        return tile.href ? (
                            <Link key={tile.id} href={tile.href} className="contents">{rendered}</Link>
                        ) : (
                            <div key={tile.id} className="contents">{rendered}</div>
                        );
                    })}
                </div>
            </section>
            <Footer />
        </PageShell>
    );
}
