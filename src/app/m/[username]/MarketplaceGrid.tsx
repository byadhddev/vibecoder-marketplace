'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { PageShell } from '@/components/layout/PageShell';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import type { Profile, Showcase } from '@/lib/db/types';
import {
    ACCENTS,
    vibeColor, vibeText, vibeRaw,
    randomShuffle, GRID_CLASSES,
} from '@/lib/vibe';

type TileVariant = 'artode' | 'title' | 'counter' | 'status' | 'signature' | 'philosophy' | 'filler' | 'showcase';

interface Tile {
    id: string;
    colSpan: string;
    variant: TileVariant;
    href?: string;
    showcase?: Showcase;
}

function buildTiles(showcases: Showcase[], username: string): Tile[] {
    const decorative: Tile[] = [
        { id: 'artode', colSpan: 'col-span-1', variant: 'artode' },
        { id: 'title', colSpan: 'col-span-2 md:col-span-2', variant: 'title' },
        { id: 'counter', colSpan: 'col-span-1', variant: 'counter' },
        { id: 'status', colSpan: 'col-span-1', variant: 'status' },
        { id: 'signature', colSpan: 'col-span-2 md:col-span-2', variant: 'signature' },
        { id: 'philosophy', colSpan: 'col-span-2 md:col-span-2', variant: 'philosophy' },
        { id: 'filler', colSpan: 'col-span-1', variant: 'filler' },
    ];
    const showcaseTiles: Tile[] = showcases.map(s => ({
        id: s.id,
        colSpan: 'col-span-2 md:col-span-2',
        variant: 'showcase' as const,
        href: `/m/${username}/${s.slug}`,
        showcase: s,
    }));
    return [...decorative, ...showcaseTiles];
}

interface MarketplaceGridProps {
    profile: Profile;
    showcases: Showcase[];
}

