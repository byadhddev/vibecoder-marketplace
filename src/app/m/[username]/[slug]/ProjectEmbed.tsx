'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import type { Profile, Showcase } from '@/lib/db/types';
import { vibeColor, vibeText, vibeRaw } from '@/lib/vibe';

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

    const vt = vibeText(0);
    const bg = isVibe ? vibeColor(0) : 'white';
    const accentBg = isVibe ? vibeColor(1) : '#242423';
    const accentText = isVibe ? vibeText(1) : 'text-white';

    return (
        <div className="flex flex-col h-screen">
            {/* Compact top bar */}
            <div
                className="flex items-center gap-3 px-4 py-2 border-b border-[#ededeb] transition-all duration-300"
                style={{ background: bg }}
            >
                {/* Artode toggle */}
                <div
                    className="w-5 h-5 cursor-pointer transition-all duration-300 flex-shrink-0"
                    style={{ backgroundColor: isVibe ? vibeRaw(0) : '#242423' }}
                    onMouseEnter={() => setHovered(true)}
                    onMouseLeave={() => setHovered(false)}
                    onClick={toggleVibe}
                />

                {/* Breadcrumbs */}
                <nav className="flex items-center gap-1.5 text-[11px] font-mono min-w-0">
                    <Link
                        href="/"
                        className={`flex items-center gap-1.5 hover:opacity-80 transition-colors ${isVibe ? `${vt} opacity-50` : 'text-[#9b9a97]'}`}
                    >
                        <div className="w-2.5 h-2.5 bg-brand-red rounded-[1px] flex-shrink-0" />
                        <span>VibeCoder</span>
                    </Link>
                    <span className={isVibe ? `${vt} opacity-30` : 'text-[#d5d5d3]'}>/</span>
                    <Link
                        href={`/m/${profile.username}`}
                        className={`hover:opacity-80 transition-colors truncate ${isVibe ? `${vt} opacity-50` : 'text-[#9b9a97]'}`}
                    >
                        {profile.username}
                    </Link>
                    <span className={isVibe ? `${vt} opacity-30` : 'text-[#d5d5d3]'}>/</span>
                    <span className={`font-medium truncate ${isVibe ? vt : 'text-[#37352f]'}`}>
                        {showcase.title}
                    </span>
                </nav>

                <div className="flex-1" />

                {/* Tags */}
                {showcase.tags.length > 0 && (
                    <span className={`text-[8px] font-mono uppercase tracking-wider flex-shrink-0 ${isVibe ? `${vt} opacity-40` : 'text-[#9b9a97]'}`}>
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
                            className={`text-[9px] font-mono uppercase tracking-[0.15em] px-2 py-1 rounded-sm transition-all duration-300 ${isVibe ? `${vt} opacity-60 hover:opacity-100` : 'text-[#9b9a97] hover:text-[#37352f]'}`}
                        >
                            Source ↗
                        </a>
                    )}
                    {showcase.post_url && (
                        <a
                            href={showcase.post_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`text-[9px] font-mono uppercase tracking-[0.15em] px-2 py-1 rounded-sm transition-all duration-300 ${isVibe ? `${vt} opacity-60 hover:opacity-100` : 'text-[#9b9a97] hover:text-[#37352f]'}`}
                        >
                            Post ↗
                        </a>
                    )}
                    <a
                        href={showcase.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`text-[9px] font-mono uppercase tracking-[0.15em] px-2 py-1 rounded-sm transition-all duration-300 flex-shrink-0 ${accentText}`}
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
                            <div className="w-6 h-6 border-2 border-[#ededeb] border-t-brand-red rounded-full animate-spin" />
                            <span className="text-[11px] font-mono text-[#9b9a97] uppercase tracking-wider">Loading project…</span>
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
