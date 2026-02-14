'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { PageShell } from '@/components/layout/PageShell';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import {
    VIBE_RAW_COLORS,
    randomShuffle, GRID_CLASSES,
    vibeGradientFromHex,
} from '@/lib/vibe';
import { extractColorsFromImage, type ExtractedColors } from '@/lib/colors';

interface VibeloperSummary {
    username: string;
    name: string;
    avatar_url: string;
    role: string;
    showcase_count: number;
}

type TileVariant = 'artode' | 'title' | 'counter' | 'status' | 'signature' | 'philosophy' | 'filler' | 'vibeloper' | 'cta-builder' | 'cta-seeker' | 'community';

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
        { id: 'cta-builder', colSpan: 'col-span-2 md:col-span-2', variant: 'cta-builder' },
        { id: 'cta-seeker', colSpan: 'col-span-2 md:col-span-2', variant: 'cta-seeker' },
        { id: 'community', colSpan: 'col-span-2 md:col-span-2', variant: 'community' },
        { id: 'status', colSpan: 'col-span-1', variant: 'status' },
        { id: 'philosophy', colSpan: 'col-span-2 md:col-span-2', variant: 'philosophy' },
        { id: 'signature', colSpan: 'col-span-2 md:col-span-2', variant: 'signature' },
        { id: 'filler', colSpan: 'col-span-1', variant: 'filler' },
    ];
    const vibeloperTiles: Tile[] = vibelopers.map(v => ({
        id: v.username,
        colSpan: 'col-span-1',
        variant: 'vibeloper' as const,
        href: `/m/${v.username}`,
        vibeloper: v,
    }));
    return [...decorative, ...vibeloperTiles];
}

