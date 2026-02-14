'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { PageShell } from '@/components/layout/PageShell';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { GRID_CLASSES, ACCENTS } from '@/lib/vibe';

interface Stats {
    total_builders: number;
    total_showcases: number;
    total_views: number;
    open_hire_requests: number;
    total_reviews: number;
}

interface Builder {
    username: string;
    name: string;
    avatar_url: string;
    role: string;
    showcase_count: number;
    total_views: number;
    available_for_hire: boolean;
    created_at: string;
}

interface RateLimit {
    remaining: number;
    limit: number;
    reset: string;
}

export function AdminDashboard() {
    const [stats, setStats] = useState<Stats | null>(null);
    const [builders, setBuilders] = useState<Builder[]>([]);
    const [rateLimit, setRateLimit] = useState<RateLimit | null>(null);
    const [loading, setLoading] = useState(true);
    const [vibeLocked, setVibeLocked] = useState(false);
    const [hovered, setHovered] = useState(false);
    const isVibe = vibeLocked || hovered;
    const toggleVibe = useCallback(() => setVibeLocked(v => !v), []);

    useEffect(() => {
        fetch('/api/admin')
            .then(r => r.ok ? r.json() : null)
            .then(d => {
                if (d) {
                    setStats(d.stats);
                    setBuilders(d.builders || []);
                    setRateLimit(d.rate_limit);
                }
            })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    const breadcrumbs = (
        <div className="flex items-center gap-2 text-[#9b9a97]">
            <Link href="/" className="flex items-center gap-2 hover:text-[#37352f] transition-colors font-medium">
                <div className="w-3 h-3 bg-brand-red rounded-[2px]" />
                <span>VibeCoder</span>
            </Link>
            <span className="text-[#d5d5d3]">/</span>
            <span className="text-[#37352f] font-medium">admin</span>
        </div>
    );

    if (loading) {
        return (
            <PageShell>
                <Header breadcrumbs={breadcrumbs} />
                <div className="flex items-center justify-center min-h-[300px]">
                    <span className="text-[11px] font-mono text-[#9b9a97] uppercase tracking-[0.15em] animate-pulse">Loading dashboard...</span>
                </div>
                <Footer />
            </PageShell>
        );
    }

    const statTiles = stats ? [
        { label: 'Builders', value: stats.total_builders, accent: ACCENTS[0] },
        { label: 'Showcases', value: stats.total_showcases, accent: ACCENTS[1] },
        { label: 'Total Views', value: stats.total_views, accent: ACCENTS[2] },
        { label: 'Open Requests', value: stats.open_hire_requests, accent: ACCENTS[3] },
        { label: 'Reviews', value: stats.total_reviews, accent: ACCENTS[4] || ACCENTS[0] },
    ] : [];

    return (
        <PageShell>
            <Header breadcrumbs={breadcrumbs} />
            <section>
                <div className={GRID_CLASSES}>
                    {/* Artode */}
                    <div
                        className={`col-span-1 aspect-square flex items-center justify-center cursor-pointer transition-all duration-300 bg-[#242423] ${vibeLocked ? 'ring-2 ring-inset ring-brand-red/50' : ''}`}
                        onMouseEnter={() => setHovered(true)}
                        onMouseLeave={() => setHovered(false)}
                        onClick={(e) => { e.stopPropagation(); toggleVibe(); }}
                    >
                        <div className={`w-10 h-10 transition-all duration-300 ${vibeLocked ? 'bg-brand-red scale-110' : isVibe ? 'bg-brand-red scale-105' : 'bg-white'}`} />
                    </div>

                    {/* Title */}
                    <div className="col-span-2 md:col-span-2 p-6 md:p-8 flex flex-col justify-center min-h-[120px] transition-all duration-300 bg-[#242423]">
                        <span className="text-[9px] font-mono uppercase tracking-[0.2em] mb-3 text-white/40">Admin</span>
                        <span className="text-lg md:text-xl font-serif text-white">Platform Dashboard</span>
                    </div>

                    {/* Health check */}
                    <div className="col-span-1 p-4 flex flex-col items-center justify-center min-h-[120px] transition-all duration-300 bg-white">
                        {rateLimit && (
                            <>
                                <span className="text-lg font-bold font-mono" style={{ color: rateLimit.remaining < 100 ? '#d80018' : '#0e8a16' }}>
                                    {rateLimit.remaining}
                                </span>
                                <span className="text-[8px] font-mono text-[#9b9a97] uppercase tracking-wider">/ {rateLimit.limit}</span>
                                <span className="text-[8px] font-mono text-[#9b9a97] uppercase tracking-wider mt-1">API Calls Left</span>
                            </>
                        )}
                    </div>

                    {/* Stat tiles */}
                    {statTiles.map((s) => (
                        <div key={s.label} className="col-span-1 p-4 flex flex-col items-center justify-center min-h-[100px] transition-all duration-300"
                            style={{ background: isVibe ? `radial-gradient(circle, ${s.accent}15 0%, white 70%)` : 'white' }}>
                            <span className="text-2xl font-bold font-mono transition-colors" style={{ color: isVibe ? s.accent : '#37352f' }}>
                                {s.value.toLocaleString()}
                            </span>
                            <span className="text-[9px] font-mono uppercase tracking-[0.2em] mt-1 text-[#9b9a97]">{s.label}</span>
                        </div>
                    ))}

                    {/* Filler to complete row */}
                    {statTiles.length % 4 !== 0 && Array.from({ length: 4 - (statTiles.length % 4) + (4 - 1) }).map((_, i) => (
                        <div key={`f${i}`} className="col-span-1 min-h-[100px] transition-all duration-300" style={{ backgroundColor: isVibe ? `${ACCENTS[i % ACCENTS.length]}0A` : '#f0f0ef' }} />
                    ))}

                    {/* Builder list header */}
                    <div className="col-span-2 md:col-span-4 p-4 bg-[#f7f6f3]">
                        <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-[#9b9a97]">All Builders ({builders.length})</span>
                    </div>

                    {/* Builder rows */}
                    {builders.map((b, i) => (
                        <Link key={b.username} href={`/m/${b.username}`} className="contents">
                            <div className="col-span-2 p-4 md:p-5 flex items-center gap-3 min-h-[70px] bg-white group hover:bg-[#fafaf9] transition-colors">
                                {b.avatar_url && (
                                    <Image src={b.avatar_url} alt="" width={28} height={28} className="rounded-sm" />
                                )}
                                <div className="flex-1 min-w-0">
                                    <span className="text-sm font-serif text-[#37352f] group-hover:text-brand-red transition-colors block truncate">{b.name}</span>
                                    <span className="text-[10px] font-mono text-[#9b9a97]">{b.role || 'No role set'}</span>
                                </div>
                                <div className="flex items-center gap-3 text-[10px] font-mono text-[#9b9a97]">
                                    <span>{b.showcase_count} sc</span>
                                    <span>{b.total_views} views</span>
                                    {b.available_for_hire && (
                                        <span className="text-green-600">● hire</span>
                                    )}
                                </div>
                            </div>
                        </Link>
                    ))}

                    {builders.length % 2 !== 0 && (
                        <div className="col-span-2 min-h-[70px] bg-[#f0f0ef]" />
                    )}
                </div>
            </section>
            <Footer />
        </PageShell>
    );
}
