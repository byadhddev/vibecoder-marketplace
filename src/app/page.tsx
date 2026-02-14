'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useSession, signIn } from 'next-auth/react';
import { useTheme } from '@/lib/theme';
import { LiveGrid, CursorGlow, StaggerIn, ParticleNav } from '@/components/hero/HeroAnimations';

/* ─── Constants ──────────────────────────────────────────── */
const RED = '#D80018';
const VIBE_COLORS = ['#B3201F', '#122BB2', '#a16207', '#dc2626', '#1e40af'];

function vibeGradient(color: string) {
    const h = color.replace('#', '');
    const r = parseInt(h.slice(0, 2), 16);
    const g = parseInt(h.slice(2, 4), 16);
    const b = parseInt(h.slice(4, 6), 16);
    return `radial-gradient(circle at center, rgba(${r}, ${g}, ${b}, var(--vc-vibe-opacity)) 0%, var(--vc-vibe-fade) 70%)`;
}

/* ─── Scroll fade ────────────────────────────────────────── */
function useScrollFade() {
    const ref = useRef<HTMLDivElement>(null);
    const [isVisible, setIsVisible] = useState(false);
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const observer = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) setIsVisible(true); },
            { threshold: 0.15 },
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, []);
    return { ref, isVisible };
}

function FadeIn({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
    const { ref, isVisible } = useScrollFade();
    return (
        <div ref={ref} className={`transition-all duration-700 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'} ${className}`} style={{ transitionDelay: `${delay}ms` }}>
            {children}
        </div>
    );
}

/* ─── Grid helper ────────────────────────────────────────── */
const GRID = 'border border-vc-border rounded-lg overflow-hidden bg-vc-border grid grid-cols-2 md:grid-cols-4 gap-px';

/* ═══════════════════════════════════════════════════════════
   LANDING PAGE
   ═══════════════════════════════════════════════════════════ */
export default function LandingPage() {
    const { data: session } = useSession();
    const { resolved, toggle } = useTheme();
    const [vibeLocked, setVibeLocked] = useState(false);
    const [hovered, setHovered] = useState(false);
    const [founderVibed, setFounderVibed] = useState(false);
    const [founderHovered, setFounderHovered] = useState(false);
    const [openSection, setOpenSection] = useState<string | null>(null);
    const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});
    const isVibe = vibeLocked || hovered;
    const isFounderVibe = isVibe || founderVibed || founderHovered;
    const toggleVibe = useCallback(() => setVibeLocked(v => !v), []);
    const toggleSection = useCallback((id: string) => {
        setOpenSection(prev => {
            const next = prev === id ? null : id;
            if (next) setTimeout(() => sectionRefs.current[next]?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
            return next;
        });
    }, []);

    function pal(i: number) { return VIBE_COLORS[i % VIBE_COLORS.length]; }
    function bg(i: number) { return isVibe ? vibeGradient(pal(i)) : 'var(--vc-surface)'; }
    function darkBg(i: number) { return isVibe ? vibeGradient(pal(i)) : 'var(--vc-dark)'; }
    function ts(i: number) { return isVibe ? { color: pal(i) } : undefined; }
    function fBg(i: number) { return isFounderVibe ? vibeGradient(pal(i)) : 'var(--vc-surface)'; }
    function fT(i: number) { return isFounderVibe ? { color: pal(i) } : undefined; }

    /* ─── Label component ─── */
    const Label = ({ children, className = '', style }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) => (
        <span className={`text-[9px] font-sans uppercase tracking-[0.2em] ${className}`} style={style}>{children}</span>
    );

    return (
        <div className="min-h-screen w-full bg-vc-bg text-vc-text relative">
            <CursorGlow isVibe={isVibe} vibeColor={pal(0)} />

            {/* Background dot pattern */}
            <div className="fixed inset-0 pointer-events-none opacity-[0.3]" style={{
                backgroundImage: `radial-gradient(circle, var(--vc-border) 1px, transparent 1px)`,
                backgroundSize: '20px 20px',
            }} />

            <div className="relative mx-auto max-w-[860px] px-5 md:px-12 bg-vc-surface min-h-screen border-x border-vc-border">

                {/* ── NAV ──────────────────────────────────── */}
                <StaggerIn delay={0}>
                <nav className="flex items-center justify-between h-12 border-b border-vc-border">
                    <div className="flex items-center gap-2">
                        <div
                            className={`w-2.5 h-2.5 bg-[${RED}] cursor-pointer transition-all duration-300 ${vibeLocked ? 'ring-1 ring-[${RED}]/30' : ''}`}
                            style={{ backgroundColor: RED }}
                            onMouseEnter={() => setHovered(true)}
                            onMouseLeave={() => setHovered(false)}
                            onClick={(e) => { e.stopPropagation(); toggleVibe(); }}
                        />
                        <span className="text-[11px] font-serif tracking-[0.05em]" style={isVibe ? { color: pal(0) } : undefined}>vibeminis</span>
                    </div>
                    <button
                        onClick={toggle}
                        className="w-7 h-7 flex items-center justify-center rounded-md text-vc-text-secondary hover:text-vc-text hover:bg-vc-surface-raised transition-colors cursor-pointer"
                        aria-label="Toggle theme"
                    >
                        {resolved === 'dark' ? (
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5"><circle cx="12" cy="12" r="5"/><path d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72l1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
                        ) : (
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>
                        )}
                    </button>
                </nav>
                </StaggerIn>

                {/* ── HERO ─────────────────────────────────── */}
                <StaggerIn delay={100}>
                <div className="py-10 md:py-14 text-center">
                    <h1 className="text-2xl md:text-[32px] font-serif leading-[1.2] tracking-[-0.02em] mx-auto" style={isVibe ? { color: pal(0) } : undefined}>
                        The waitlist for<br />
                        <span className="italic">AI-native</span> builders
                    </h1>
                    <p className="text-[13px] text-vc-text/50 font-serif mt-3 max-w-sm mx-auto leading-relaxed">
                        Get discovered. Land real projects. Earn what you deserve.
                    </p>

                    {/* CTA */}
                    <div className="mt-6 flex flex-col items-center gap-2">
                        {session ? (
                            <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: RED }} />
                                <span className="text-[11px] text-vc-text/60 font-serif">
                                    On the waitlist as <span className="text-vc-text font-medium">{session.user?.name || session.user?.email}</span>
                                </span>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center gap-1.5">
                                <button
                                    onClick={() => signIn('github')}
                                    className="flex items-center gap-2 px-4 py-2 text-white text-[11px] font-serif tracking-[0.02em] hover:opacity-90 active:scale-[0.98] transition-all duration-200 cursor-pointer"
                                    style={{ backgroundColor: RED }}
                                >
                                    <svg className="w-3.5 h-3.5 opacity-80" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
                                    Join Waitlist
                                </button>
                                <span className="text-[9px] text-vc-text/30 font-sans tracking-[0.05em]">Priority access · Free profile</span>
                            </div>
                        )}
                    </div>
                </div>
                </StaggerIn>

                {/* ── LIVE GRID ────────────────────────────── */}
                <StaggerIn delay={200}>
                <div className="pt-4 pb-6">
                    <LiveGrid isVibe={isVibe} />
                </div>
                </StaggerIn>

                {/* ── SECTION NAV ──────────────────────────── */}
                <div className="border-t border-vc-border pt-6 pb-2">
                    <ParticleNav
                      sections={[
                        { id: 'problem', label: 'The Problem' },
                        { id: 'value', label: 'Builders & Seekers' },
                        { id: 'how', label: 'How It Works' },
                        { id: 'philosophy', label: 'Philosophy' },
                        { id: 'founder', label: 'Vibeloper' },
                        { id: 'features', label: 'Features' },
                      ]}
                      openSection={openSection}
                      onToggle={toggleSection}
                      isVibe={isVibe}
                      vibeColors={VIBE_COLORS}
                    />
                </div>

                {/* ── EXPANDABLE SECTIONS ──────────────────── */}
                <div className="flex-1">

                {/* The Problem */}
                <div ref={el => { sectionRefs.current['problem'] = el; }} className={`grid transition-all duration-500 ease-in-out ${openSection === 'problem' ? 'grid-rows-[1fr] opacity-100 mb-6' : 'grid-rows-[0fr] opacity-0'}`}>
                    <div className="overflow-hidden">
                    <FadeIn>
                        <div className={GRID}>
                            <div className="col-span-2 md:col-span-4 p-6 md:p-10 flex flex-col justify-center min-h-[180px] transition-all duration-300" style={{ background: darkBg(2) }}>
                                <Label className={`mb-3 ${isVibe ? 'opacity-60' : 'text-white/30'}`} style={isVibe ? ts(3) : undefined}>The Problem</Label>
                                <p className={`text-lg md:text-xl font-serif leading-relaxed max-w-lg ${isVibe ? '' : 'text-white/90'}`} style={ts(2)}>
                                    Millions of tokens burned daily. Most build nothing anyone needs.
                                </p>
                                <p className={`text-[13px] mt-3 leading-relaxed max-w-md ${isVibe ? 'opacity-70' : 'text-white/40'}`} style={isVibe ? ts(4) : undefined}>
                                    Vibe coding is powerful, but without direction, it&apos;s just expensive experimentation.
                                </p>
                            </div>
                        </div>
                    </FadeIn>
                    </div>
                </div>

                {/* Builders & Seekers */}
                <div ref={el => { sectionRefs.current['value'] = el; }} className={`grid transition-all duration-500 ease-in-out ${openSection === 'value' ? 'grid-rows-[1fr] opacity-100 mb-6' : 'grid-rows-[0fr] opacity-0'}`}>
                    <div className="overflow-hidden">
                    <div className={GRID}>
                        <FadeIn className="contents">
                            <div className="col-span-2 p-5 md:p-7 flex flex-col justify-between min-h-[200px]" style={{ background: bg(0) }}>
                                <div>
                                    <Label className={isVibe ? '' : `text-[${RED}]`} style={ts(0)}>For Builders</Label>
                                    <h2 className={`text-xl md:text-2xl font-serif leading-tight mt-2 mb-3 ${isVibe ? '' : 'text-vc-text'}`} style={ts(0)}>
                                        Ship fast.<br />Get found.<br />Get paid.
                                    </h2>
                                    <p className={`text-[12px] leading-relaxed ${isVibe ? 'opacity-70' : 'text-vc-text-secondary'}`} style={isVibe ? ts(2) : undefined}>
                                        Your showcases are your storefront. Live demos, build hours, AI tools used. Set your rate.
                                    </p>
                                </div>
                                <div className="mt-4 flex flex-wrap gap-1.5">
                                    {['Portfolio', 'Rate', 'Hired', 'Earn'].map((t, i) => (
                                        <span key={t} className={`text-[8px] font-sans uppercase tracking-[0.15em] px-1.5 py-0.5 border ${isVibe ? 'border-current opacity-60' : 'border-vc-border text-vc-text-secondary'}`} style={isVibe ? { color: pal(i) } : undefined}>{t}</span>
                                    ))}
                                </div>
                            </div>
                        </FadeIn>
                        <FadeIn className="contents" delay={100}>
                            <div className="col-span-2 p-5 md:p-7 flex flex-col justify-between min-h-[200px]" style={{ background: bg(1) }}>
                                <div>
                                    <Label className={isVibe ? '' : `text-[${RED}]`} style={ts(1)}>For Seekers</Label>
                                    <h2 className={`text-xl md:text-2xl font-serif leading-tight mt-2 mb-3 ${isVibe ? '' : 'text-vc-text'}`} style={ts(1)}>
                                        Proof,<br />not promises.
                                    </h2>
                                    <p className={`text-[12px] leading-relaxed ${isVibe ? 'opacity-70' : 'text-vc-text-secondary'}`} style={isVibe ? ts(3) : undefined}>
                                        Browse real projects, not PDFs. See how fast they build, what tools they use, what others say.
                                    </p>
                                </div>
                                <div className="mt-4 flex flex-wrap gap-1.5">
                                    {['Browse', 'Verify', 'Hire', 'Review'].map((t, i) => (
                                        <span key={t} className={`text-[8px] font-sans uppercase tracking-[0.15em] px-1.5 py-0.5 border ${isVibe ? 'border-current opacity-60' : 'border-vc-border text-vc-text-secondary'}`} style={isVibe ? { color: pal(i + 2) } : undefined}>{t}</span>
                                    ))}
                                </div>
                            </div>
                        </FadeIn>
                    </div>
                    </div>
                </div>

                {/* How It Works */}
                <div ref={el => { sectionRefs.current['how'] = el; }} className={`grid transition-all duration-500 ease-in-out ${openSection === 'how' ? 'grid-rows-[1fr] opacity-100 mb-6' : 'grid-rows-[0fr] opacity-0'}`}>
                    <div className="overflow-hidden">
                    <div className={GRID}>
                        {[
                            { n: '01', t: 'Create Profile', d: 'Set up in minutes. You own your data completely.', tag: 'Your identity' },
                            { n: '02', t: 'Showcase Work', d: 'Add live demos, build hours, AI tools. Verifiable proof.', tag: 'Live demos' },
                            { n: '03', t: 'Get Hired', d: 'Clients reach out directly. Every review is public.', tag: 'Transparent' },
                        ].map((item, i) => (
                            <FadeIn key={item.n} className="contents" delay={i * 80}>
                                <div className={`${i < 2 ? 'col-span-1' : 'col-span-2 md:col-span-2'} p-5 md:p-6 flex flex-col min-h-[160px]`} style={{ background: bg(i) }}>
                                    <span className={`text-[28px] font-serif leading-none mb-3 ${isVibe ? 'opacity-30' : 'text-vc-text-muted'}`} style={isVibe ? ts(i) : undefined}>{item.n}</span>
                                    <h3 className={`text-sm font-serif mb-1.5 ${isVibe ? '' : 'text-vc-text'}`} style={ts(i)}>{item.t}</h3>
                                    <p className={`text-[11px] leading-relaxed flex-1 ${isVibe ? 'opacity-70' : 'text-vc-text-secondary'}`}>{item.d}</p>
                                    <Label className={`mt-3 ${isVibe ? '' : 'text-[#D80018]'}`} style={ts(i)}>{item.tag}</Label>
                                </div>
                            </FadeIn>
                        ))}
                        <FadeIn className="contents" delay={240}>
                            <div className="col-span-1 flex items-center justify-center p-5 min-h-[160px]" style={{ background: darkBg(3) }}>
                                <div className="w-6 h-6" style={{ backgroundColor: RED }} />
                            </div>
                        </FadeIn>
                    </div>
                    </div>
                </div>

                {/* Philosophy */}
                <div ref={el => { sectionRefs.current['philosophy'] = el; }} className={`grid transition-all duration-500 ease-in-out ${openSection === 'philosophy' ? 'grid-rows-[1fr] opacity-100 mb-6' : 'grid-rows-[0fr] opacity-0'}`}>
                    <div className="overflow-hidden">
                    <FadeIn>
                        <div className="py-12 md:py-16 flex flex-col items-center text-center border-y border-vc-border" style={isVibe ? { borderColor: `${pal(1)}30` } : undefined}>
                            <p className={`text-lg md:text-2xl font-serif italic leading-relaxed max-w-md ${isVibe ? '' : 'text-vc-text'}`} style={ts(1)}>
                                &ldquo;Every token burned should build something someone needs.&rdquo;
                            </p>
                            <div className="flex items-center gap-2 mt-4">
                                <div className="w-4 h-px" style={{ backgroundColor: isVibe ? pal(0) : `${RED}40` }} />
                                <Label className="text-vc-text-secondary">Philosophy</Label>
                                <div className="w-4 h-px" style={{ backgroundColor: isVibe ? pal(0) : `${RED}40` }} />
                            </div>
                        </div>
                    </FadeIn>
                    </div>
                </div>

                {/* Vibeloper / Founder */}
                <div ref={el => { sectionRefs.current['founder'] = el; }} className={`grid transition-all duration-500 ease-in-out ${openSection === 'founder' ? 'grid-rows-[1fr] opacity-100 mb-6' : 'grid-rows-[0fr] opacity-0'}`}>
                    <div className="overflow-hidden">
                    <FadeIn>
                        <div className="flex items-center gap-2 mb-4">
                            <span className="text-vc-text-muted font-sans" style={isFounderVibe ? fT(1) : undefined}>#</span>
                            <h2 className="text-lg font-serif tracking-tight">
                                <span style={fT(1)}>Meet the</span>{' '}
                                <span className="line-through opacity-30">Developer</span>{' '}
                                <span className={`italic ${isFounderVibe ? '' : 'text-[#D80018]'}`} style={isFounderVibe ? fT(0) : undefined}>Vibeloper</span>
                            </h2>
                        </div>

                        <div className="border border-vc-border rounded-lg overflow-hidden grid grid-cols-2 md:grid-cols-6 bg-vc-border gap-px">
                            <div className="col-span-1 aspect-square bg-vc-dark relative overflow-hidden cursor-pointer"
                                onMouseEnter={() => setFounderHovered(true)} onMouseLeave={() => setFounderHovered(false)}
                                onClick={() => setFounderVibed(v => !v)}>
                                <img src="/founder-avatar.jpg" alt="Jagadesh" className={`absolute inset-0 w-full h-full object-cover transition-all duration-300 ${isFounderVibe ? 'grayscale-0' : 'grayscale'}`} />
                            </div>

                            <div className="col-span-1 md:col-span-2 px-4 py-3 flex flex-col justify-center" style={{ background: fBg(1) }}>
                                <h4 className={`text-sm font-serif leading-tight ${isFounderVibe ? '' : 'text-vc-text'}`} style={fT(1)}>
                                    Jagadesh <span className="opacity-50 text-[10px]">aka</span> adhd.dev
                                </h4>
                                <p className="text-[9px] font-sans uppercase tracking-widest mt-0.5" style={{ color: RED }}>Founder &amp; Vibeloper</p>
                            </div>

                            {[
                                { href: 'https://twitter.com/byadhddev', icon: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z' },
                                { href: 'https://github.com/byadhddev', icon: 'M12 2C6.477 2 2 6.477 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0012 2z' },
                                { href: 'https://byadhd.dev', icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z' },
                            ].map((link, i) => (
                                <a key={i} href={link.href} target="_blank" rel="noopener noreferrer"
                                   className="col-span-1 flex items-center justify-center min-h-[60px] hover:bg-vc-surface-raised transition-colors group/l"
                                   style={{ background: fBg(i % 2) }}>
                                    <svg className={`w-5 h-5 ${isFounderVibe ? '' : 'text-vc-text-secondary group-hover/l:text-[#D80018]'} transition-colors`} style={isFounderVibe ? { color: pal(i) } : undefined} fill="currentColor" viewBox="0 0 24 24"><path d={link.icon}/></svg>
                                </a>
                            ))}

                            <div className="col-span-2 md:col-span-3 md:row-span-2 p-5 md:p-8 flex flex-col justify-center relative overflow-hidden" style={{ background: fBg(0) }}>
                                <h3 className={`text-lg md:text-xl font-serif mb-3 leading-tight relative z-10 ${isFounderVibe ? '' : 'text-vc-text'}`} style={fT(0)}>
                                    &ldquo;Software shouldn&apos;t just work.<br />It should <span className="italic">feel</span> like something.&rdquo;
                                </h3>
                                <p className="text-[12px] leading-relaxed text-vc-text/70 font-serif relative z-10">
                                    I build interactive digital matter. vibeminis is where builders like me find their next gig.
                                </p>
                            </div>

                            <div className="col-span-1 md:row-span-2 p-4 flex flex-col items-center justify-center text-center" style={{ background: fBg(1) }}>
                                <Label className="text-vc-text-secondary mb-2">Focus</Label>
                                <span className={`text-[10px] font-bold uppercase tracking-widest leading-tight ${isFounderVibe ? '' : 'text-vc-text'}`} style={fT(1)}>Physics<br />Driven UI</span>
                            </div>

                            <div className="col-span-1 flex items-center justify-center p-3" style={{ background: fBg(0) }}>
                                <Label className={`font-bold ${isFounderVibe ? '' : 'text-[#D80018]'}`} style={isFounderVibe ? fT(0) : undefined}>Note</Label>
                            </div>

                            <a href="https://linkedin.com/in/jagadesh-ronanki" target="_blank" rel="noopener noreferrer"
                               className="col-span-1 flex items-center justify-center min-h-[50px] hover:bg-vc-surface-raised transition-colors group/l"
                               style={{ background: fBg(1) }}>
                                <svg className={`w-5 h-5 ${isFounderVibe ? '' : 'text-vc-text-secondary group-hover/l:text-[#D80018]'} transition-colors`} style={isFounderVibe ? { color: pal(1) } : undefined} fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                            </a>

                            <div className="col-span-2 p-5 flex items-center" style={{ background: fBg(0) }}>
                                <div className="w-6 h-px mr-3" style={{ backgroundColor: isFounderVibe ? pal(0) : `${RED}30` }} />
                                <span className={`text-[12px] font-serif italic ${isFounderVibe ? '' : 'text-vc-text'}`} style={fT(0)}>adhd.dev</span>
                            </div>

                            <div className="hidden md:flex col-span-2 p-5 items-center" style={{ background: fBg(1) }}>
                                <p className={`text-[11px] font-serif italic opacity-60`} style={fT(1)}>Software stops being static and starts breathing.</p>
                            </div>

                            <a href="mailto:adhd.paws@gmail.com" className="col-span-2 p-5 flex flex-col group/m hover:bg-vc-surface transition-colors" style={{ background: isFounderVibe ? fBg(0) : 'var(--vc-bg)' }}>
                                <Label className="text-vc-text-secondary mb-2">Direct Contact</Label>
                                <div className="flex items-center gap-2">
                                    <svg className={`w-3.5 h-3.5 ${isFounderVibe ? '' : 'text-vc-text-secondary group-hover/m:text-[#D80018]'} transition-colors`} style={isFounderVibe ? { color: pal(0) } : undefined} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                                    <span className={`text-[11px] font-sans ${isFounderVibe ? '' : 'text-vc-text'}`} style={isFounderVibe ? { color: pal(0) } : undefined}>adhd.paws@gmail.com</span>
                                </div>
                            </a>

                            <div className={`hidden md:block col-span-2 min-h-[40px] ${isFounderVibe ? '' : 'bg-vc-skeleton'}`} style={isFounderVibe ? { background: `${pal(0)}33` } : undefined} />
                        </div>
                    </FadeIn>
                    </div>
                </div>

                {/* Features */}
                <div ref={el => { sectionRefs.current['features'] = el; }} className={`grid transition-all duration-500 ease-in-out ${openSection === 'features' ? 'grid-rows-[1fr] opacity-100 mb-6' : 'grid-rows-[0fr] opacity-0'}`}>
                    <div className="overflow-hidden">
                    <div className={GRID}>
                        {[
                            { icon: '◈', title: 'Vibe Tiles', desc: 'Unique tile layouts for every profile' },
                            { icon: '◉', title: 'Verified Badges', desc: 'Earned, not bought' },
                            { icon: '→', title: 'One-Click Hire', desc: 'Clients contact you directly' },
                            { icon: '★', title: 'Public Reviews', desc: 'Visible to everyone' },
                            { icon: '◎', title: 'Live Analytics', desc: 'Views, clicks, engagement' },
                            { icon: '⌘', title: 'Search + Discover', desc: 'By skill, tool, or project' },
                            { icon: '◇', title: 'Leaderboard', desc: 'Ranked by real metrics' },
                            { icon: '↗', title: 'Quick Setup', desc: 'Profile to published in minutes' },
                        ].map((f, i) => (
                            <FadeIn key={f.title} className="contents" delay={i * 40}>
                                <div className="col-span-1 p-4 md:p-5 flex flex-col min-h-[110px]" style={{ background: bg(i) }}>
                                    <span className={`text-base mb-2 ${isVibe ? '' : 'text-[#D80018]'}`} style={ts(i)}>{f.icon}</span>
                                    <h4 className={`text-[12px] font-serif mb-0.5 ${isVibe ? '' : 'text-vc-text'}`} style={ts(i)}>{f.title}</h4>
                                    <p className={`text-[10px] leading-relaxed ${isVibe ? 'opacity-60' : 'text-vc-text-secondary'}`}>{f.desc}</p>
                                </div>
                            </FadeIn>
                        ))}
                    </div>
                    </div>
                </div>

                </div>{/* end expandable */}

                {/* ── FOOTER ───────────────────────────────── */}
                <footer className="mt-auto border-t border-vc-border flex items-center justify-between h-12 text-[10px] text-vc-text/30">
                    <div className="flex items-center gap-2 font-serif" style={isVibe ? { color: pal(0) } : undefined}>
                        <div className="w-2 h-2" style={{ backgroundColor: RED }} />
                        <span className="text-vc-text/60">vibeminis</span>
                    </div>
                    <div className="flex items-center gap-5 font-sans uppercase tracking-[0.15em]">
                        <Link href="/privacy" className="hover:text-vc-text transition-colors">Privacy</Link>
                        <Link href="/terms" className="hover:text-vc-text transition-colors">Terms</Link>
                        <span>© 2026</span>
                    </div>
                </footer>

            </div>
        </div>
    );
}
