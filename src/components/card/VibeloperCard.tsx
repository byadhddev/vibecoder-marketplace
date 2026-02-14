'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import type { Profile, Showcase } from '@/lib/db/types';
import { extractColorsFromImage, type ExtractedColors } from '@/lib/colors';

interface VibeloperCardProps {
    profile: Profile;
    showcases: Showcase[];
    compact?: boolean;
}

export function VibeloperCard({ profile, showcases, compact = false }: VibeloperCardProps) {
    const [colors, setColors] = useState<ExtractedColors | null>(null);

    useEffect(() => {
        if (profile.avatar_url) {
            extractColorsFromImage(profile.avatar_url).then(setColors);
        }
    }, [profile.avatar_url]);

    const primary = colors?.primary || '#242423';
    const secondary = colors?.secondary || '#d80018';
    const textColor = colors?.textColor || '#ffffff';
    const totalClicks = showcases.reduce((sum, s) => sum + (s.clicks_count || 0), 0);
    const published = showcases.filter(s => s.status === 'published');

    return (
        <div
            className="relative overflow-hidden font-sans"
            style={{
                width: compact ? 320 : 400,
                background: 'var(--vc-dark)',
                fontFamily: "'Inter', system-ui, sans-serif",
            }}
        >
            {/* Avatar section */}
            <div className="relative" style={{ height: compact ? 140 : 180 }}>
                {profile.avatar_url ? (
                    <Image
                        src={profile.avatar_url}
                        alt=""
                        fill
                        className="object-cover"
                        crossOrigin="anonymous"
                    />
                ) : (
                    <div className="absolute inset-0" style={{ backgroundColor: primary }} />
                )}
                {/* Gradient overlay at bottom */}
                <div
                    className="absolute inset-x-0 bottom-0 h-20"
                    style={{ background: 'linear-gradient(to top, var(--vc-dark), transparent)' }}
                />
            </div>

            {/* Info section */}
            <div className="px-5 pb-5 -mt-8 relative">
                {/* Name + role */}
                <div className="mb-3">
                    <h2
                        className="text-lg font-serif font-medium leading-tight"
                        style={{ color: textColor }}
                    >
                        {profile.name}
                    </h2>
                    {profile.role && (
                        <p className="text-[11px] font-mono mt-0.5 opacity-60" style={{ color: textColor }}>
                            {profile.role}
                        </p>
                    )}
                </div>

                {/* Bio */}
                {profile.bio && !compact && (
                    <p className="text-[11px] leading-relaxed mb-3 opacity-50" style={{ color: textColor }}>
                        {profile.bio.length > 100 ? profile.bio.slice(0, 100) + '…' : profile.bio}
                    </p>
                )}

                {/* Stats row */}
                <div className="flex items-center gap-4 mb-3">
                    <div className="flex flex-col">
                        <span className="text-base font-bold font-mono" style={{ color: secondary }}>
                            {published.length}
                        </span>
                        <span className="text-[8px] font-mono uppercase tracking-[0.15em] opacity-40" style={{ color: textColor }}>
                            Showcases
                        </span>
                    </div>
                    <div className="w-px h-6 opacity-20" style={{ backgroundColor: textColor }} />
                    <div className="flex flex-col">
                        <span className="text-base font-bold font-mono" style={{ color: secondary }}>
                            {profile.total_views || 0}
                        </span>
                        <span className="text-[8px] font-mono uppercase tracking-[0.15em] opacity-40" style={{ color: textColor }}>
                            Views
                        </span>
                    </div>
                    {totalClicks > 0 && (
                        <>
                            <div className="w-px h-6 opacity-20" style={{ backgroundColor: textColor }} />
                            <div className="flex flex-col">
                                <span className="text-base font-bold font-mono" style={{ color: secondary }}>
                                    {totalClicks}
                                </span>
                                <span className="text-[8px] font-mono uppercase tracking-[0.15em] opacity-40" style={{ color: textColor }}>
                                    Clicks
                                </span>
                            </div>
                        </>
                    )}
                </div>

                {/* Top showcases */}
                {!compact && published.length > 0 && (
                    <div className="border-t border-white/10 pt-3 mb-3">
                        {published.slice(0, 3).map((s, i) => (
                            <div key={s.id} className="flex items-center gap-2 mb-1.5 last:mb-0">
                                <span className="text-[9px] font-mono opacity-30" style={{ color: textColor }}>
                                    {String(i + 1).padStart(2, '0')}
                                </span>
                                <div className="w-3 h-px opacity-20" style={{ backgroundColor: secondary }} />
                                <span className="text-[11px] font-serif truncate" style={{ color: textColor }}>
                                    {s.title}
                                </span>
                                {s.tags[0] && (
                                    <span className="text-[8px] font-mono uppercase tracking-wider opacity-30 ml-auto flex-shrink-0" style={{ color: textColor }}>
                                        {s.tags[0]}
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2" style={{ backgroundColor: secondary }} />
                        <span className="text-[9px] font-mono opacity-40" style={{ color: textColor }}>
                            vibecoder.dev/m/{profile.username}
                        </span>
                    </div>
                    <span className="text-[8px] font-mono uppercase tracking-[0.2em] opacity-30" style={{ color: textColor }}>
                        VibeCoder
                    </span>
                </div>
            </div>
        </div>
    );
}
