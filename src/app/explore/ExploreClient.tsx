'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { PageShell } from '@/components/layout/PageShell';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { VIBE_RAW_COLORS, ACCENTS, randomShuffle, GRID_CLASSES, vibeGradientFromHex } from '@/lib/vibe';
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

interface Builder {
    username: string;
    name: string;
    avatar_url: string;
    role: string;
    skills: string[];
    available_for_hire: boolean;
    showcase_count: number;
}

type TileVariant = 'artode' | 'title' | 'counter' | 'filter' | 'filler' | 'showcase' | 'builder' | 'open-requests';

interface HireRequestPreview {
    issue_number: number;
    description: string;
    html_url: string;
    created_at: string;
    builder?: string;
}

interface Tile {
    id: string;
    colSpan: string;
    variant: TileVariant;
    href?: string;
    showcase?: ShowcaseWithUser;
    builder?: Builder;
}

export default function ExploreClient({ initialData }: {
    initialData?: { showcases: ShowcaseWithUser[]; builders: Builder[]; tags: string[]; skills: string[] };
}) {
    const [showcases, setShowcases] = useState<ShowcaseWithUser[]>(initialData?.showcases ?? []);
    const [builders, setBuilders] = useState<Builder[]>(initialData?.builders ?? []);
    const [allTags, setAllTags] = useState<string[]>(initialData?.tags ?? []);
    const [allSkills, setAllSkills] = useState<string[]>(initialData?.skills ?? []);
    const [activeTag, setActiveTag] = useState<string | null>(null);
    const [activeSkill, setActiveSkill] = useState<string | null>(null);
    const [availableOnly, setAvailableOnly] = useState(false);
    const [viewMode, setViewMode] = useState<'showcases' | 'builders'>('showcases');
    const [shuffledTiles, setShuffledTiles] = useState<Tile[]>([]);
    const [openRequests, setOpenRequests] = useState<HireRequestPreview[]>([]);
    const [vibeLocked, setVibeLocked] = useState(false);
    const [hovered, setHovered] = useState(false);
    const [avatarColors, setAvatarColors] = useState<Record<string, ExtractedColors>>({});
    const isVibe = vibeLocked || hovered;
    const toggleVibe = useCallback(() => setVibeLocked(v => !v), []);

    useEffect(() => {
        // Skip initial fetch if server-provided data and no active filters
        if (initialData && !activeTag && !activeSkill && !availableOnly) return;
        const params = new URLSearchParams();
        if (activeTag) params.set('tag', activeTag);
        if (activeSkill) params.set('skill', activeSkill);
        if (availableOnly) params.set('available', 'true');
        const url = `/api/marketplace/explore${params.toString() ? `?${params}` : ''}`;
        fetch(url)
            .then(r => r.json())
            .then(d => {
                setShowcases(d.showcases || []);
                setBuilders(d.builders || []);
                if (!activeTag && !activeSkill) {
                    setAllTags(d.tags || []);
                    setAllSkills(d.skills || []);
                }
            })
            .catch(() => {});
    }, [activeTag, activeSkill, availableOnly]);

    useEffect(() => {
        fetch('/api/marketplace/explore/requests')
            .then(r => r.ok ? r.json() : { requests: [] })
            .then(d => setOpenRequests(d.requests || []))
            .catch(() => {});
    }, []);

    useEffect(() => {
        const users = new Map<string, string>();
        showcases.forEach(s => { if (s._user.avatar_url) users.set(s._user.username, s._user.avatar_url); });
        builders.forEach(b => { if (b.avatar_url) users.set(b.username, b.avatar_url); });
        users.forEach((url, username) => {
            if (!avatarColors[username]) {
                extractColorsFromImage(url).then(c => setAvatarColors(prev => ({ ...prev, [username]: c })));
            }
        });
    }, [showcases, builders]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        const decorative: Tile[] = [
            { id: 'artode', colSpan: 'col-span-1', variant: 'artode' },
            { id: 'title', colSpan: 'col-span-2 md:col-span-2', variant: 'title' },
            { id: 'counter', colSpan: 'col-span-1', variant: 'counter' },
            { id: 'filter', colSpan: 'col-span-2 md:col-span-4', variant: 'filter' },
        ];
        if (openRequests.length > 0) {
            decorative.push({ id: 'open-requests', colSpan: 'col-span-2 md:col-span-4', variant: 'open-requests' });
        }
        if (viewMode === 'builders') {
            const builderTiles: Tile[] = builders.map(b => ({
                id: `builder-${b.username}`,
                colSpan: 'col-span-2 md:col-span-2',
                variant: 'builder' as const,
                href: `/m/${b.username}`,
                builder: b,
            }));
            if (builderTiles.length % 2 !== 0) builderTiles.push({ id: 'filler', colSpan: 'col-span-2 md:col-span-2', variant: 'filler' });
            setShuffledTiles([...decorative, ...builderTiles]);
        } else {
            const scTiles: Tile[] = showcases.map(s => ({
                id: `${s._user.username}/${s.slug}`,
                colSpan: 'col-span-2 md:col-span-2',
                variant: 'showcase' as const,
                href: `/m/${s._user.username}/${s.slug}`,
                showcase: s,
            }));
            if (scTiles.length % 2 !== 0) scTiles.push({ id: 'filler', colSpan: 'col-span-2 md:col-span-2', variant: 'filler' });
            setShuffledTiles([...decorative, ...scTiles]);
        }
    }, [showcases, builders, viewMode, openRequests]);

    function renderTile(tile: Tile, index: number) {
        const extractedHexes = Object.values(avatarColors).flatMap(c => [c.primary, c.secondary]);
        const palette = extractedHexes.length > 0 ? extractedHexes : VIBE_RAW_COLORS;
        const palColor = palette[index % palette.length];
        const dynBg = vibeGradientFromHex(palColor);
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
                    <div className={`${tile.colSpan} p-6 md:p-8 flex flex-col justify-center min-h-[120px] transition-all duration-300`} style={{ background: isVibe ? dynBg : 'var(--vc-dark)' }}>
                        <span className={`text-[9px] font-mono uppercase tracking-[0.2em] mb-3 transition-colors duration-300 ${isVibe ? 'opacity-60' : 'text-white/40'}`} style={isVibe ? dynTextStyle : undefined}>VibeCoder</span>
                        <span className={`text-lg md:text-xl font-serif leading-tight transition-colors duration-300 ${isVibe ? '' : 'text-white'}`} style={isVibe ? dynTextStyle : undefined}>Explore</span>
                    </div>
                );
            case 'counter':
                return (
                    <div className={`${tile.colSpan} flex flex-col items-center justify-center p-6 min-h-[120px] transition-all duration-300`} style={{ background: bg }}>
                        <span className={`text-3xl font-bold font-mono transition-colors duration-300 ${isVibe ? '' : 'text-vc-text'}`} style={isVibe ? dynTextStyle : undefined}>{showcases.length}</span>
                        <span className="text-[9px] font-mono text-vc-text-secondary uppercase tracking-[0.2em] mt-1">Projects</span>
                    </div>
                );
            case 'filter':
                return (
                    <div className={`${tile.colSpan} p-4 md:p-5 flex flex-col gap-2 min-h-[60px] transition-all duration-300`} style={{ background: bg }}>
                        <div className="flex flex-wrap items-center gap-2">
                            <button onClick={() => setViewMode('showcases')}
                                className={`text-[9px] font-mono uppercase tracking-[0.15em] px-2 py-1 min-h-[36px] transition-colors ${viewMode === 'showcases' ? 'text-brand-red font-bold' : 'text-vc-text-secondary hover:text-vc-text'}`}>
                                Showcases
                            </button>
                            <button onClick={() => setViewMode('builders')}
                                className={`text-[9px] font-mono uppercase tracking-[0.15em] px-2 py-1 min-h-[36px] transition-colors ${viewMode === 'builders' ? 'text-brand-red font-bold' : 'text-vc-text-secondary hover:text-vc-text'}`}>
                                Builders
                            </button>
                            <div className="w-px h-3 bg-vc-border" />
                            <button onClick={() => setAvailableOnly(!availableOnly)}
                                className={`text-[9px] font-mono uppercase tracking-[0.15em] px-2 py-1 min-h-[36px] transition-colors ${availableOnly ? 'text-brand-red font-bold' : 'text-vc-text-secondary hover:text-vc-text'}`}>
                                {availableOnly ? '● Available' : 'Available'}
                            </button>
                        </div>
                        <div className="flex items-center gap-2 overflow-x-auto pb-1 -mb-1 scrollbar-none">
                            <button onClick={() => { setActiveTag(null); setActiveSkill(null); }}
                                className={`text-[9px] font-mono uppercase tracking-[0.15em] px-2 py-1 whitespace-nowrap transition-colors ${!activeTag && !activeSkill ? 'text-brand-red font-bold' : 'text-vc-text-secondary hover:text-vc-text'}`}>
                                All
                            </button>
                            {viewMode === 'showcases' ? (
                                allTags.slice(0, 12).map(tag => (
                                    <button key={tag} onClick={() => { setActiveTag(tag); setActiveSkill(null); }}
                                        className={`text-[9px] font-mono uppercase tracking-[0.15em] px-2 py-1 whitespace-nowrap transition-colors ${activeTag === tag ? 'text-brand-red font-bold' : 'text-vc-text-secondary hover:text-vc-text'}`}>
                                        {tag}
                                    </button>
                                ))
                            ) : (
                                allSkills.slice(0, 12).map(skill => (
                                    <button key={skill} onClick={() => { setActiveSkill(skill); setActiveTag(null); }}
                                        className={`text-[9px] font-mono uppercase tracking-[0.15em] px-2 py-1 whitespace-nowrap transition-colors ${activeSkill === skill ? 'text-brand-red font-bold' : 'text-vc-text-secondary hover:text-vc-text'}`}>
                                        {skill}
                                    </button>
                                ))
                            )}
                        </div>
                    </div>
                );
            case 'open-requests':
                return (
                    <div className={`${tile.colSpan} p-4 md:p-5 flex flex-col gap-2 min-h-[80px] transition-all duration-300`} style={{ background: bg }}>
                        <div className="flex items-center gap-3">
                            <span className="text-[10px] font-mono transition-colors duration-300" style={{ color: isVibe ? palColor : ACCENTS[0] }}>●</span>
                            <span className={`text-[10px] font-mono transition-colors duration-300 ${isVibe ? '' : 'text-vc-text'}`} style={isVibe ? dynTextStyle : undefined}>
                                {openRequests.length} open hire request{openRequests.length !== 1 ? 's' : ''} right now
                            </span>
                            <div className="flex-1 h-px transition-colors duration-300" style={{ backgroundColor: isVibe ? `${palColor}4D` : `${ACCENTS[0]}20` }} />
                            <span className={`text-[8px] font-mono uppercase tracking-wider ${isVibe ? 'opacity-40' : 'text-vc-text-secondary'}`} style={isVibe ? dynTextStyle : undefined}>Live</span>
                        </div>
                        <div className="flex flex-wrap gap-x-4 gap-y-1">
                            {openRequests.slice(0, 4).map(r => (
                                <a key={r.issue_number} href={r.html_url} target="_blank" rel="noopener noreferrer"
                                    className={`text-[9px] font-serif italic transition-colors truncate max-w-[200px] ${isVibe ? 'opacity-60' : 'text-vc-text-secondary hover:text-brand-red'}`}
                                    style={isVibe ? dynTextStyle : undefined}>
                                    &ldquo;{r.description.slice(0, 50)}{r.description.length > 50 ? '…' : ''}&rdquo;
                                </a>
                            ))}
                        </div>
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
                return (
                    <div className={`${tile.colSpan} p-5 md:p-6 flex flex-col justify-between min-h-[140px] md:min-h-[160px] group transition-all duration-300`} style={{ background: bg }}>
                        <div className="flex items-center gap-3">
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
                        <span className={`text-[9px] font-mono transition-colors duration-300 ${isVibe ? 'opacity-40' : 'text-vc-text-secondary'}`} style={isVibe ? { color: accent } : undefined}>
                            {b.showcase_count} showcase{b.showcase_count !== 1 ? 's' : ''}
                        </span>
                    </div>
                );
            }
            case 'showcase': {
                const s = tile.showcase!;
                const userColors = avatarColors[s._user.username];
                const accent = userColors?.primary || ACCENTS[index % ACCENTS.length];
                return (
                    <div className={`${tile.colSpan} p-5 md:p-6 flex flex-col justify-between min-h-[140px] md:min-h-[160px] group transition-all duration-300`} style={{ background: bg }}>
                        <div className="flex items-center gap-3">
                            {s._user.avatar_url && (
                                <Image src={s._user.avatar_url} alt="" width={20} height={20} className="rounded-sm" />
                            )}
                            <span className="text-[10px] font-mono text-vc-text-secondary">{s._user.name}</span>
                            <div className="flex-1 h-px transition-colors duration-300" style={{ backgroundColor: isVibe ? `${accent}4D` : `${accent}20` }} />
                            {s.tags[0] && <span className="text-[8px] font-mono text-vc-text-secondary uppercase tracking-wider">{s.tags[0]}</span>}
                        </div>
                        <div>
                            <h3 className={`text-base font-serif mb-1 transition-colors duration-300 ${isVibe ? '' : 'text-vc-text group-hover:text-brand-red'} md:text-lg`} style={isVibe ? { color: accent } : undefined}>
                                {s.title}
                            </h3>
                            <p className={`text-[12px] leading-relaxed transition-colors duration-300 ${isVibe ? 'opacity-60' : 'text-vc-text-secondary'}`} style={isVibe ? { color: accent } : undefined}>
                                {s.description}
                            </p>
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
            <span className="text-vc-text font-medium">explore</span>
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
