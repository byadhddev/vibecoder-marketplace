'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { PageShell } from '@/components/layout/PageShell';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import {
    vibeColor, vibeText, vibeRaw,
    randomShuffle, GRID_CLASSES,
} from '@/lib/vibe';

interface VibeloperSummary {
    username: string;
    name: string;
    avatar_url: string;
    role: string;
    showcase_count: number;
}

type TileVariant = 'artode' | 'title' | 'counter' | 'status' | 'signature' | 'philosophy' | 'filler' | 'vibeloper';

interface Tile {
    id: string;
    colSpan: string;
    variant: TileVariant;
    href?: string;
    vibeloper?: VibeloperSummary;
}

function buildTiles(vibelopers: VibeloperSummary[]): Tile[] {
    const decorative: Tile[] = [
        { id: 'artode', colSpan: 'col-span-1', variant: 'artode' },
        { id: 'title', colSpan: 'col-span-2 md:col-span-2', variant: 'title' },
        { id: 'counter', colSpan: 'col-span-1', variant: 'counter' },
        { id: 'status', colSpan: 'col-span-1', variant: 'status' },
        { id: 'signature', colSpan: 'col-span-2 md:col-span-2', variant: 'signature' },
        { id: 'philosophy', colSpan: 'col-span-2 md:col-span-2', variant: 'philosophy' },
        { id: 'filler', colSpan: 'col-span-1', variant: 'filler' },
    ];
    const vibeloperTiles: Tile[] = vibelopers.map(v => ({
        id: v.username,
        colSpan: 'col-span-2 md:col-span-2',
        variant: 'vibeloper' as const,
        href: `/m/${v.username}`,
        vibeloper: v,
    }));
    return [...decorative, ...vibeloperTiles];
}

export default function HomePage() {
    const [vibelopers, setVibelopers] = useState<VibeloperSummary[]>([]);
    const [shuffledTiles, setShuffledTiles] = useState<Tile[]>([]);
    const [vibeLocked, setVibeLocked] = useState(false);
    const [hovered, setHovered] = useState(false);
    const isVibe = vibeLocked || hovered;
    const toggleVibe = useCallback(() => setVibeLocked(v => !v), []);

    useEffect(() => {
        fetch('/api/marketplace/vibelopers')
            .then(r => r.json())
            .then(data => setVibelopers(data.vibelopers || []))
            .catch(() => setVibelopers([]));
    }, []);

    useEffect(() => {
        setShuffledTiles(randomShuffle(buildTiles(vibelopers)));
    }, [vibelopers]);

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
                        <span className={`text-[9px] font-mono uppercase tracking-[0.2em] mb-3 transition-colors duration-300 ${isVibe ? vt + ' opacity-60' : 'text-white/40'}`}>VibeCoder</span>
                        <span className={`text-lg md:text-xl font-serif leading-tight transition-colors duration-300 ${isVibe ? vt : 'text-white'}`}>Marketplace</span>
                    </div>
                );
            case 'counter':
                return (
                    <div className={`${tile.colSpan} flex flex-col items-center justify-center p-6 min-h-[120px] transition-all duration-300`} style={{ background: bg }}>
                        <span className={`text-3xl font-bold font-mono transition-colors duration-300 ${isVibe ? vt : 'text-[#37352f]'}`}>{vibelopers.length}</span>
                        <span className="text-[9px] font-mono text-[#9b9a97] uppercase tracking-[0.2em] mt-1">Vibelopers</span>
                    </div>
                );
            case 'status':
                return (
                    <div className={`${tile.colSpan} flex flex-col items-center justify-center p-6 min-h-[120px] transition-all duration-300`} style={{ background: bg }}>
                        <span className={`text-[10px] font-mono uppercase tracking-[0.3em] font-bold transition-colors duration-300 ${isVibe ? vt : 'text-brand-red'}`}>Active</span>
                        <span className="text-[9px] font-mono text-[#9b9a97] uppercase tracking-[0.2em] mt-2">Feb 2026</span>
                    </div>
                );
            case 'signature':
                return (
                    <div className={`${tile.colSpan} p-6 md:p-8 flex items-center min-h-[80px] transition-all duration-300`} style={{ background: bg }}>
                        <div className="flex items-center gap-4">
                            <div className="w-8 h-px transition-colors duration-300" style={{ backgroundColor: isVibe ? vibeRaw(index) : 'rgba(216,0,24,0.3)' }} />
                            <span className={`text-sm font-serif italic transition-colors duration-300 ${isVibe ? vt : 'text-[#37352f]'}`}>vibecoder.dev</span>
                        </div>
                    </div>
                );
            case 'philosophy':
                return (
                    <div className={`${tile.colSpan} p-6 md:p-8 flex items-center min-h-[80px] transition-all duration-300`} style={{ background: bg }}>
                        <p className={`text-[13px] leading-relaxed font-serif italic transition-colors duration-300 ${isVibe ? vt : 'text-[#37352f] opacity-70'}`}>
                            Plug-and-play portfolios. Showcase your work from anywhere.
                        </p>
                    </div>
                );
            case 'filler':
                return (
                    <div className={`${tile.colSpan} min-h-[120px] transition-all duration-300`} style={{ backgroundColor: isVibe ? `${vibeRaw(index)}1A` : '#f0f0ef' }} />
                );
            case 'vibeloper': {
                const v = tile.vibeloper!;
                return (
                    <div
                        className={`${tile.colSpan} relative overflow-hidden min-h-[140px] md:min-h-[160px] group transition-all duration-300 bg-[#242423]`}
                    >
                        {v.avatar_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                                src={v.avatar_url}
                                alt={v.name}
                                className="absolute inset-0 w-full h-full object-cover transition-all duration-500 group-hover:scale-105"
                            />
                        ) : (
                            <div className="absolute inset-0 flex items-center justify-center text-white text-3xl font-serif">
                                {v.name.charAt(0)}
                            </div>
                        )}
                        {/* Bottom overlay with name */}
                        <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black/70 to-transparent">
                            <h3 className="text-sm md:text-base font-serif text-white leading-tight">
                                {v.name}
                            </h3>
                            <div className="flex items-center justify-between mt-1">
                                <p className="text-[11px] text-white/60">
                                    {v.role || `@${v.username}`}
                                </p>
                                <span className="text-[8px] font-mono text-white/40 uppercase tracking-wider">
                                    {v.showcase_count} projects
                                </span>
                            </div>
                        </div>
                    </div>
                );
            }
        }
    }

    return (
        <PageShell>
            <Header />
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
