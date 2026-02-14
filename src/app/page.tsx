'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';

/* ─── Vibe Palette ───────────────────────────────────────── */
const VIBE_COLORS = ['#B3201F', '#122BB2', '#a16207', '#dc2626', '#1e40af'];

function vibeGradient(color: string) {
    const h = color.replace('#', '');
    const r = parseInt(h.slice(0, 2), 16);
    const g = parseInt(h.slice(2, 4), 16);
    const b = parseInt(h.slice(4, 6), 16);
    return `radial-gradient(circle at center, rgba(${r}, ${g}, ${b}, var(--vc-vibe-opacity)) 0%, var(--vc-vibe-fade) 70%)`;
}

/* ─────────────────────────────────────────────────────────
   WAITLIST INPUT
   ───────────────────────────────────────────────────────── */
function WaitlistInput({ count, variant = 'default', isVibe = false, vibeColor }: {
    count: number; variant?: 'default' | 'bottom'; isVibe?: boolean; vibeColor?: string;
}) {
    const [email, setEmail] = useState('');
    const [state, setState] = useState<'idle' | 'loading' | 'success' | 'error' | 'duplicate'>('idle');
    const [message, setMessage] = useState('');

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!email.trim() || state === 'loading') return;
        setState('loading');
        try {
            const res = await fetch('/api/waitlist', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email.trim() }),
            });
            const data = await res.json();
            if (res.ok && data.ok) {
                setState(data.message?.includes('already') ? 'duplicate' : 'success');
                setMessage(data.message);
            } else {
                setState('error');
                setMessage(data.error || 'Something went wrong');
            }
        } catch {
            setState('error');
            setMessage('Network error. Please try again.');
        }
    }

    if (state === 'success' || state === 'duplicate') {
        return (
            <div className="flex flex-col items-center gap-3">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-[#D80018] animate-pulse" />
                    <span className="text-sm font-sans" style={isVibe && vibeColor ? { color: vibeColor } : { color: 'var(--vc-text)' }}>{message}</span>
                </div>
                {count > 0 && (
                    <span className="text-[10px] font-sans text-vc-text-secondary uppercase tracking-[0.2em]">
                        {count}+ builders already waiting
                    </span>
                )}
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="flex flex-col items-center gap-4 w-full">
            <div className={`flex flex-col sm:flex-row gap-3 w-full ${variant === 'default' ? 'max-w-md' : 'max-w-lg'}`}>
                <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    required
                    className="flex-1 px-4 py-3 border border-vc-border-subtle bg-vc-surface text-sm font-sans text-vc-text placeholder:text-vc-text-secondary focus:outline-none focus:border-[#D80018] focus:ring-1 focus:ring-[#D80018]/20 transition-all duration-300"
                    disabled={state === 'loading'}
                />
                <button
                    type="submit"
                    disabled={state === 'loading'}
                    className="px-6 py-3 bg-[#D80018] text-white text-xs font-sans uppercase tracking-[0.15em] hover:bg-[#b80015] active:scale-[0.98] transition-all duration-300 disabled:opacity-50 whitespace-nowrap"
                >
                    {state === 'loading' ? 'Joining...' : 'Join the Waitlist'}
                </button>
            </div>
            {state === 'error' && (
                <span className="text-[11px] font-sans text-[#D80018]">{message}</span>
            )}
            {count > 0 && (
                <span className="text-[10px] font-sans text-vc-text-secondary uppercase tracking-[0.2em]">
                    {count}+ builders already waiting
                </span>
            )}
        </form>
    );
}

/* ─────────────────────────────────────────────────────────
   SCROLL FADE
   ───────────────────────────────────────────────────────── */
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
        <div
            ref={ref}
            className={`transition-all duration-700 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'} ${className}`}
            style={{ transitionDelay: `${delay}ms` }}
        >
            {children}
        </div>
    );
}

/* ─────────────────────────────────────────────────────────
   GRID
   ───────────────────────────────────────────────────────── */
const GRID = 'border border-vc-border rounded-lg overflow-hidden bg-vc-border grid grid-cols-2 md:grid-cols-4 gap-px';

/* ─────────────────────────────────────────────────────────
   LANDING PAGE — with Vibe Mode
   ───────────────────────────────────────────────────────── */
