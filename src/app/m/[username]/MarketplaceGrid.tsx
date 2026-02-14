'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { PageShell } from '@/components/layout/PageShell';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import type { Profile, Showcase } from '@/lib/db/types';
import {
    ACCENTS, VIBE_RAW_COLORS,
    randomShuffle, GRID_CLASSES,
} from '@/lib/vibe';
import { extractColorsFromImage, type ExtractedColors } from '@/lib/colors';

type TileVariant = 'artode' | 'title' | 'counter' | 'status' | 'socials' | 'signature' | 'philosophy' | 'filler' | 'showcase' | 'views' | 'clicks' | 'share' | 'skills' | 'hire' | 'contact-form' | 'rate' | 'earned' | 'reviews';

interface Tile {
    id: string;
    colSpan: string;
    variant: TileVariant;
    href?: string;
    showcase?: Showcase;
}

function buildTiles(showcases: Showcase[], username: string, profile: Profile): Tile[] {
    const totalClicks = showcases.reduce((sum, s) => sum + (s.clicks_count || 0), 0);
    const decorative: Tile[] = [
        { id: 'artode', colSpan: 'col-span-1', variant: 'artode' },
        { id: 'title', colSpan: 'col-span-2 md:col-span-2', variant: 'title' },
        { id: 'counter', colSpan: 'col-span-1', variant: 'counter' },
        { id: 'status', colSpan: 'col-span-1', variant: 'status' },
        { id: 'views', colSpan: 'col-span-1', variant: 'views' },
        { id: 'socials', colSpan: 'col-span-2 md:col-span-2', variant: 'socials' },
        { id: 'signature', colSpan: 'col-span-2 md:col-span-2', variant: 'signature' },
        { id: 'share', colSpan: 'col-span-2 md:col-span-2', variant: 'share' },
        { id: 'reviews', colSpan: 'col-span-2 md:col-span-2', variant: 'reviews' },
        { id: 'philosophy', colSpan: 'col-span-2 md:col-span-2', variant: 'philosophy' },
    ];
    if ((profile.skills || []).length > 0) {
        decorative.push({ id: 'skills', colSpan: 'col-span-2 md:col-span-2', variant: 'skills' });
    }
    if (profile.available_for_hire) {
        decorative.push({ id: 'hire', colSpan: 'col-span-2 md:col-span-2', variant: 'hire' });
        decorative.push({ id: 'contact-form', colSpan: 'col-span-2 md:col-span-2', variant: 'contact-form' });
        if (profile.hourly_rate > 0) {
            decorative.push({ id: 'rate', colSpan: 'col-span-1', variant: 'rate' });
        }
    }
    if (totalClicks > 0) {
        decorative.push({ id: 'clicks', colSpan: 'col-span-1', variant: 'clicks' });
    }
    if ((profile.total_earned || 0) > 0) {
        decorative.push({ id: 'earned', colSpan: 'col-span-1', variant: 'earned' });
    }
    decorative.push({ id: 'filler', colSpan: 'col-span-1', variant: 'filler' });
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
    const [shuffledTiles, setShuffledTiles] = useState<Tile[]>(buildTiles(showcases, profile.username, profile));
    const [vibeLocked, setVibeLocked] = useState(false);
    const [hovered, setHovered] = useState(false);
    const [colors, setColors] = useState<ExtractedColors | null>(null);
    const [copied, setCopied] = useState<string | null>(null);
    const [contactForm, setContactForm] = useState({ name: '', email: '', description: '', budget: '', timeline: '' });
    const [contactSending, setContactSending] = useState(false);
    const [contactSent, setContactSent] = useState(false);
    const [contactIssueUrl, setContactIssueUrl] = useState<string | null>(null);
    const [feedbackCounts, setFeedbackCounts] = useState<Record<string, number>>({});
    const [reviews, setReviews] = useState<{ stars: number; body: string; reviewer: string; html_url: string; created_at: string }[]>([]);
    const [avgStars, setAvgStars] = useState(0);
    const isVibe = vibeLocked || hovered;

    const handleFeedback = async (showcaseSlug: string, showcaseTitle: string) => {
        const body = window.prompt(`Leave feedback on "${showcaseTitle}":`);
        if (!body) return;
        try {
            const res = await fetch('/api/marketplace/feedback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ builder_username: profile.username, showcase_slug: showcaseSlug, showcase_title: showcaseTitle, body }),
            });
            const data = await res.json();
            if (data.html_url) window.open(data.html_url, '_blank', 'noopener,noreferrer');
            else if (!res.ok) alert(data.error || 'Sign in to leave feedback');
        } catch { alert('Failed to submit feedback'); }
    };
    const toggleVibe = useCallback(() => setVibeLocked(v => !v), []);

    useEffect(() => {
        if (profile.avatar_url) {
            extractColorsFromImage(profile.avatar_url).then(setColors);
        }
    }, [profile.avatar_url]);

    // Track page view once on mount
    useEffect(() => {
        fetch('/api/marketplace/track', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: profile.username, type: 'page_view' }),
        }).catch(() => {});
    }, [profile.username]);

    // Fetch feedback counts for showcases
    useEffect(() => {
        fetch(`/api/marketplace/feedback?builder=${encodeURIComponent(profile.username)}`)
            .then(r => r.ok ? r.json() : { feedback: [] })
            .then(d => {
                setFeedbackCounts({ _total: d.feedback?.length || 0 });
            })
            .catch(() => {});
        // Fetch reviews
        fetch(`/api/marketplace/reviews?builder=${encodeURIComponent(profile.username)}`)
            .then(r => r.ok ? r.json() : { reviews: [], avg_stars: 0 })
            .then(d => {
                setReviews(d.reviews || []);
                setAvgStars(d.avg_stars || 0);
            })
            .catch(() => {});
    }, [profile.username]);

    useEffect(() => {
        setShuffledTiles(randomShuffle(buildTiles(showcases, profile.username, profile)));
    }, [showcases]);

    const handleShowcaseClick = (showcaseId: string) => {
        fetch('/api/marketplace/track', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ showcase_id: showcaseId, type: 'click' }),
        }).catch(() => {});
    };

    function renderTile(tile: Tile, index: number) {
        const palette = colors ? [colors.primary, colors.secondary] : VIBE_RAW_COLORS;
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
                    <div
                        className={`${tile.colSpan} p-6 md:p-8 flex flex-col justify-center min-h-[120px] transition-all duration-300`}
                        style={{ background: isVibe ? dynBg : '#242423' }}
                    >
                        <span className={`text-[9px] font-mono uppercase tracking-[0.2em] mb-3 transition-colors duration-300 ${isVibe ? 'opacity-60' : 'text-white/40'}`} style={isVibe ? dynTextStyle : undefined}>Marketplace</span>
                        <span className={`text-lg md:text-xl font-serif leading-tight transition-colors duration-300 ${isVibe ? '' : 'text-white'}`} style={isVibe ? dynTextStyle : undefined}>{profile.name}</span>
                    </div>
                );
            case 'counter':
                return (
                    <div className={`${tile.colSpan} flex flex-col items-center justify-center p-6 min-h-[120px] transition-all duration-300`} style={{ background: bg }}>
                        <span className={`text-3xl font-bold font-mono transition-colors duration-300 ${isVibe ? '' : 'text-[#37352f]'}`} style={isVibe ? dynTextStyle : undefined}>{showcases.length}</span>
                        <span className="text-[9px] font-mono text-[#9b9a97] uppercase tracking-[0.2em] mt-1">Showcases</span>
                    </div>
                );
            case 'views':
                return (
                    <div className={`${tile.colSpan} flex flex-col items-center justify-center p-6 min-h-[120px] transition-all duration-300`} style={{ background: bg }}>
                        <span className={`text-3xl font-bold font-mono transition-colors duration-300 ${isVibe ? '' : 'text-[#37352f]'}`} style={isVibe ? dynTextStyle : undefined}>{profile.total_views || 0}</span>
                        <span className="text-[9px] font-mono text-[#9b9a97] uppercase tracking-[0.2em] mt-1">Views</span>
                    </div>
                );
            case 'clicks': {
                const totalClicks = showcases.reduce((sum, s) => sum + (s.clicks_count || 0), 0);
                return (
                    <div className={`${tile.colSpan} flex flex-col items-center justify-center p-6 min-h-[120px] transition-all duration-300`} style={{ background: bg }}>
                        <span className={`text-3xl font-bold font-mono transition-colors duration-300 ${isVibe ? '' : 'text-[#37352f]'}`} style={isVibe ? dynTextStyle : undefined}>{totalClicks}</span>
                        <span className="text-[9px] font-mono text-[#9b9a97] uppercase tracking-[0.2em] mt-1">Clicks</span>
                    </div>
                );
            }
            case 'status':
                return (
                    <div className={`${tile.colSpan} aspect-square relative overflow-hidden bg-[#242423]`}>
                        {profile.avatar_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={profile.avatar_url} alt="" className="absolute inset-0 w-full h-full object-cover" />
                        ) : (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className={`text-[10px] font-mono uppercase tracking-[0.3em] font-bold ${isVibe ? '' : 'text-brand-red'}`} style={isVibe ? dynTextStyle : undefined}>Active</span>
                            </div>
                        )}
                        <div className="absolute bottom-0 inset-x-0 px-3 py-2">
                            <span className="text-[9px] font-mono text-white/70 uppercase tracking-[0.2em] drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">@{profile.username}</span>
                        </div>
                    </div>
                );
            case 'socials': {
                const links = (profile as Profile & { social_links?: Record<string, string> }).social_links || {};
                const socialEntries = Object.entries(links).filter(([, v]) => v);
                const website = (profile as Profile & { website?: string }).website;
                if (socialEntries.length === 0 && !website) {
                    return <div className={`${tile.colSpan} min-h-[60px] transition-all duration-300`} style={{ background: bg }} />;
                }
                return (
                    <div className={`${tile.colSpan} p-5 md:p-6 flex flex-col justify-center min-h-[80px] transition-all duration-300`} style={{ background: bg }}>
                        <div className="flex flex-wrap items-center gap-3">
                            {website && (
                                <a href={website.startsWith('http') ? website : `https://${website}`} target="_blank" rel="noopener noreferrer"
                                    className={`text-[9px] font-mono uppercase tracking-[0.15em] transition-colors ${isVibe ? '' : 'text-[#9b9a97] hover:text-[#37352f]'}`} style={isVibe ? dynTextStyle : undefined}>
                                    Website ↗
                                </a>
                            )}
                            {socialEntries.map(([key, val]) => {
                                const urls: Record<string, string> = { github: `https://github.com/${val}`, twitter: `https://x.com/${val}`, linkedin: `https://linkedin.com/in/${val}`, youtube: `https://youtube.com/@${val}`, instagram: `https://instagram.com/${val}`, devto: `https://dev.to/${val}`, medium: `https://medium.com/@${val}` };
                                return (
                                    <a key={key} href={urls[key] || val} target="_blank" rel="noopener noreferrer"
                                        className={`text-[9px] font-mono uppercase tracking-[0.15em] transition-colors ${isVibe ? '' : 'text-[#9b9a97] hover:text-[#37352f]'}`} style={isVibe ? dynTextStyle : undefined}>
                                        {key} ↗
                                    </a>
                                );
                            })}
                        </div>
                    </div>
                );
            }
            case 'signature':
                return (
                    <div className={`${tile.colSpan} p-6 md:p-8 flex items-center min-h-[80px] transition-all duration-300`} style={{ background: bg }}>
                        <div className="flex items-center gap-4">
                            <div className="w-8 h-px transition-colors duration-300" style={{ backgroundColor: isVibe ? palColor : 'rgba(216,0,24,0.3)' }} />
                            <span className={`text-sm font-serif italic transition-colors duration-300 ${isVibe ? '' : 'text-[#37352f]'}`} style={isVibe ? dynTextStyle : undefined}>
                                vibecoder.dev/m/{profile.username}
                            </span>
                        </div>
                    </div>
                );
            case 'philosophy':
                return (
                    <div className={`${tile.colSpan} p-6 md:p-8 flex items-center min-h-[80px] transition-all duration-300`} style={{ background: bg }}>
                        <p className={`text-[13px] leading-relaxed font-serif italic transition-colors duration-300 ${isVibe ? '' : 'text-[#37352f] opacity-70'}`} style={isVibe ? dynTextStyle : undefined}>
                            {profile.bio || profile.role || 'Building things that matter.'}
                        </p>
                    </div>
                );
            case 'share': {
                const profilePath = `/m/${profile.username}`;
                const embedPath = `/v/${profile.username}/embed`;
                const tweetText = encodeURIComponent(`Check out ${profile.name}'s showcase on VibeCoder ✦`);

                const getFullUrl = (path: string) => typeof window !== 'undefined' ? `${window.location.origin}${path}` : path;

                const copyToClipboard = (getText: () => string, label: string) => {
                    navigator.clipboard.writeText(getText()).then(() => {
                        setCopied(label);
                        setTimeout(() => setCopied(null), 2000);
                    }).catch(() => {});
                };

                const openShare = (buildUrl: () => string) => {
                    window.open(buildUrl(), '_blank', 'noopener,noreferrer');
                };

                return (
                    <div className={`${tile.colSpan} p-5 md:p-6 flex flex-col justify-between min-h-[80px] transition-all duration-300`} style={{ background: bg }}>
                        <div className="flex items-center gap-3 mb-3">
                            <span className="text-[10px] font-mono transition-colors duration-300" style={{ color: isVibe ? palColor : ACCENTS[3] }}>Share</span>
                            <div className="flex-1 h-px transition-colors duration-300" style={{ backgroundColor: isVibe ? `${palColor}4D` : `${ACCENTS[3]}20` }} />
                        </div>
                        <div className="flex flex-wrap items-center gap-3">
                            <button
                                onClick={() => copyToClipboard(() => getFullUrl(profilePath), 'link')}
                                className={`text-[9px] font-mono uppercase tracking-[0.15em] transition-colors ${isVibe ? '' : 'text-[#9b9a97] hover:text-[#37352f]'}`}
                                style={isVibe ? dynTextStyle : undefined}
                            >
                                {copied === 'link' ? 'Copied ✓' : 'Copy Link'}
                            </button>
                            <button
                                onClick={() => copyToClipboard(() => `<iframe src="${getFullUrl(embedPath)}" width="400" height="400" frameborder="0"></iframe>`, 'embed')}
                                className={`text-[9px] font-mono uppercase tracking-[0.15em] transition-colors ${isVibe ? '' : 'text-[#9b9a97] hover:text-[#37352f]'}`}
                                style={isVibe ? dynTextStyle : undefined}
                            >
                                {copied === 'embed' ? 'Copied ✓' : 'Embed'}
                            </button>
                            <button
                                onClick={() => openShare(() => `https://x.com/intent/tweet?text=${tweetText}&url=${encodeURIComponent(getFullUrl(profilePath))}`)}
                                className={`text-[9px] font-mono uppercase tracking-[0.15em] transition-colors ${isVibe ? '' : 'text-[#9b9a97] hover:text-[#37352f]'}`}
                                style={isVibe ? dynTextStyle : undefined}
                            >
                                Twitter ↗
                            </button>
                            <button
                                onClick={() => openShare(() => `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(getFullUrl(profilePath))}`)}
                                className={`text-[9px] font-mono uppercase tracking-[0.15em] transition-colors ${isVibe ? '' : 'text-[#9b9a97] hover:text-[#37352f]'}`}
                                style={isVibe ? dynTextStyle : undefined}
                            >
                                LinkedIn ↗
                            </button>
                        </div>
                    </div>
                );
            }
            case 'skills': {
                const skills = profile.skills || [];
                return (
                    <div className={`${tile.colSpan} p-5 md:p-6 flex flex-col justify-between min-h-[80px] transition-all duration-300`} style={{ background: bg }}>
                        <div className="flex items-center gap-3 mb-3">
                            <span className="text-[10px] font-mono transition-colors duration-300" style={{ color: isVibe ? palColor : ACCENTS[7 % ACCENTS.length] }}>Stack</span>
                            <div className="flex-1 h-px transition-colors duration-300" style={{ backgroundColor: isVibe ? `${palColor}4D` : `${ACCENTS[7 % ACCENTS.length]}20` }} />
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                            {skills.map(s => (
                                <span key={s} className={`text-[9px] font-mono uppercase tracking-wider px-2 py-0.5 rounded transition-colors duration-300 ${isVibe ? '' : 'text-[#9b9a97] bg-[#f0f0f0]'}`}
                                    style={isVibe ? { color: palColor, backgroundColor: `${palColor}15` } : undefined}>
                                    {s}
                                </span>
                            ))}
                        </div>
                    </div>
                );
            }
            case 'hire': {
                const rate = profile.hourly_rate;
                const rateLabel = profile.rate_type === 'hourly' ? '/hr' : profile.rate_type === 'project' ? '/project' : '';
                return (
                    <div className={`${tile.colSpan} p-5 md:p-6 flex items-center justify-between min-h-[60px] transition-all duration-300 bg-[#242423]`}>
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 bg-brand-red rounded-full animate-pulse" />
                            <span className="text-[11px] font-mono text-white uppercase tracking-[0.15em]">Available for Hire</span>
                        </div>
                        {rate > 0 && (
                            <span className="text-[12px] font-mono text-white/70">
                                ${rate}{rateLabel}
                            </span>
                        )}
                    </div>
                );
            }
            case 'contact-form': {
                const handleContactSubmit = async () => {
                    if (!contactForm.name || !contactForm.email || !contactForm.description) return;
                    setContactSending(true);
                    try {
                        const res = await fetch('/api/marketplace/contact', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ username: profile.username, ...contactForm }),
                        });
                        const data = await res.json();
                        setContactSent(true);
                        if (data.html_url) setContactIssueUrl(data.html_url);
                        setContactForm({ name: '', email: '', description: '', budget: '', timeline: '' });
                    } catch {}
                    setContactSending(false);
                };
                if (contactSent) {
                    return (
                        <div className={`${tile.colSpan} p-5 md:p-6 flex flex-col items-center justify-center gap-2 min-h-[120px] transition-all duration-300`} style={{ background: bg }}>
                            <span className={`text-[13px] font-serif italic transition-colors duration-300 ${isVibe ? '' : 'text-[#37352f]'}`} style={isVibe ? dynTextStyle : undefined}>
                                Request sent ✓ — {profile.name} will be in touch.
                            </span>
                            {contactIssueUrl && (
                                <a href={contactIssueUrl} target="_blank" rel="noopener noreferrer"
                                    className={`text-[9px] font-mono uppercase tracking-[0.15em] transition-colors ${isVibe ? '' : 'text-brand-red hover:text-[#37352f]'}`}
                                    style={isVibe ? dynTextStyle : undefined}>
                                    Track on GitHub ↗
                                </a>
                            )}
                        </div>
                    );
                }
                return (
                    <div className={`${tile.colSpan} p-5 md:p-6 flex flex-col gap-2 min-h-[200px] transition-all duration-300`} style={{ background: bg }}>
                        <div className="flex items-center gap-3 mb-1">
                            <span className="text-[10px] font-mono transition-colors duration-300" style={{ color: isVibe ? palColor : ACCENTS[0] }}>Contact</span>
                            <div className="flex-1 h-px transition-colors duration-300" style={{ backgroundColor: isVibe ? `${palColor}4D` : `${ACCENTS[0]}20` }} />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <input type="text" placeholder="Your name" value={contactForm.name}
                                onChange={e => setContactForm(prev => ({ ...prev, name: e.target.value }))}
                                className="bg-transparent border-b border-[#ededeb] focus:border-[#37352f] text-[12px] font-mono text-[#37352f] placeholder:text-[#9b9a97] outline-none pb-1 transition-colors" />
                            <input type="email" placeholder="Email" value={contactForm.email}
                                onChange={e => setContactForm(prev => ({ ...prev, email: e.target.value }))}
                                className="bg-transparent border-b border-[#ededeb] focus:border-[#37352f] text-[12px] font-mono text-[#37352f] placeholder:text-[#9b9a97] outline-none pb-1 transition-colors" />
                        </div>
                        <input type="text" placeholder="What do you need built?" value={contactForm.description}
                            onChange={e => setContactForm(prev => ({ ...prev, description: e.target.value }))}
                            className="w-full bg-transparent border-b border-[#ededeb] focus:border-[#37352f] text-[12px] font-serif text-[#37352f] placeholder:text-[#9b9a97] outline-none pb-1 transition-colors" />
                        <div className="grid grid-cols-2 gap-2">
                            <input type="text" placeholder="Budget range" value={contactForm.budget}
                                onChange={e => setContactForm(prev => ({ ...prev, budget: e.target.value }))}
                                className="bg-transparent border-b border-[#ededeb] focus:border-[#37352f] text-[12px] font-mono text-[#37352f] placeholder:text-[#9b9a97] outline-none pb-1 transition-colors" />
                            <input type="text" placeholder="Timeline" value={contactForm.timeline}
                                onChange={e => setContactForm(prev => ({ ...prev, timeline: e.target.value }))}
                                className="bg-transparent border-b border-[#ededeb] focus:border-[#37352f] text-[12px] font-mono text-[#37352f] placeholder:text-[#9b9a97] outline-none pb-1 transition-colors" />
                        </div>
                        <span className={`text-[8px] font-mono transition-colors duration-300 ${isVibe ? 'opacity-40' : 'text-[#9b9a97]'}`} style={isVibe ? dynTextStyle : undefined}>
                            ● This request will be public on GitHub for transparency
                        </span>
                        <button
                            onClick={handleContactSubmit}
                            disabled={contactSending || !contactForm.name || !contactForm.email || !contactForm.description}
                            className={`text-[9px] font-mono uppercase tracking-[0.15em] mt-1 self-start transition-colors disabled:opacity-30 ${isVibe ? '' : 'text-brand-red hover:text-[#37352f]'}`}
                            style={isVibe ? dynTextStyle : undefined}
                        >
                            {contactSending ? 'Sending…' : 'Send Request →'}
                        </button>
                    </div>
                );
            }
            case 'rate': {
                const rateLabel = profile.rate_type === 'hourly' ? '/hr' : profile.rate_type === 'project' ? '/proj' : '';
                return (
                    <div className={`${tile.colSpan} flex flex-col items-center justify-center p-6 min-h-[120px] transition-all duration-300`} style={{ background: bg }}>
                        <span className={`text-2xl font-bold font-mono transition-colors duration-300 ${isVibe ? '' : 'text-[#37352f]'}`} style={isVibe ? dynTextStyle : undefined}>
                            ${profile.hourly_rate}{rateLabel}
                        </span>
                        <span className="text-[9px] font-mono text-[#9b9a97] uppercase tracking-[0.2em] mt-1">Rate</span>
                    </div>
                );
            }
            case 'reviews': {
                const handleLeaveReview = async () => {
                    const starsStr = window.prompt('Rate this builder (1-5 stars):');
                    if (!starsStr) return;
                    const stars = parseInt(starsStr, 10);
                    if (isNaN(stars) || stars < 1 || stars > 5) { alert('Enter a number between 1 and 5'); return; }
                    const body = window.prompt('Write your review:');
                    if (!body) return;
                    try {
                        const res = await fetch('/api/marketplace/reviews', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ builder_username: profile.username, stars, body }),
                        });
                        const data = await res.json();
                        if (data.html_url) window.open(data.html_url, '_blank', 'noopener,noreferrer');
                        else if (!res.ok) alert(data.error || 'Sign in to leave a review');
                    } catch { alert('Failed to submit review'); }
                };
                return (
                    <div className={`${tile.colSpan} p-5 md:p-6 flex flex-col gap-2 min-h-[100px] transition-all duration-300`} style={{ background: bg }}>
                        <div className="flex items-center gap-3">
                            <span className="text-[10px] font-mono transition-colors duration-300" style={{ color: isVibe ? palColor : ACCENTS[0] }}>Reviews</span>
                            <div className="flex-1 h-px transition-colors duration-300" style={{ backgroundColor: isVibe ? `${palColor}4D` : `${ACCENTS[0]}20` }} />
                            {avgStars > 0 && (
                                <span className={`text-[10px] font-mono transition-colors duration-300 ${isVibe ? '' : 'text-[#37352f]'}`} style={isVibe ? dynTextStyle : undefined}>
                                    {'⭐'.repeat(Math.round(avgStars))} {avgStars}
                                </span>
                            )}
                        </div>
                        {reviews.length > 0 ? (
                            <div className="flex flex-col gap-1.5">
                                {reviews.slice(0, 3).map(r => (
                                    <a key={r.html_url} href={r.html_url} target="_blank" rel="noopener noreferrer"
                                        className={`text-[11px] font-serif italic transition-colors truncate ${isVibe ? 'opacity-60' : 'text-[#9b9a97] hover:text-[#37352f]'}`}
                                        style={isVibe ? dynTextStyle : undefined}>
                                        {'⭐'.repeat(r.stars)} &ldquo;{r.body.replace(/## Review.*\n\n/, '').slice(0, 80)}{r.body.length > 80 ? '…' : ''}&rdquo; — @{r.reviewer}
                                    </a>
                                ))}
                            </div>
                        ) : (
                            <p className={`text-[11px] font-serif italic transition-colors ${isVibe ? 'opacity-40' : 'text-[#9b9a97]'}`} style={isVibe ? dynTextStyle : undefined}>
                                No reviews yet. Be the first.
                            </p>
                        )}
                        <button onClick={handleLeaveReview}
                            className={`text-[9px] font-mono uppercase tracking-[0.15em] self-start transition-colors ${isVibe ? '' : 'text-brand-red hover:text-[#37352f]'}`}
                            style={isVibe ? dynTextStyle : undefined}>
                            Leave Review →
                        </button>
                    </div>
                );
            }
            case 'earned':
                return (
                    <div className={`${tile.colSpan} flex flex-col items-center justify-center p-6 min-h-[120px] transition-all duration-300`} style={{ background: bg }}>
                        <span className={`text-2xl font-bold font-mono transition-colors duration-300 ${isVibe ? '' : 'text-[#37352f]'}`} style={isVibe ? dynTextStyle : undefined}>
                            ${(profile.total_earned || 0).toLocaleString()}
                        </span>
                        <span className="text-[9px] font-mono text-[#9b9a97] uppercase tracking-[0.2em] mt-1">Earned</span>
                    </div>
                );
            case 'filler':
                return (
                    <div className={`${tile.colSpan} min-h-[120px] transition-all duration-300`} style={{ backgroundColor: isVibe ? `${palColor}1A` : '#f0f0ef' }} />
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
                            <span className="text-[10px] font-mono transition-colors duration-300" style={{ color: isVibe ? palColor : accent }}>{numStr}</span>
                            <div className="flex-1 h-px transition-colors duration-300" style={{ backgroundColor: isVibe ? `${palColor}4D` : `${accent}20` }} />
                            {s.build_hours > 0 && (
                                <span className="text-[8px] font-mono text-brand-red uppercase tracking-wider">⚡ {s.build_hours}h</span>
                            )}
                            {(feedbackCounts._total || 0) > 0 && (
                                <span className="text-[8px] font-mono text-[#9b9a97] uppercase tracking-wider">💬 {feedbackCounts._total}</span>
                            )}
                            {s.tags.length > 0 && (
                                <span className="text-[8px] font-mono text-[#9b9a97] uppercase tracking-wider">{s.tags[0]}</span>
                            )}
                        </div>
                        <div>
                            <h3 className={`text-base font-serif mb-1 transition-colors duration-300 ${isVibe ? '' : 'text-[#37352f] group-hover:text-brand-red'} ${tile.colSpan.includes('col-span-2') ? 'md:text-lg' : ''}`} style={isVibe ? dynTextStyle : undefined}>
                                {s.title}
                            </h3>
                            <p className={`text-[12px] leading-relaxed transition-colors duration-300 ${isVibe ? 'opacity-60' : 'text-[#9b9a97]'}`} style={isVibe ? dynTextStyle : undefined}>
                                {s.description}
                            </p>
                            {(s.ai_tools || []).length > 0 && (
                                <div className="flex items-center gap-1.5 mt-1.5">
                                    {(s.ai_tools || []).map(tool => (
                                        <span key={tool} className="text-[8px] font-mono uppercase tracking-wider text-[#9b9a97] bg-[#f0f0f0] px-1.5 py-0.5 rounded">{tool}</span>
                                    ))}
                                </div>
                            )}
                        </div>
                        {(s.source_url || s.post_url) && (
                            <div className="flex items-center gap-3 mt-2">
                                {s.source_url && (
                                    <button type="button" onClick={e => { e.stopPropagation(); e.preventDefault(); window.open(s.source_url, '_blank', 'noopener,noreferrer'); }}
                                        className={`text-[8px] font-mono uppercase tracking-wider transition-colors duration-300 ${isVibe ? 'opacity-60' : 'text-[#9b9a97] hover:text-[#37352f]'}`} style={isVibe ? dynTextStyle : undefined}>Source ↗</button>
                                )}
                                {s.post_url && (
                                    <button type="button" onClick={e => { e.stopPropagation(); e.preventDefault(); window.open(s.post_url, '_blank', 'noopener,noreferrer'); }}
                                        className={`text-[8px] font-mono uppercase tracking-wider transition-colors duration-300 ${isVibe ? 'opacity-60' : 'text-[#9b9a97] hover:text-[#37352f]'}`} style={isVibe ? dynTextStyle : undefined}>Post ↗</button>
                                )}
                                <button type="button" onClick={e => { e.stopPropagation(); e.preventDefault(); handleFeedback(s.slug, s.title); }}
                                    className={`text-[8px] font-mono uppercase tracking-wider transition-colors duration-300 ${isVibe ? 'opacity-60' : 'text-[#9b9a97] hover:text-brand-red'}`} style={isVibe ? dynTextStyle : undefined}>Feedback</button>
                            </div>
                        )}
                        {!(s.source_url || s.post_url) && (
                            <div className="flex items-center gap-3 mt-2">
                                <button type="button" onClick={e => { e.stopPropagation(); e.preventDefault(); handleFeedback(s.slug, s.title); }}
                                    className={`text-[8px] font-mono uppercase tracking-wider transition-colors duration-300 ${isVibe ? 'opacity-60' : 'text-[#9b9a97] hover:text-brand-red'}`} style={isVibe ? dynTextStyle : undefined}>Feedback</button>
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
