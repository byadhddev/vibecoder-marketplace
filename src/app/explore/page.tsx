'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { PageShell } from '@/components/layout/PageShell';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { VIBE_RAW_COLORS, ACCENTS, randomShuffle, GRID_CLASSES } from '@/lib/vibe';
import { extractColorsFromImage, type ExtractedColors } from '@/lib/colors';

interface ShowcaseWithUser {
    slug: string;
    title: string;
    description: string;
    url: string;
    tags: string[];
    views_count: number;
    clicks_count: number;
    _user: { username: string; name: string; avatar_url: string };
}

type TileVariant = 'artode' | 'title' | 'counter' | 'filter' | 'filler' | 'showcase';

interface Tile {
    id: string;
    colSpan: string;
    variant: TileVariant;
    href?: string;
    showcase?: ShowcaseWithUser;
}

export default function ExplorePage() {
    const [showcases, setShowcases] = useState<ShowcaseWithUser[]>([]);
    const [allTags, setAllTags] = useState<string[]>([]);
    const [activeTag, setActiveTag] = useState<string | null>(null);
    const [shuffledTiles, setShuffledTiles] = useState<Tile[]>([]);
    const [vibeLocked, setVibeLocked] = useState(false);
    const [hovered, setHovered] = useState(false);
    const [avatarColors, setAvatarColors] = useState<Record<string, ExtractedColors>>({});
    const isVibe = vibeLocked || hovered;
    const toggleVibe = useCallback(() => setVibeLocked(v => !v), []);

    useEffect(() => {
        const url = activeTag ? `/api/marketplace/explore?tag=${encodeURIComponent(activeTag)}` : '/api/marketplace/explore';
        fetch(url)
            .then(r => r.json())
            .then(d => {
                setShowcases(d.showcases || []);
                if (!activeTag) setAllTags(d.tags || []);
            })
            .catch(() => {});
    }, [activeTag]);

    useEffect(() => {
        const users = new Map<string, string>();
        showcases.forEach(s => { if (s._user.avatar_url) users.set(s._user.username, s._user.avatar_url); });
        users.forEach((url, username) => {
            if (!avatarColors[username]) {
                extractColorsFromImage(url).then(c => setAvatarColors(prev => ({ ...prev, [username]: c })));
            }
        });
    }, [showcases]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        const decorative: Tile[] = [
            { id: 'artode', colSpan: 'col-span-1', variant: 'artode' },
            { id: 'title', colSpan: 'col-span-2 md:col-span-2', variant: 'title' },
            { id: 'counter', colSpan: 'col-span-1', variant: 'counter' },
            { id: 'filter', colSpan: 'col-span-2 md:col-span-4', variant: 'filter' },
        ];
        const scTiles: Tile[] = showcases.map(s => ({
            id: `${s._user.username}/${s.slug}`,
            colSpan: 'col-span-2 md:col-span-2',
            variant: 'showcase' as const,
            href: `/m/${s._user.username}/${s.slug}`,
            showcase: s,
        }));
        if (scTiles.length % 2 !== 0) scTiles.push({ id: 'filler', colSpan: 'col-span-2 md:col-span-2', variant: 'filler' });
        setShuffledTiles([...decorative, ...scTiles]);
    }, [showcases]);

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
                        <span className={`text-lg md:text-xl font-serif leading-tight transition-colors duration-300 ${isVibe ? '' : 'text-white'}`} style={isVibe ? dynTextStyle : undefined}>Explore</span>
                    </div>
                );
            case 'counter':
                return (
                    <div className={`${tile.colSpan} flex flex-col items-center justify-center p-6 min-h-[120px] transition-all duration-300`} style={{ background: bg }}>
                        <span className={`text-3xl font-bold font-mono transition-colors duration-300 ${isVibe ? '' : 'text-[#37352f]'}`} style={isVibe ? dynTextStyle : undefined}>{showcases.length}</span>
                        <span className="text-[9px] font-mono text-[#9b9a97] uppercase tracking-[0.2em] mt-1">Projects</span>
                    </div>
                );
            case 'filter':
                return (
                    <div className={`${tile.colSpan} p-4 md:p-5 flex flex-wrap items-center gap-2 min-h-[60px] transition-all duration-300`} style={{ background: bg }}>
                        <button onClick={() => setActiveTag(null)}
                            className={`text-[9px] font-mono uppercase tracking-[0.15em] px-2 py-1 transition-colors ${!activeTag ? 'text-brand-red font-bold' : 'text-[#9b9a97] hover:text-[#37352f]'}`}>
                            All
                        </button>
                        {allTags.slice(0, 12).map(tag => (
                            <button key={tag} onClick={() => setActiveTag(tag)}
                                className={`text-[9px] font-mono uppercase tracking-[0.15em] px-2 py-1 transition-colors ${activeTag === tag ? 'text-brand-red font-bold' : 'text-[#9b9a97] hover:text-[#37352f]'}`}>
                                {tag}
                            </button>
                        ))}
                    </div>
                );
            case 'filler':
                return (
                    <div className={`${tile.colSpan} min-h-[120px] transition-all duration-300`} style={{ backgroundColor: isVibe ? `${palColor}1A` : '#f0f0ef' }} />
                );
            case 'showcase': {
                const s = tile.showcase!;
                const userColors = avatarColors[s._user.username];
                const accent = userColors?.primary || ACCENTS[index % ACCENTS.length];
                return (
                    <div className={`${tile.colSpan} p-5 md:p-6 flex flex-col justify-between min-h-[140px] md:min-h-[160px] group transition-all duration-300`} style={{ background: bg }}>
                        <div className="flex items-center gap-3">
                            {s._user.avatar_url && (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={s._user.avatar_url} alt="" className="w-5 h-5 rounded-sm" />
                            )}
                            <span className="text-[10px] font-mono text-[#9b9a97]">{s._user.name}</span>
                            <div className="flex-1 h-px transition-colors duration-300" style={{ backgroundColor: isVibe ? `${accent}4D` : `${accent}20` }} />
                            {s.tags[0] && <span className="text-[8px] font-mono text-[#9b9a97] uppercase tracking-wider">{s.tags[0]}</span>}
                        </div>
                        <div>
                            <h3 className={`text-base font-serif mb-1 transition-colors duration-300 ${isVibe ? '' : 'text-[#37352f] group-hover:text-brand-red'} md:text-lg`} style={isVibe ? { color: accent } : undefined}>
                                {s.title}
                            </h3>
                            <p className={`text-[12px] leading-relaxed transition-colors duration-300 ${isVibe ? 'opacity-60' : 'text-[#9b9a97]'}`} style={isVibe ? { color: accent } : undefined}>
                                {s.description}
                            </p>
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
            <span className="text-[#37352f] font-medium">explore</span>
        </div>
    );

    return (
        <PageShell>
            <Header breadcrumbs={breadcrumbs} />
            <section>
                <div className={GRID_CLASSES}>
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