export default function LandingPage() {
    const [waitlistCount, setWaitlistCount] = useState(0);
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
            if (next) {
                setTimeout(() => {
                    sectionRefs.current[next]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 100);
            }
            return next;
        });
    }, []);

    useEffect(() => {
        fetch('/api/waitlist')
            .then(r => r.json())
            .then(d => setWaitlistCount(d.count || 0))
            .catch(() => {});
    }, []);

    // Per-tile vibe style helpers
    function pal(index: number) { return VIBE_COLORS[index % VIBE_COLORS.length]; }
    function bg(index: number) { return isVibe ? vibeGradient(pal(index)) : 'var(--vc-surface)'; }
    function darkBg(index: number) { return isVibe ? vibeGradient(pal(index)) : 'var(--vc-dark)'; }
    function textStyle(index: number) { return isVibe ? { color: pal(index) } : undefined; }

    // Founder section helpers — respond to avatar hover/click OR global vibe
    function fBg(index: number) { return isFounderVibe ? vibeGradient(pal(index)) : 'var(--vc-surface)'; }
    function fText(index: number) { return isFounderVibe ? { color: pal(index) } : undefined; }

    return (
        <div className="min-h-screen w-full bg-vc-bg text-vc-text relative transition-colors">
            {/* Background grid pattern */}
            <div
                className="fixed inset-0 pointer-events-none opacity-[0.4]"
                style={{
                    backgroundImage: 'linear-gradient(var(--vc-border) 1px, transparent 1px), linear-gradient(90deg, var(--vc-border) 1px, transparent 1px)',
                    backgroundSize: '24px 24px',
                }}
            />

            <div className="relative mx-auto max-w-[900px] px-6 py-8 md:px-20 md:py-16 bg-vc-surface min-h-screen shadow-[0_0_50px_-12px_rgba(0,0,0,0.08)] border-x border-vc-border">

                {/* ── Nav ─────────────────────────────────── */}
                <nav className="flex items-center justify-between mb-20 md:mb-32">
                    <div className="flex items-center gap-3">
                        {/* Artode toggle — click to activate vibe mode */}
                        <div
                            className={`w-4 h-4 cursor-pointer transition-all duration-300 bg-[var(--vc-brand)] ${vibeLocked ? 'scale-110 ring-2 ring-[var(--vc-brand)]/30' : ''}`}
                            onMouseEnter={() => setHovered(true)}
                            onMouseLeave={() => setHovered(false)}
                            onClick={(e) => { e.stopPropagation(); toggleVibe(); }}
                        />
                        <span className="text-sm font-serif italic transition-colors duration-300" style={isVibe ? { color: pal(0) } : { color: 'var(--vc-text)' }}>VibeCoder</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link
                            href="/home"
                            className="text-[10px] font-sans uppercase tracking-[0.15em] text-vc-text-secondary hover:text-vc-text transition-colors duration-300"
                        >
                            Marketplace →
                        </Link>
                    </div>
                </nav>

                {/* ══════════════════════════════════════════════
                   HERO — Clean centered layout
                   ══════════════════════════════════════════════ */}
                <section className="mb-24 md:mb-36">
                    <div className="flex flex-col items-center text-center">
                        <span
                            className={`text-[10px] font-sans uppercase tracking-[0.3em] mb-6 transition-colors duration-300 ${isVibe ? '' : 'text-[#D80018]'}`}
                            style={textStyle(1)}
                        >
                            The Marketplace for AI Builders
                        </span>
                        <h1
                            className={`text-4xl sm:text-5xl md:text-7xl font-serif leading-[1.05] tracking-tight mb-6 transition-colors duration-300 ${isVibe ? '' : 'text-vc-text'}`}
                            style={textStyle(0)}
                        >
                            Where Vibe Coders<br />
                            <span className="italic">Meet Their Next Build</span>
                        </h1>
                        <p
                            className={`text-base md:text-lg max-w-lg leading-relaxed mb-10 font-light transition-colors duration-300 ${isVibe ? 'opacity-70' : 'text-vc-text-secondary'}`}
                            style={isVibe ? textStyle(2) : undefined}
                        >
                            A transparent marketplace connecting AI-native builders with founders who need them.
                            Ship fast. Get found. Get paid.
                        </p>
                        <WaitlistInput count={waitlistCount} isVibe={isVibe} vibeColor={pal(3)} />
                    </div>
                </section>

                {/* ══════════════════════════════════════════════
                   SECTION NAV — click to expand
                   ══════════════════════════════════════════════ */}
                <nav className="mb-16 md:mb-24">
                    <div className={GRID}>
                        {[
                            { id: 'problem', label: 'The Problem' },
                            { id: 'value', label: 'For Builders & Seekers' },
                            { id: 'how', label: 'How It Works' },
                            { id: 'philosophy', label: 'Our Philosophy' },
                            { id: 'founder', label: 'Vibeloper' },
                            { id: 'features', label: 'Platform Features' },
                            { id: 'cta', label: 'Join Waitlist' },
                        ].map((s, i) => (
                            <button
                                key={s.id}
                                onClick={() => toggleSection(s.id)}
                                className={`col-span-1 p-4 md:p-5 flex items-center justify-between gap-2 transition-all duration-300 text-left ${
                                    openSection === s.id
                                        ? 'bg-vc-dark text-[var(--vc-dark-text-strong)]'
                                        : 'bg-vc-surface hover:bg-vc-surface-raised text-vc-text-secondary hover:text-vc-text'
                                }`}
                                style={isVibe && openSection === s.id ? { background: darkBg(i) } : isVibe ? { background: bg(i) } : undefined}
                            >
                                <span className="text-[11px] font-serif leading-tight">{s.label}</span>
                                <span className={`text-xs transition-transform duration-300 ${openSection === s.id ? 'rotate-45' : ''}`}>+</span>
                            </button>
                        ))}
                        <div className="col-span-1 bg-vc-surface-raised p-4 flex items-center justify-center">
                            <span className="text-[10px] font-serif italic text-vc-text-muted">{openSection ? 'Click to collapse' : 'Click to explore'}</span>
                        </div>
                    </div>
                </nav>

                {/* ══════════════════════════════════════════════
                   THE PROBLEM — collapsible
                   ══════════════════════════════════════════════ */}
                <div ref={el => { sectionRefs.current['problem'] = el; }} className={`grid transition-all duration-500 ease-in-out ${openSection === 'problem' ? 'grid-rows-[1fr] opacity-100 mb-24 md:mb-36' : 'grid-rows-[0fr] opacity-0'}`}>
                    <div className="overflow-hidden">
                <section>
                    <FadeIn>
                        <div className={GRID}>
                            <div
                                className="col-span-2 md:col-span-4 p-8 md:p-12 flex flex-col justify-center min-h-[200px] transition-all duration-300"
                                style={{ background: darkBg(2) }}
                            >
                                <span
                                    className={`text-[9px] font-sans uppercase tracking-[0.2em] mb-4 transition-colors duration-300 ${isVibe ? 'opacity-60' : 'text-white/30'}`}
                                    style={isVibe ? textStyle(3) : undefined}
                                >The Problem</span>
                                <p
                                    className={`text-xl md:text-2xl font-serif leading-relaxed max-w-xl transition-colors duration-300 ${isVibe ? '' : 'text-white/90'}`}
                                    style={textStyle(2)}
                                >
                                    Millions of tokens are burned every day. Most build nothing anyone needs.
                                </p>
                                <p
                                    className={`text-sm mt-4 font-sans leading-relaxed max-w-lg transition-colors duration-300 ${isVibe ? 'opacity-70' : 'text-white/50'}`}
                                    style={isVibe ? textStyle(4) : undefined}
                                >
                                    Vibe coding is powerful — but without direction, it&apos;s just expensive experimentation.
                                    We connect builders who ship with people who need things built.
                                </p>
                            </div>
                        </div>
                    </FadeIn>
                </section>
                    </div>
                </div>

                {/* ══════════════════════════════════════════════
                   FOR BUILDERS & SEEKERS — collapsible
                   ══════════════════════════════════════════════ */}
                <div ref={el => { sectionRefs.current['value'] = el; }} className={`grid transition-all duration-500 ease-in-out ${openSection === 'value' ? 'grid-rows-[1fr] opacity-100 mb-24 md:mb-36' : 'grid-rows-[0fr] opacity-0'}`}>
                    <div className="overflow-hidden">
                <section>
                    <div className={GRID}>
                        <FadeIn className="contents" delay={0}>
                            <div
                                className="col-span-2 p-6 md:p-8 flex flex-col justify-between min-h-[240px] transition-all duration-300"
                                style={{ background: bg(0) }}
                            >
                                <div>
                                    <span
                                        className={`text-[9px] font-sans uppercase tracking-[0.2em] mb-3 block transition-colors duration-300 ${isVibe ? '' : 'text-[#D80018]'}`}
                                        style={textStyle(0)}
                                    >For Builders</span>
                                    <h2
                                        className={`text-2xl md:text-3xl font-serif leading-tight mb-4 transition-colors duration-300 ${isVibe ? '' : 'text-vc-text'}`}
                                        style={textStyle(0)}
                                    >
                                        Ship fast.<br />Get found.<br />Get paid.
                                    </h2>
                                    <p
                                        className={`text-sm leading-relaxed transition-colors duration-300 ${isVibe ? 'opacity-70' : 'text-vc-text-secondary'}`}
                                        style={isVibe ? textStyle(2) : undefined}
                                    >
                                        Your showcases are your storefront. Every project you build becomes proof of what you can do —
                                        live demos, build hours, AI tools used. Set your rate. Let the work speak.
                                    </p>
                                </div>
                                <div className="mt-6 flex flex-wrap gap-2">
                                    {['Showcase Portfolio', 'Set Your Rate', 'Get Hired', 'Earn Transparently'].map((tag, i) => (
                                        <span
                                            key={tag}
                                            className={`text-[9px] font-sans uppercase tracking-[0.15em] px-2 py-1 border transition-colors duration-300 ${isVibe ? 'border-current opacity-60' : 'border-vc-border-subtle text-vc-text-secondary'}`}
                                            style={isVibe ? { color: pal(i % VIBE_COLORS.length) } : undefined}
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </FadeIn>
                        <FadeIn className="contents" delay={150}>
                            <div
                                className="col-span-2 p-6 md:p-8 flex flex-col justify-between min-h-[240px] transition-all duration-300"
                                style={{ background: bg(1) }}
                            >
                                <div>
                                    <span
                                        className={`text-[9px] font-sans uppercase tracking-[0.2em] mb-3 block transition-colors duration-300 ${isVibe ? '' : 'text-[#D80018]'}`}
                                        style={textStyle(1)}
                                    >For Seekers</span>
                                    <h2
                                        className={`text-2xl md:text-3xl font-serif leading-tight mb-4 transition-colors duration-300 ${isVibe ? '' : 'text-vc-text'}`}
                                        style={textStyle(1)}
                                    >
                                        Proof,<br />not promises.
                                    </h2>
                                    <p
                                        className={`text-sm leading-relaxed transition-colors duration-300 ${isVibe ? 'opacity-70' : 'text-vc-text-secondary'}`}
                                        style={isVibe ? textStyle(3) : undefined}
                                    >
                                        Browse real projects, not PDF portfolios. See how fast they build, what tools they use,
                                        what others say. Hire with confidence — every interaction is a public record.
                                    </p>
                                </div>
                                <div className="mt-6 flex flex-wrap gap-2">
                                    {['Browse Builders', 'See Real Work', 'Transparent Hiring', 'Open Reviews'].map((tag, i) => (
                                        <span
                                            key={tag}
                                            className={`text-[9px] font-sans uppercase tracking-[0.15em] px-2 py-1 border transition-colors duration-300 ${isVibe ? 'border-current opacity-60' : 'border-vc-border-subtle text-vc-text-secondary'}`}
                                            style={isVibe ? { color: pal((i + 2) % VIBE_COLORS.length) } : undefined}
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </FadeIn>
                    </div>
                </section>
                    </div>
                </div>

                {/* ══════════════════════════════════════════════
                   HOW IT WORKS — collapsible
                   ══════════════════════════════════════════════ */}
                <div ref={el => { sectionRefs.current['how'] = el; }} className={`grid transition-all duration-500 ease-in-out ${openSection === 'how' ? 'grid-rows-[1fr] opacity-100 mb-24 md:mb-36' : 'grid-rows-[0fr] opacity-0'}`}>
                    <div className="overflow-hidden">
                <section>
                    <FadeIn>
                        <div className="text-center mb-10">
                            <span className="text-[10px] font-sans uppercase tracking-[0.3em] text-vc-text-secondary">How It Works</span>
                        </div>
                    </FadeIn>
                    <div className={GRID}>
                        {[
                            { step: '01', title: 'Create Your Profile', desc: 'Sign in with GitHub. Your data lives on your own branch — you own it completely.', detail: 'GitHub-backed identity' },
                            { step: '02', title: 'Showcase Real Projects', desc: 'Add live demos, build hours, AI tools used. Every showcase is verifiable proof.', detail: 'Live demos + metrics' },
                            { step: '03', title: 'Get Hired Transparently', desc: 'Hire requests are GitHub Issues. Reviews are public. Everything is auditable.', detail: 'Open GitHub Issues' },
                        ].map((item, i) => (
                            <FadeIn key={item.step} className="contents" delay={i * 100}>
                                <div
                                    className={`${i < 2 ? 'col-span-1' : 'col-span-2 md:col-span-2'} p-6 md:p-8 flex flex-col min-h-[200px] transition-all duration-300`}
                                    style={{ background: bg(i) }}
                                >
                                    <span
                                        className={`text-[32px] md:text-[40px] font-serif leading-none mb-4 transition-colors duration-300 ${isVibe ? 'opacity-30' : 'text-vc-text-muted'}`}
                                        style={isVibe ? textStyle(i) : undefined}
                                    >{item.step}</span>
                                    <h3
                                        className={`text-base md:text-lg font-serif mb-2 transition-colors duration-300 ${isVibe ? '' : 'text-vc-text'}`}
                                        style={textStyle(i)}
                                    >{item.title}</h3>
                                    <p className={`text-[13px] leading-relaxed flex-1 transition-colors duration-300 ${isVibe ? 'opacity-70' : 'text-vc-text-secondary'}`} style={isVibe ? textStyle((i + 2) % 5) : undefined}>{item.desc}</p>
                                    <span
                                        className={`text-[9px] font-sans uppercase tracking-[0.15em] mt-4 transition-colors duration-300 ${isVibe ? '' : 'text-[#D80018]'}`}
                                        style={textStyle(i)}
                                    >{item.detail}</span>
                                </div>
                            </FadeIn>
                        ))}
                        <FadeIn className="contents" delay={300}>
                            <div
                                className={`col-span-1 md:col-span-1 flex items-center justify-center p-6 min-h-[200px] transition-all duration-300 ${vibeLocked ? 'ring-2 ring-inset ring-[#D80018]/30' : ''}`}
                                style={{ background: darkBg(3) }}
                            >
                                <div className={`w-8 h-8 transition-all duration-300 ${isVibe ? 'bg-[#D80018] scale-105' : 'bg-[#D80018]'}`} />
                            </div>
                        </FadeIn>
                    </div>
                </section>
                    </div>
                </div>

                {/* ══════════════════════════════════════════════
                   PHILOSOPHY — collapsible
                   ══════════════════════════════════════════════ */}
                <div ref={el => { sectionRefs.current['philosophy'] = el; }} className={`grid transition-all duration-500 ease-in-out ${openSection === 'philosophy' ? 'grid-rows-[1fr] opacity-100 mb-24 md:mb-36' : 'grid-rows-[0fr] opacity-0'}`}>
                    <div className="overflow-hidden">
                <section>
                    <FadeIn>
                        <div
                            className="py-16 md:py-24 flex flex-col items-center text-center border-y transition-colors duration-300"
                            style={{ borderColor: isVibe ? `${pal(1)}30` : 'var(--vc-border)' }}
                        >
                            <p
                                className={`text-xl md:text-2xl lg:text-3xl font-serif italic leading-relaxed max-w-lg transition-colors duration-300 ${isVibe ? '' : 'text-vc-text'}`}
                                style={textStyle(1)}
                            >
                                &ldquo;Every token burned should build something someone needs.&rdquo;
                            </p>
                            <div className="flex items-center gap-3 mt-6">
                                <div className="w-6 h-px transition-colors duration-300" style={{ backgroundColor: isVibe ? pal(0) : 'rgba(216,0,24,0.3)' }} />
                                <span className="text-[10px] font-sans uppercase tracking-[0.3em] text-vc-text-secondary">Our Philosophy</span>
                                <div className="w-6 h-px transition-colors duration-300" style={{ backgroundColor: isVibe ? pal(0) : 'rgba(216,0,24,0.3)' }} />
                            </div>
                        </div>
                    </FadeIn>
                </section>
                    </div>
                </div>

                {/* ══════════════════════════════════════════════
                   MEET THE VIBELOPER — collapsible
                   ══════════════════════════════════════════════ */}
                <div ref={el => { sectionRefs.current['founder'] = el; }} className={`grid transition-all duration-500 ease-in-out ${openSection === 'founder' ? 'grid-rows-[1fr] opacity-100 mb-24 md:mb-36' : 'grid-rows-[0fr] opacity-0'}`}>
                    <div className="overflow-hidden">
                <section>
                    <FadeIn>
                        <div className="flex items-center gap-3 mb-6">
                            <span className={`text-xl font-normal font-sans transition-colors duration-300 ${isFounderVibe ? '' : 'text-vc-text-muted'}`} style={isFounderVibe ? fText(1) : undefined}>#</span>
                            <h2 className="text-2xl font-semibold tracking-tight text-vc-text font-serif">
                                <span className={`transition-colors duration-300`} style={fText(1)}>Meet the</span>{' '}
                                <span className="line-through opacity-40">Developer</span>{' '}
                                <span className={`italic transition-colors duration-300 ${isFounderVibe ? '' : 'text-[#D80018]'}`} style={isFounderVibe ? fText(0) : undefined}>Vibeloper</span>
                            </h2>
                        </div>

                        <div className="border border-vc-border rounded-lg overflow-hidden grid grid-cols-2 md:grid-cols-6 bg-vc-border gap-px">

                            {/* Avatar — hover to preview vibe, click to lock */}
                            <div
                                className="col-span-1 aspect-square bg-vc-dark relative overflow-hidden cursor-pointer z-20"
                                onMouseEnter={() => setFounderHovered(true)}
                                onMouseLeave={() => setFounderHovered(false)}
                                onClick={() => setFounderVibed(v => !v)}
                            >
                                <img src="/founder-avatar.jpg" alt="Jagadesh" className={`absolute inset-0 w-full h-full object-cover transition-all duration-300 ${isFounderVibe ? 'grayscale-0' : 'grayscale'}`} />
                                {isFounderVibe && <div className="absolute inset-0 border-2 border-[#D80018]/50 mix-blend-overlay transition-opacity duration-300" />}
                            </div>

                            {/* Name & Role */}
                            <div className="col-span-1 md:col-span-2 px-4 md:px-6 py-4 flex flex-col justify-center transition-all duration-300" style={{ background: fBg(1) }}>
                                <h4 className={`text-sm md:text-lg font-serif mb-0.5 leading-tight transition-colors duration-300 ${isFounderVibe ? '' : 'text-vc-text'}`} style={fText(1)}>
                                    <span className="flex flex-col md:block">
                                        <span>Jagadesh</span>
                                        <span className="md:inline hidden"> </span>
                                        <span className="md:inline block"><span className="italic opacity-60 text-[11px] md:text-inherit">aka</span> adhd.dev</span>
                                    </span>
                                </h4>
                                <p className="text-[9px] md:text-[10px] font-sans text-[#D80018] uppercase tracking-widest leading-none mt-1">Founder &amp; Vibeloper</p>
                            </div>

                            {/* Twitter/X */}
                            <a href="https://twitter.com/byadhddev" target="_blank" rel="noopener noreferrer"
                               className="col-span-1 flex items-center justify-center min-h-[70px] md:min-h-0 hover:bg-vc-surface-raised transition-all duration-300 group/link"
                               style={{ background: fBg(0) }}>
                                <svg className={`w-[22px] h-[22px] transition-colors duration-300 ${isFounderVibe ? '' : 'text-vc-text-secondary group-hover/link:text-[#D80018]'}`} style={isFounderVibe ? { color: pal(0) } : undefined} fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                                </svg>
                            </a>

                            {/* GitHub */}
                            <a href="https://github.com/byadhddev" target="_blank" rel="noopener noreferrer"
                               className="col-span-1 flex items-center justify-center min-h-[70px] md:min-h-0 hover:bg-vc-surface-raised transition-all duration-300 group/link"
                               style={{ background: fBg(1) }}>
                                <svg className={`w-[22px] h-[22px] transition-colors duration-300 ${isFounderVibe ? '' : 'text-vc-text-secondary group-hover/link:text-[#D80018]'}`} style={isFounderVibe ? { color: pal(1) } : undefined} fill="currentColor" viewBox="0 0 24 24">
                                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0012 2z" clipRule="evenodd"/>
                                </svg>
                            </a>

                            {/* Portfolio */}
                            <a href="https://byadhd.dev" target="_blank" rel="noopener noreferrer"
                               className="col-span-2 md:col-span-1 flex items-center justify-center min-h-[60px] hover:bg-vc-surface-raised transition-all duration-300 group/link"
                               style={{ background: fBg(0) }}>
                                <svg className={`w-[22px] h-[22px] transition-colors duration-300 ${isFounderVibe ? '' : 'text-vc-text-secondary group-hover/link:text-[#D80018]'}`} style={isFounderVibe ? { color: pal(0) } : undefined} fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                                </svg>
                            </a>

                            {/* Filler */}
                            <div className={`hidden md:block col-span-1 transition-all duration-300 ${isFounderVibe ? '' : 'bg-vc-skeleton'}`} style={isFounderVibe ? { background: `${pal(1)}1A` } : undefined} />

                            {/* Quote/Bio */}
                            <div className="col-span-2 md:col-span-3 md:row-span-2 p-6 md:p-10 flex flex-col justify-center relative overflow-hidden transition-all duration-300" style={{ background: fBg(0) }}>
                                <div className={`absolute top-0 right-0 w-48 h-48 blur-3xl rounded-full -mr-24 -mt-24 pointer-events-none transition-opacity duration-300 ${isFounderVibe ? 'bg-[#D80018]/20 opacity-100' : 'bg-[#D80018]/5 opacity-40'}`} />
                                <h3 className={`text-xl md:text-2xl font-serif mb-4 md:mb-6 leading-tight relative z-10 transition-colors duration-300 ${isFounderVibe ? '' : 'text-vc-text'}`} style={fText(0)}>
                                    &ldquo;Software shouldn&apos;t just work. <br />
                                    It should <span className="italic">feel</span> like something.&rdquo;
                                </h3>
                                <p className="text-[13px] md:text-[14px] leading-relaxed text-vc-text opacity-80 font-medium font-serif relative z-10">
                                    I build interactive digital matter. VibeCoder is the marketplace where builders like me find their next gig.
                                </p>
                            </div>

                            {/* Focus Tag */}
                            <div className="col-span-1 md:row-span-2 p-6 flex flex-col items-center justify-center text-center transition-all duration-300" style={{ background: fBg(1) }}>
                                <span className="text-[9px] font-sans text-vc-text-secondary uppercase tracking-[0.2em] mb-3">Focus</span>
                                <span className={`text-[11px] font-bold uppercase tracking-widest leading-tight transition-colors duration-300 ${isFounderVibe ? '' : 'text-vc-text'}`} style={fText(1)}>Physics<br />Driven UI</span>
                            </div>

                            {/* Note Label */}
                            <div className="col-span-1 flex items-center justify-center p-4 transition-all duration-300" style={{ background: fBg(0) }}>
                                <span className={`text-[10px] font-sans uppercase tracking-[0.3em] font-bold transition-all duration-300 ${isFounderVibe ? '' : 'text-[#D80018]'}`} style={isFounderVibe ? fText(0) : undefined}>Note</span>
                            </div>

                            {/* LinkedIn */}
                            <a href="https://linkedin.com/in/jagadesh-ronanki" target="_blank" rel="noopener noreferrer"
                               className="col-span-2 md:col-span-1 flex items-center justify-center min-h-[60px] hover:bg-vc-surface-raised transition-all duration-300 group/link"
                               style={{ background: fBg(1) }}>
                                <svg className={`w-[22px] h-[22px] transition-colors duration-300 ${isFounderVibe ? '' : 'text-vc-text-secondary group-hover/link:text-[#D80018]'}`} style={isFounderVibe ? { color: pal(1) } : undefined} fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                                </svg>
                            </a>

                            {/* Signature */}
                            <div className="col-span-2 p-8 flex items-center transition-all duration-300" style={{ background: fBg(0) }}>
                                <div className="flex items-center gap-4">
                                    <div className="w-8 h-px transition-colors duration-300" style={{ backgroundColor: isFounderVibe ? pal(0) : 'rgba(216,0,24,0.3)' }} />
                                    <span className={`text-sm font-serif italic transition-colors duration-300 ${isFounderVibe ? '' : 'text-vc-text'}`} style={fText(0)}>adhd.dev</span>
                                </div>
                            </div>

                            {/* Philosophy Italic */}
                            <div className="hidden md:flex col-span-2 p-8 items-center transition-all duration-300" style={{ background: fBg(1) }}>
                                <p className={`text-[13px] leading-relaxed opacity-70 font-serif italic transition-colors duration-300 ${isFounderVibe ? '' : 'text-vc-text'}`} style={fText(1)}>
                                    Software stops being static and starts breathing.
                                </p>
                            </div>

                            {/* Contact */}
                            <a href="mailto:adhd.paws@gmail.com" className="col-span-2 p-8 flex flex-col justify-center group/mail hover:bg-vc-surface transition-all duration-300" style={{ background: isFounderVibe ? fBg(0) : 'var(--vc-bg)' }}>
                                <span className="text-[9px] font-sans text-vc-text-secondary uppercase tracking-widest mb-3">Direct Contact</span>
                                <div className="flex items-center gap-3">
                                    <svg className={`w-4 h-4 transition-colors duration-300 ${isFounderVibe ? '' : 'text-vc-text-secondary group-hover/mail:text-[#D80018]'}`} style={isFounderVibe ? { color: pal(0) } : undefined} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                                    </svg>
                                    <span className={`text-[12px] font-sans border-b transition-colors duration-300 ${isFounderVibe ? '' : 'border-vc-border text-vc-text'}`} style={isFounderVibe ? { color: pal(0), borderColor: `${pal(0)}4D` } : undefined}>adhd.paws@gmail.com</span>
                                </div>
                            </a>

                            {/* Filler bottom */}
                            <div className={`hidden md:block col-span-2 transition-all duration-300 ${isFounderVibe ? '' : 'bg-vc-skeleton'}`} style={isFounderVibe ? { background: `${pal(0)}33` } : undefined} />
                        </div>
                    </FadeIn>
                </section>
                    </div>
                </div>

                {/* ══════════════════════════════════════════════
                   PLATFORM FEATURES — collapsible
                   ══════════════════════════════════════════════ */}
                <div ref={el => { sectionRefs.current['features'] = el; }} className={`grid transition-all duration-500 ease-in-out ${openSection === 'features' ? 'grid-rows-[1fr] opacity-100 mb-24 md:mb-36' : 'grid-rows-[0fr] opacity-0'}`}>
                    <div className="overflow-hidden">
                <section>
                    <FadeIn>
                        <div className="text-center mb-10">
                            <span className="text-[10px] font-sans uppercase tracking-[0.3em] text-vc-text-secondary">Platform Features</span>
                        </div>
                    </FadeIn>
                    <div className={GRID}>
                        {[
                            { icon: '◈', title: 'Vibe Tiles', desc: 'Beautiful, unique tile layouts for every builder profile' },
                            { icon: '◉', title: 'Verified Badges', desc: 'Fast Shipper, Top Builder, Repeat Hired — earned not bought' },
                            { icon: '→', title: 'One-Click Hire', desc: 'Contact builders directly through transparent GitHub Issues' },
                            { icon: '★', title: 'Public Reviews', desc: 'Star ratings and written reviews — visible to everyone' },
                            { icon: '◎', title: 'Live Analytics', desc: 'Profile views, showcase clicks, engagement metrics' },
                            { icon: '⌘', title: 'Search + Discover', desc: 'Find builders by skill, tool, or project type instantly' },
                            { icon: '◇', title: 'Leaderboard', desc: 'Top builders ranked by showcases, reviews, and earnings' },
                            { icon: '↗', title: 'Onboarding Wizard', desc: 'Guided setup: profile → showcase → rate → publish in minutes' },
                        ].map((feature, i) => (
                            <FadeIn key={feature.title} className="contents" delay={i * 50}>
                                <div className="col-span-1 p-5 md:p-6 flex flex-col min-h-[140px] transition-all duration-300" style={{ background: bg(i) }}>
                                    <span className={`text-lg mb-3 transition-colors duration-300 ${isVibe ? '' : 'text-[#D80018]'}`} style={textStyle(i)}>{feature.icon}</span>
                                    <h4 className={`text-[13px] font-serif mb-1 transition-colors duration-300 ${isVibe ? '' : 'text-vc-text'}`} style={textStyle(i)}>{feature.title}</h4>
                                    <p className={`text-[11px] leading-relaxed transition-colors duration-300 ${isVibe ? 'opacity-60' : 'text-vc-text-secondary'}`} style={isVibe ? textStyle((i + 2) % 5) : undefined}>{feature.desc}</p>
                                </div>
                            </FadeIn>
                        ))}
                    </div>
                </section>
                    </div>
                </div>

                {/* ══════════════════════════════════════════════
                   FINAL CTA — collapsible
                   ══════════════════════════════════════════════ */}
                <div ref={el => { sectionRefs.current['cta'] = el; }} className={`grid transition-all duration-500 ease-in-out ${openSection === 'cta' ? 'grid-rows-[1fr] opacity-100 mb-20' : 'grid-rows-[0fr] opacity-0'}`}>
                    <div className="overflow-hidden">
                <section>
                    <FadeIn>
                        <div className={GRID}>
                            {/* Signature tile */}
                            <div className="col-span-2 md:col-span-1 p-6 md:p-8 flex items-center min-h-[80px] transition-all duration-300" style={{ background: bg(2) }}>
                                <div className="flex items-center gap-4">
                                    <div className="w-8 h-px transition-colors duration-300" style={{ backgroundColor: isVibe ? pal(2) : 'rgba(216,0,24,0.3)' }} />
                                    <span className={`text-sm font-serif italic transition-colors duration-300 ${isVibe ? '' : 'text-vc-text'}`} style={textStyle(2)}>vibecoder.dev</span>
                                </div>
                            </div>

                            {/* CTA */}
                            <div
                                className="col-span-2 md:col-span-3 p-8 md:p-12 flex flex-col items-center text-center min-h-[280px] justify-center transition-all duration-300"
                                style={{ background: darkBg(4) }}
                            >
                                <span
                                    className={`text-[9px] font-sans uppercase tracking-[0.3em] mb-4 transition-colors duration-300 ${isVibe ? 'opacity-60' : 'text-white/30'}`}
                                    style={isVibe ? textStyle(3) : undefined}
                                >Early Access</span>
                                <h2
                                    className={`text-2xl md:text-4xl font-serif leading-tight mb-3 transition-colors duration-300 ${isVibe ? '' : 'text-white'}`}
                                    style={textStyle(4)}
                                >
                                    Be the first to <span className="italic">vibe</span>.
                                </h2>
                                <p
                                    className={`text-sm max-w-md mb-8 leading-relaxed transition-colors duration-300 ${isVibe ? 'opacity-60' : 'text-white/50'}`}
                                    style={isVibe ? textStyle(1) : undefined}
                                >
                                    We&apos;re onboarding builders and seekers in small batches.
                                    Join the waitlist to get early access and shape the platform.
                                </p>
                                <div className="w-full max-w-md [&_input]:border-white/20 [&_input]:bg-vc-surface/5 [&_input]:text-white [&_input]:placeholder:text-white/30 [&_input:focus]:border-[#D80018] [&_input:focus]:ring-[#D80018]/20 [&_span]:text-white/40">
                                    <WaitlistInput count={waitlistCount} variant="bottom" isVibe={isVibe} vibeColor={pal(4)} />
                                </div>
                            </div>
                        </div>
                    </FadeIn>
                </section>
                    </div>
                </div>

                {/* ── Footer ───────────────────────────────── */}
                <footer className="pt-8 border-t border-vc-border text-vc-text-secondary text-sm flex flex-col md:flex-row justify-between items-center gap-6 md:gap-0 pb-8">
                    <div className="italic font-serif flex items-center gap-2 shrink-0 whitespace-nowrap transition-colors duration-300" style={isVibe ? { color: pal(0) } : { color: 'var(--vc-text)' }}>
                        <div className={`w-2 h-2 transition-all duration-300 ${isVibe ? 'scale-110' : ''}`} style={{ backgroundColor: isVibe ? pal(0) : '#D80018' }} />
                        VibeCoder Marketplace
                    </div>
                    <div className="flex flex-wrap items-center justify-center md:justify-end gap-x-6 gap-y-3">
                        <Link href="/home" className="hover:text-vc-text transition-colors duration-300 hover:underline decoration-dotted underline-offset-4">
                            Marketplace
                        </Link>
                        <Link href="/explore" className="hover:text-vc-text transition-colors duration-300 hover:underline decoration-dotted underline-offset-4">
                            Explore
                        </Link>
                        <span className="shrink-0 whitespace-nowrap">© 2026</span>
                    </div>
                </footer>

            </div>
        </div>
    );
}
