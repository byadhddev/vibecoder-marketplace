'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import type { Profile, Showcase } from '@/lib/db/types';
import { VIBE_RAW_COLORS } from '@/lib/vibe';
import { extractColorsFromImage } from '@/lib/colors';

interface ProjectEmbedProps {
    profile: Profile;
    showcase: Showcase;
}

export function ProjectEmbed({ profile, showcase }: ProjectEmbedProps) {
    const [vibeLocked, setVibeLocked] = useState(false);
    const [hovered, setHovered] = useState(false);
    const isVibe = vibeLocked || hovered;
    const toggleVibe = useCallback(() => setVibeLocked(v => !v), []);
    const [iframeLoaded, setIframeLoaded] = useState(false);
    const [palColor, setPalColor] = useState(VIBE_RAW_COLORS[0]);

    useEffect(() => {
        if (profile.avatar_url) {
            extractColorsFromImage(profile.avatar_url).then(c => setPalColor(c.primary));
        }
    }, [profile.avatar_url]);

    const dynBg = `radial-gradient(circle at center, ${palColor}26 0%, rgba(255,255,255,0) 70%)`;
    const dynTextStyle = { color: palColor };
    const bg = isVibe ? dynBg : 'white';
    const accentBg = isVibe ? dynBg : 'var(--vc-dark)';
    const accentTextCls = isVibe ? '' : 'text-white';

    return (
        <div className="flex flex-col h-screen">
            {/* Compact top bar */}
            <div
                className="flex items-center gap-3 px-4 py-2 border-b border-vc-border transition-all duration-300"
                style={{ background: bg }}
            >
                {/* Artode toggle */}
                <div
                    className="w-5 h-5 cursor-pointer transition-all duration-300 flex-shrink-0"
                    style={{ backgroundColor: isVibe ? palColor : 'var(--vc-dark)' }}
                    onMouseEnter={() => setHovered(true)}
                    onMouseLeave={() => setHovered(false)}
                    onClick={toggleVibe}
                />

                {/* Breadcrumbs */}
                <nav className="flex items-center gap-1.5 text-[11px] font-mono min-w-0">
                    <Link
                        href="/"
                        className={`flex items-center gap-1.5 hover:opacity-80 transition-colors ${isVibe ? 'opacity-50' : 'text-vc-text-secondary'}`}
                        style={isVibe ? dynTextStyle : undefined}
                    >
                        <div className="w-2.5 h-2.5 bg-brand-red rounded-[1px] flex-shrink-0" />
                        <span>VibeCoder</span>
                    </Link>
                    <span className={isVibe ? 'opacity-30' : 'text-vc-text-muted'} style={isVibe ? dynTextStyle : undefined}>/</span>
                    <Link
                        href={`/m/${profile.username}`}
                        className={`hover:opacity-80 transition-colors truncate ${isVibe ? 'opacity-50' : 'text-vc-text-secondary'}`}
                        style={isVibe ? dynTextStyle : undefined}
                    >
                        {profile.username}
                    </Link>
                    <span className={isVibe ? 'opacity-30' : 'text-vc-text-muted'} style={isVibe ? dynTextStyle : undefined}>/</span>
                    <span className={`font-medium truncate ${isVibe ? '' : 'text-vc-text'}`} style={isVibe ? dynTextStyle : undefined}>
                        {showcase.title}
                    </span>
                </nav>

                <div className="flex-1" />

                {/* Tags */}
                {showcase.tags.length > 0 && (
                    <span className={`text-[8px] font-mono uppercase tracking-wider flex-shrink-0 ${isVibe ? 'opacity-40' : 'text-vc-text-secondary'}`} style={isVibe ? dynTextStyle : undefined}>
                        {showcase.tags.slice(0, 3).join(' · ')}
                    </span>
                )}

                {/* Links */}
                <div className="flex items-center gap-2 flex-shrink-0">
                    {showcase.source_url && (
                        <a
                            href={showcase.source_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`text-[9px] font-mono uppercase tracking-[0.15em] px-2 py-1 rounded-sm transition-all duration-300 ${isVibe ? 'opacity-60 hover:opacity-100' : 'text-vc-text-secondary hover:text-vc-text'}`}
                            style={isVibe ? dynTextStyle : undefined}
                        >
                            Source ↗
                        </a>
                    )}
                    {showcase.post_url && (
                        <a
                            href={showcase.post_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`text-[9px] font-mono uppercase tracking-[0.15em] px-2 py-1 rounded-sm transition-all duration-300 ${isVibe ? 'opacity-60 hover:opacity-100' : 'text-vc-text-secondary hover:text-vc-text'}`}
                            style={isVibe ? dynTextStyle : undefined}
                        >
                            Post ↗
                        </a>
                    )}
                    <a
                        href={showcase.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`text-[9px] font-mono uppercase tracking-[0.15em] px-2 py-1 rounded-sm transition-all duration-300 flex-shrink-0 ${accentTextCls}`}
                        style={{ backgroundColor: accentBg }}
                    >
                        Live ↗
                    </a>
                </div>
            </div>

            {/* Iframe */}
            <div className="flex-1 relative">
                {!iframeLoaded && (
                    <div className="absolute inset-0 flex items-center justify-center bg-[#fafaf9]">
                        <div className="flex flex-col items-center gap-3">
                            <div className="w-6 h-6 border-2 border-vc-border border-t-brand-red rounded-full animate-spin" />
                            <span className="text-[11px] font-mono text-vc-text-secondary uppercase tracking-wider">Loading project…</span>
                        </div>
                    </div>
                )}
                <iframe
                    src={showcase.url}
                    className="w-full h-full border-0"
                    title={showcase.title}
                    onLoad={() => setIframeLoaded(true)}
                    sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
                    allow="clipboard-read; clipboard-write"
                />
            </div>
        </div>
    );
}