export function MarketplaceGrid({ profile, showcases }: MarketplaceGridProps) {
    const [shuffledTiles, setShuffledTiles] = useState<Tile[]>(buildTiles(showcases, profile.username));
    const [vibeLocked, setVibeLocked] = useState(false);
    const [hovered, setHovered] = useState(false);
    const isVibe = vibeLocked || hovered;
    const toggleVibe = useCallback(() => setVibeLocked(v => !v), []);

    useEffect(() => {
        setShuffledTiles(randomShuffle(buildTiles(showcases, profile.username)));
    }, [showcases]);

    const handleShowcaseClick = (showcaseId: string) => {
        fetch('/api/marketplace/track', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ showcase_id: showcaseId, type: 'click' }),
        }).catch(() => {});
    };

    function renderTile(tile: Tile, index: number) {
        const vt = vibeText(index);
        const bg = isVibe ? vibeColor(index) : 'white';

        switch (tile.variant) {
            case 'artode':
                return (
                    <div
                        className={`${tile.colSpan} aspect-square flex items-center justify-center cursor-pointer transition-all duration-300 bg-[#242423] ${vibeLocked ? 'ring-2 ring-inset ring-brand-red/50' : ''}`}
                        onMouseEnter={() => setHovered(true)}
                        onMouseLeave={() => setHovered(false)}
                        onClick={(e) => { e.stopPropagation(); toggleVibe(); }}
                    >
                        <div className={`w-10 h-10 transition-all duration-300 ${vibeLocked ? 'bg-brand-red scale-110' : isVibe ? 'bg-brand-red scale-105' : 'bg-white'}`} />
                    </div>
                );
            case 'title':
                return (
                    <div
                        className={`${tile.colSpan} p-6 md:p-8 flex flex-col justify-center min-h-[120px] transition-all duration-300`}
                        style={{ background: isVibe ? vibeColor(index) : '#242423' }}
                    >
                        <span className={`text-[9px] font-mono uppercase tracking-[0.2em] mb-3 transition-colors duration-300 ${isVibe ? vt + ' opacity-60' : 'text-white/40'}`}>Marketplace</span>
                        <span className={`text-lg md:text-xl font-serif leading-tight transition-colors duration-300 ${isVibe ? vt : 'text-white'}`}>{profile.name}</span>
                    </div>
                );
            case 'counter':
                return (
                    <div className={`${tile.colSpan} flex flex-col items-center justify-center p-6 min-h-[120px] transition-all duration-300`} style={{ background: bg }}>
                        <span className={`text-3xl font-bold font-mono transition-colors duration-300 ${isVibe ? vt : 'text-[#37352f]'}`}>{showcases.length}</span>
                        <span className="text-[9px] font-mono text-[#9b9a97] uppercase tracking-[0.2em] mt-1">Showcases</span>
                    </div>
                );
            case 'status':
                return (
                    <div className={`${tile.colSpan} flex flex-col items-center justify-center p-6 min-h-[120px] transition-all duration-300`} style={{ background: bg }}>
                        {profile.avatar_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={profile.avatar_url} alt="" className="w-12 h-12 rounded-full border border-[#ededeb]" />
                        ) : (
                            <span className={`text-[10px] font-mono uppercase tracking-[0.3em] font-bold transition-colors duration-300 ${isVibe ? vt : 'text-brand-red'}`}>Active</span>
                        )}
                        <span className="text-[9px] font-mono text-[#9b9a97] uppercase tracking-[0.2em] mt-2">@{profile.username}</span>
                    </div>
                );
            case 'signature':
                return (
                    <div className={`${tile.colSpan} p-6 md:p-8 flex items-center min-h-[80px] transition-all duration-300`} style={{ background: bg }}>
                        <div className="flex items-center gap-4">
                            <div className="w-8 h-px transition-colors duration-300" style={{ backgroundColor: isVibe ? vibeRaw(index) : 'rgba(216,0,24,0.3)' }} />
                            <span className={`text-sm font-serif italic transition-colors duration-300 ${isVibe ? vt : 'text-[#37352f]'}`}>
                                vibecoder.dev/m/{profile.username}
                            </span>
                        </div>
                    </div>
                );
            case 'philosophy':
                return (
                    <div className={`${tile.colSpan} p-6 md:p-8 flex items-center min-h-[80px] transition-all duration-300`} style={{ background: bg }}>
                        <p className={`text-[13px] leading-relaxed font-serif italic transition-colors duration-300 ${isVibe ? vt : 'text-[#37352f] opacity-70'}`}>
                            {profile.bio || profile.role || 'Building things that matter.'}
                        </p>
                    </div>
                );
            case 'filler':
                return (
                    <div className={`${tile.colSpan} min-h-[120px] transition-all duration-300`} style={{ backgroundColor: isVibe ? `${vibeRaw(index)}1A` : '#f0f0ef' }} />
                );
            case 'showcase': {
                const s = tile.showcase!;
                const si = showcases.indexOf(s);
                const numStr = String(si + 1).padStart(2, '0');
                const accent = ACCENTS[si % ACCENTS.length];
                return (
                    <div
                        className={`${tile.colSpan} p-5 md:p-6 flex flex-col justify-between min-h-[140px] md:min-h-[160px] group transition-all duration-300`}
                        style={{ background: bg }}
                        onClick={() => handleShowcaseClick(s.id)}
                    >
                        <div className="flex items-center gap-3">
                            <span className="text-[10px] font-mono transition-colors duration-300" style={{ color: isVibe ? vibeRaw(index) : accent }}>{numStr}</span>
                            <div className="flex-1 h-px transition-colors duration-300" style={{ backgroundColor: isVibe ? `${vibeRaw(index)}4D` : `${accent}20` }} />
                            {s.tags.length > 0 && (
                                <span className="text-[8px] font-mono text-[#9b9a97] uppercase tracking-wider">{s.tags[0]}</span>
                            )}
                        </div>
                        <div>
                            <h3 className={`text-base font-serif mb-1 transition-colors duration-300 ${isVibe ? vt : 'text-[#37352f] group-hover:text-brand-red'} ${tile.colSpan.includes('col-span-2') ? 'md:text-lg' : ''}`}>
                                {s.title}
                            </h3>
                            <p className={`text-[12px] leading-relaxed transition-colors duration-300 ${isVibe ? `${vt} opacity-60` : 'text-[#9b9a97]'}`}>
                                {s.description}
                            </p>
                        </div>
                        {(s.source_url || s.post_url) && (
                            <div className="flex items-center gap-3 mt-2">
                                {s.source_url && (
                                    <button type="button" onClick={e => { e.stopPropagation(); e.preventDefault(); window.open(s.source_url, '_blank', 'noopener,noreferrer'); }}
                                        className={`text-[8px] font-mono uppercase tracking-wider transition-colors duration-300 ${isVibe ? `${vt} opacity-60` : 'text-[#9b9a97] hover:text-[#37352f]'}`}>Source ↗</button>
                                )}
                                {s.post_url && (
                                    <button type="button" onClick={e => { e.stopPropagation(); e.preventDefault(); window.open(s.post_url, '_blank', 'noopener,noreferrer'); }}
                                        className={`text-[8px] font-mono uppercase tracking-wider transition-colors duration-300 ${isVibe ? `${vt} opacity-60` : 'text-[#9b9a97] hover:text-[#37352f]'}`}>Post ↗</button>
                                )}
                            </div>
                        )}
                    </div>
                );
            }
        }
    }

    const breadcrumbs = (
        <div className="flex items-center gap-2 text-[#9b9a97]">
            <Link href="/" className="flex items-center gap-2 hover:text-[#37352f] transition-colors font-medium">
                <div className="w-3 h-3 bg-brand-red rounded-[2px]" />
                <span>VibeCoder</span>
            </Link>
            <span className="text-[#d5d5d3]">/</span>
            <span className="text-[#37352f] font-medium">{profile.username}</span>
        </div>
    );

    return (
        <PageShell>
            <Header breadcrumbs={breadcrumbs} />
            <section>
                <div
                    className={GRID_CLASSES}
                >
                    {shuffledTiles.map((tile, i) => {
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
