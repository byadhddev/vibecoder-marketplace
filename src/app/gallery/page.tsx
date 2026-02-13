'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { PageShell } from '@/components/layout/PageShell';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { VIBE_RAW_COLORS, GRID_CLASSES } from '@/lib/vibe';
import { extractColorsFromImage, type ExtractedColors } from '@/lib/colors';

interface VibeloperSummary {
    username: string;
    name: string;
    avatar_url: string;
    showcase_count: number;
}

type TileVariant = 'artode' | 'title' | 'counter' | 'filler' | 'vibeloper';

interface Tile {
    id: string;
    colSpan: string;
    variant: TileVariant;
    href?: string;
    vibeloper?: VibeloperSummary;
}

export default function GalleryPage() {
    const [vibelopers, setVibelopers] = useState<VibeloperSummary[]>([]);
    const [tiles, setTiles] = useState<Tile[]>([]);
    const [vibeLocked, setVibeLocked] = useState(false);
    const [hovered, setHovered] = useState(false);
    const [avatarColors, setAvatarColors] = useState<Record<string, ExtractedColors>>({});
    const isVibe = vibeLocked || hovered;
    const toggleVibe = useCallback(() => setVibeLocked(v => !v), []);

    useEffect(() => {
        fetch('/api/marketplace/vibelopers')
            .then(r => r.json())
            .then(d => {
                const sorted = (d.vibelopers || []).sort((a: VibeloperSummary, b: VibeloperSummary) => b.showcase_count - a.showcase_count);
                setVibelopers(sorted);
            })
            .catch(() => {});
    }, []);

    useEffect(() => {
        vibelopers.forEach(v => {
            if (v.avatar_url && !avatarColors[v.username]) {
                extractColorsFromImage(v.avatar_url).then(c => setAvatarColors(prev => ({ ...prev, [v.username]: c })));
            }
        });
    }, [vibelopers]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        const decorative: Tile[] = [
            { id: 'artode', colSpan: 'col-span-1', variant: 'artode' },
            { id: 'title', colSpan: 'col-span-2 md:col-span-2', variant: 'title' },
            { id: 'counter', colSpan: 'col-span-1', variant: 'counter' },
        ];
        const vTiles: Tile[] = vibelopers.map((v, i) => ({
            id: v.username,
            colSpan: i === 0 ? 'col-span-2 md:col-span-2' : 'col-span-1',
            variant: 'vibeloper' as const,
            href: `/m/${v.username}`,
            vibeloper: v,
        }));
        const total = decorative.length + vTiles.length;
        const fillers: Tile[] = [];
        // Pad to fill a 4-col row
        const remainder = total % 4;
        if (remainder !== 0) {
            for (let i = 0; i < 4 - remainder; i++) fillers.push({ id: `filler-${i}`, colSpan: 'col-span-1', variant: 'filler' });
        }
        setTiles([...decorative, ...vTiles, ...fillers]);
    }, [vibelopers]);

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
                    <div className={`${tile.colSpan} p-6 md:p-8 flex flex-col justify-center min-h-[120px] transition-all duration-300`} style={{ background: isVibe ? dynBg : '#242423' }}>
                        <span className={`text-[9px] font-mono uppercase tracking-[0.2em] mb-3 transition-colors duration-300 ${isVibe ? 'opacity-60' : 'text-white/40'}`} style={isVibe ? dynTextStyle : undefined}>VibeCoder</span>
                        <span className={`text-lg md:text-xl font-serif leading-tight transition-colors duration-300 ${isVibe ? '' : 'text-white'}`} style={isVibe ? dynTextStyle : undefined}>Gallery</span>
                    </div>
                );
            case 'counter':
                return (
                    <div className={`${tile.colSpan} flex flex-col items-center justify-center p-6 min-h-[120px] transition-all duration-300`} style={{ background: bg }}>
                        <span className={`text-3xl font-bold font-mono transition-colors duration-300 ${isVibe ? '' : 'text-[#37352f]'}`} style={isVibe ? dynTextStyle : undefined}>{vibelopers.length}</span>
                        <span className="text-[9px] font-mono text-[#9b9a97] uppercase tracking-[0.2em] mt-1">Vibelopers</span>
                    </div>
                );
            case 'filler':
                return (
                    <div className={`${tile.colSpan} min-h-[120px] transition-all duration-300`} style={{ backgroundColor: isVibe ? `${palColor}1A` : '#f0f0ef' }} />
                );
            case 'vibeloper': {
                const v = tile.vibeloper!;
                const colors = avatarColors[v.username];
                const textClr = colors?.textColor || '#ffffff';
                const subClr = textClr === '#ffffff' ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)';
                const isFirst = tile.colSpan.includes('col-span-2');
                return (
                    <div className={`${tile.colSpan} ${isFirst ? 'aspect-auto min-h-[200px]' : 'aspect-square'} relative overflow-hidden bg-[#242423]`}>
                        {v.avatar_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={v.avatar_url} alt={v.name} className="absolute inset-0 w-full h-full object-cover" />
                        ) : (
                            <div className="absolute inset-0 flex items-center justify-center text-white text-3xl font-serif">{v.name.charAt(0)}</div>
                        )}
                        <div className="absolute bottom-0 inset-x-0 px-3 py-2.5">
                            <h3 className={`${isFirst ? 'text-base' : 'text-sm'} font-serif leading-tight drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]`} style={{ color: textClr }}>{v.name}</h3>
                            <div className="flex items-center justify-between mt-0.5">
                                <p className="text-[10px] drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]" style={{ color: subClr }}>{v.showcase_count} projects</p>
                            </div>
                        </div>
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
            <span className="text-[#37352f] font-medium">gallery</span>
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