export default function HomeClient({ initialVibelopers }: {
    initialVibelopers?: VibeloperSummary[];
}) {
    const [vibelopers, setVibelopers] = useState<VibeloperSummary[]>(initialVibelopers ?? []);
    const [shuffledTiles, setShuffledTiles] = useState<Tile[]>([]);
    const [vibeLocked, setVibeLocked] = useState(false);
    const [hovered, setHovered] = useState(false);
    const [avatarColors, setAvatarColors] = useState<Record<string, ExtractedColors>>({});
    const isVibe = vibeLocked || hovered;
    const toggleVibe = useCallback(() => setVibeLocked(v => !v), []);

    useEffect(() => {
        if (initialVibelopers) return;
        fetch('/api/marketplace/vibelopers')
            .then(r => r.json())
            .then(data => setVibelopers(data.vibelopers || []))
            .catch(() => setVibelopers([]));
    }, [initialVibelopers]);

    useEffect(() => {
        vibelopers.forEach(v => {
            if (v.avatar_url && !avatarColors[v.username]) {
                extractColorsFromImage(v.avatar_url).then(colors => {
                    setAvatarColors(prev => ({ ...prev, [v.username]: colors }));
                });
            }
        });
    }, [vibelopers]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        setShuffledTiles(randomShuffle(buildTiles(vibelopers)));
    }, [vibelopers]);

    function renderTile(tile: Tile, index: number) {
        // Build dynamic palette from extracted avatar colors
        const extractedHexes = Object.values(avatarColors).flatMap(c => [c.primary, c.secondary]);
        const palette = extractedHexes.length > 0 ? extractedHexes : VIBE_RAW_COLORS;
        const palColor = palette[index % palette.length];
        const dynBg = vibeGradientFromHex(palColor);
        // Determine readable text class for this palette color
        const dynTextStyle = { color: palColor };

        const bg = isVibe ? dynBg : 'var(--vc-surface)';

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
                    <div
                        className={`${tile.colSpan} p-6 md:p-8 flex flex-col justify-center min-h-[120px] transition-all duration-300`}
                        style={{ background: isVibe ? dynBg : 'var(--vc-dark)' }}
                    >
                        <span className={`text-[9px] font-mono uppercase tracking-[0.2em] mb-3 transition-colors duration-300 ${isVibe ? 'opacity-60' : 'text-white/40'}`} style={isVibe ? dynTextStyle : undefined}>VibeCoder</span>
                        <span className={`text-lg md:text-xl font-serif leading-tight transition-colors duration-300 ${isVibe ? '' : 'text-white'}`} style={isVibe ? dynTextStyle : undefined}>Ship Fast. Get Found. Get Paid.</span>
                    </div>
                );
            case 'counter':
                return (
                    <div className={`${tile.colSpan} flex flex-col items-center justify-center p-6 min-h-[120px] transition-all duration-300`} style={{ background: bg }}>
                        <span className={`text-3xl font-bold font-mono transition-colors duration-300 ${isVibe ? '' : 'text-vc-text'}`} style={isVibe ? dynTextStyle : undefined}>{vibelopers.length}</span>
                        <span className="text-[9px] font-mono text-vc-text-secondary uppercase tracking-[0.2em] mt-1">Vibelopers</span>
                    </div>
                );
            case 'status':
                return (
                    <div className={`${tile.colSpan} flex flex-col items-center justify-center p-6 min-h-[120px] transition-all duration-300`} style={{ background: bg }}>
                        <span className={`text-[10px] font-mono uppercase tracking-[0.3em] font-bold transition-colors duration-300 ${isVibe ? '' : 'text-brand-red'}`} style={isVibe ? dynTextStyle : undefined}>Active</span>
                        <span className="text-[9px] font-mono text-vc-text-secondary uppercase tracking-[0.2em] mt-2">Feb 2026</span>
                    </div>
                );
            case 'signature':
                return (
                    <div className={`${tile.colSpan} p-6 md:p-8 flex items-center min-h-[80px] transition-all duration-300`} style={{ background: bg }}>
                        <div className="flex items-center gap-4">
                            <div className="w-8 h-px transition-colors duration-300" style={{ backgroundColor: isVibe ? palColor : 'rgba(216,0,24,0.3)' }} />
                            <span className={`text-sm font-serif italic transition-colors duration-300 ${isVibe ? '' : 'text-vc-text'}`} style={isVibe ? dynTextStyle : undefined}>vibecoder.dev</span>
                        </div>
                    </div>
                );
            case 'philosophy':
                return (
                    <div className={`${tile.colSpan} p-6 md:p-8 flex items-center min-h-[80px] transition-all duration-300`} style={{ background: bg }}>
                        <p className={`text-[13px] leading-relaxed font-serif italic transition-colors duration-300 ${isVibe ? '' : 'text-vc-text opacity-70'}`} style={isVibe ? dynTextStyle : undefined}>
                            Every token burned should build something someone needs.
                        </p>
                    </div>
                );
            case 'cta-builder':
                return (
                    <div className={`${tile.colSpan} p-5 md:p-6 flex flex-col justify-between min-h-[120px] transition-all duration-300`} style={{ background: bg }}>
                        <span className={`text-[9px] font-mono uppercase tracking-[0.2em] mb-2 transition-colors duration-300 ${isVibe ? 'opacity-60' : 'text-vc-text-secondary'}`} style={isVibe ? dynTextStyle : undefined}>For Builders</span>
                        <p className={`text-[13px] leading-relaxed font-serif transition-colors duration-300 ${isVibe ? '' : 'text-vc-text'}`} style={isVibe ? dynTextStyle : undefined}>
                            Your showcases are your storefront. Set your rate, prove your speed, get discovered.
                        </p>
                        <Link href="/manager" className={`text-[9px] font-mono uppercase tracking-[0.15em] mt-3 transition-colors ${isVibe ? '' : 'text-brand-red hover:text-vc-text'}`} style={isVibe ? dynTextStyle : undefined}>
                            Showcase Your Work →
                        </Link>
                    </div>
                );
            case 'cta-seeker':
                return (
                    <div className={`${tile.colSpan} p-5 md:p-6 flex flex-col justify-between min-h-[120px] transition-all duration-300`} style={{ background: bg }}>
                        <span className={`text-[9px] font-mono uppercase tracking-[0.2em] mb-2 transition-colors duration-300 ${isVibe ? 'opacity-60' : 'text-vc-text-secondary'}`} style={isVibe ? dynTextStyle : undefined}>For Seekers</span>
                        <p className={`text-[13px] leading-relaxed font-serif transition-colors duration-300 ${isVibe ? '' : 'text-vc-text'}`} style={isVibe ? dynTextStyle : undefined}>
                            Browse real projects, not PDF portfolios. See how fast they build. Hire with confidence.
                        </p>
                        <Link href="/explore" className={`text-[9px] font-mono uppercase tracking-[0.15em] mt-3 transition-colors ${isVibe ? '' : 'text-brand-red hover:text-vc-text'}`} style={isVibe ? dynTextStyle : undefined}>
                            Find a Builder →
                        </Link>
                    </div>
                );
            case 'community':
                return (
                    <div className={`${tile.colSpan} p-5 md:p-6 flex flex-col justify-between min-h-[120px] transition-all duration-300`} style={{ background: isVibe ? dynBg : 'var(--vc-dark)' }}>
                        <span className={`text-[9px] font-mono uppercase tracking-[0.2em] mb-2 transition-colors duration-300 ${isVibe ? 'opacity-60' : 'text-white/40'}`} style={isVibe ? dynTextStyle : undefined}>Open & Transparent</span>
                        <p className={`text-[13px] leading-relaxed font-serif transition-colors duration-300 ${isVibe ? '' : 'text-white/80'}`} style={isVibe ? dynTextStyle : undefined}>
                            All hire requests are public GitHub Issues. Discussions are open. Everything is auditable.
                        </p>
                        <div className="flex items-center gap-4 mt-3">
                            <Link href="/explore" className={`text-[9px] font-mono uppercase tracking-[0.15em] transition-colors ${isVibe ? '' : 'text-brand-red hover:text-white'}`} style={isVibe ? dynTextStyle : undefined}>
                                Browse Requests →
                            </Link>
                            <span className={`text-[8px] font-mono uppercase tracking-wider transition-colors duration-300 ${isVibe ? 'opacity-40' : 'text-white/30'}`} style={isVibe ? dynTextStyle : undefined}>Powered by GitHub</span>
                        </div>
                    </div>
                );
            case 'filler':
                return (
                    <div className={`${tile.colSpan} min-h-[120px] transition-all duration-300`} style={{ backgroundColor: isVibe ? `${palColor}1A` : 'var(--vc-skeleton)' }} />
                );
            case 'vibeloper': {
                const v = tile.vibeloper!;
                const colors = avatarColors[v.username];
                const primary = colors?.primary || '#242423';
                const textClr = colors?.textColor || '#ffffff';
                const subClr = textClr === '#ffffff' ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)';
                return (
                    <div className={`${tile.colSpan} aspect-square relative overflow-hidden bg-vc-dark`}>
                        {v.avatar_url ? (
                            <Image
                                src={v.avatar_url}
                                alt={v.name}
                                fill
                                className="object-cover"
                            />
                        ) : (
                            <div
                                className="absolute inset-0 flex items-center justify-center text-3xl font-serif"
                                style={{ backgroundColor: primary, color: textClr }}
                            >
                                {v.name.charAt(0)}
                            </div>
                        )}
                        <div className="absolute bottom-0 inset-x-0 px-3 py-2.5">
                            <h3 className="text-sm font-serif leading-tight drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]" style={{ color: textClr }}>{v.name}</h3>
                            <p className="text-[10px] mt-0.5 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]" style={{ color: subClr }}>{v.role || `@${v.username}`}</p>
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
