'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';

/* ─── Vibe Palette ───────────────────────────────────────── */
const VIBE_COLORS = ['#B3201F', '#122BB2', '#a16207', '#dc2626', '#1e40af'];

function vibeGradient(color: string) {
    return `radial-gradient(circle at center, ${color}26 0%, rgba(255,255,255,0) 70%)`;
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
                    <span className="text-sm font-mono" style={isVibe && vibeColor ? { color: vibeColor } : { color: '#37352f' }}>{message}</span>
                </div>
                {count > 0 && (
                    <span className="text-[10px] font-mono text-[#9b9a97] uppercase tracking-[0.2em]">
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
                    className="flex-1 px-4 py-3 border border-[#e7e5e4] bg-white text-sm font-mono text-[#37352f] placeholder:text-[#c8c6c4] focus:outline-none focus:border-[#D80018] focus:ring-1 focus:ring-[#D80018]/20 transition-all duration-300"
                    disabled={state === 'loading'}
                />
                <button
                    type="submit"
                    disabled={state === 'loading'}
                    className="px-6 py-3 bg-[#D80018] text-white text-xs font-mono uppercase tracking-[0.15em] hover:bg-[#b80015] active:scale-[0.98] transition-all duration-300 disabled:opacity-50 whitespace-nowrap"
                >
                    {state === 'loading' ? 'Joining...' : 'Join the Waitlist'}
                </button>
            </div>
            {state === 'error' && (
                <span className="text-[11px] font-mono text-[#D80018]">{message}</span>
            )}
            {count > 0 && (
                <span className="text-[10px] font-mono text-[#9b9a97] uppercase tracking-[0.2em]">
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
const GRID = 'border border-[#ededeb] rounded-lg overflow-hidden bg-[#ededeb] grid grid-cols-2 md:grid-cols-4 gap-px';

/* ─────────────────────────────────────────────────────────
   LANDING PAGE — with Vibe Mode
   ───────────────────────────────────────────────────────── */
export default function LandingPage() {
    const [waitlistCount, setWaitlistCount] = useState(0);
    const [vibeLocked, setVibeLocked] = useState(false);
    const [hovered, setHovered] = useState(false);
    const isVibe = vibeLocked || hovered;
    const toggleVibe = useCallback(() => setVibeLocked(v => !v), []);
    const heroRef = useRef<HTMLElement>(null);
    const [mousePos, setMousePos] = useState({ x: 50, y: 50 });

    useEffect(() => {
        fetch('/api/waitlist')
            .then(r => r.json())
            .then(d => setWaitlistCount(d.count || 0))
            .catch(() => {});
    }, []);

    // Per-tile vibe style helpers
    function pal(index: number) { return VIBE_COLORS[index % VIBE_COLORS.length]; }
    function bg(index: number) { return isVibe ? vibeGradient(pal(index)) : 'white'; }
    function darkBg(index: number) { return isVibe ? vibeGradient(pal(index)) : '#242423'; }
    function textStyle(index: number) { return isVibe ? { color: pal(index) } : undefined; }

    return (
        <div className="min-h-screen w-full bg-[#fbfbfa] text-[#37352f] relative">
            {/* Background grid pattern */}
            <div
                className="fixed inset-0 pointer-events-none opacity-[0.4]"
                style={{
                    backgroundImage: 'linear-gradient(#e5e5e5 1px, transparent 1px), linear-gradient(90deg, #e5e5e5 1px, transparent 1px)',
                    backgroundSize: '24px 24px',
                }}
            />

            <div className="relative mx-auto max-w-[900px] px-6 py-8 md:px-20 md:py-16 bg-white min-h-screen shadow-[0_0_50px_-12px_rgba(0,0,0,0.08)] border-x border-[#ededeb]">

                {/* ── Nav ─────────────────────────────────── */}
                <nav className="flex items-center justify-between mb-12 md:mb-16">
                    <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 transition-all duration-300 ${vibeLocked ? 'bg-[#D80018] scale-110' : 'bg-[#D80018]'}`} />
                        <span className="text-sm font-serif italic transition-colors duration-300" style={isVibe ? { color: pal(0) } : { color: '#37352f' }}>VibeCoder</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link
                            href="/home"
                            className="text-[10px] font-mono uppercase tracking-[0.15em] text-[#9b9a97] hover:text-[#37352f] transition-colors duration-300"
                        >
                            Marketplace →
                        </Link>
                    </div>
                </nav>

                {/* ══════════════════════════════════════════════
                   HERO — Tile grid with artode toggle
                   ══════════════════════════════════════════════ */}
                <section
                    ref={heroRef}
                    className="mb-24 md:mb-36 relative"
                    onMouseMove={(e) => {
                        const rect = heroRef.current?.getBoundingClientRect();
                        if (!rect) return;
                        setMousePos({
                            x: ((e.clientX - rect.left) / rect.width) * 100,
                            y: ((e.clientY - rect.top) / rect.height) * 100,
                        });
                    }}
                >
                    {/* Subtle mouse-following glow */}
                    <div
                        className="absolute -inset-8 pointer-events-none rounded-2xl"
                        style={{
                            background: `radial-gradient(600px circle at ${mousePos.x}% ${mousePos.y}%, ${isVibe ? `${pal(0)}12` : 'rgba(216,0,24,0.03)'} 0%, transparent 60%)`,
                        }}
                    />
                    <div className={`${GRID} relative z-[1]`}>
                        {/* Artode toggle */}
                        <div
                            className={`col-span-1 aspect-square flex items-center justify-center cursor-pointer transition-all duration-300 bg-[#242423] ${vibeLocked ? 'ring-2 ring-inset ring-[#D80018]/50' : ''}`}
                            onMouseEnter={() => setHovered(true)}
                            onMouseLeave={() => setHovered(false)}
                            onClick={(e) => { e.stopPropagation(); toggleVibe(); }}
                        >
                            <div className={`w-10 h-10 transition-all duration-300 ${vibeLocked ? 'bg-[#D80018] scale-110' : isVibe ? 'bg-[#D80018] scale-105' : 'bg-white'}`} />
                        </div>

                        {/* Hero headline */}
                        <div
                            className="col-span-1 md:col-span-3 p-6 md:p-10 flex flex-col justify-center min-h-[200px] md:min-h-[260px] transition-all duration-300"
                            style={{ background: darkBg(0) }}
                        >
                            <span
                                className={`text-[9px] font-mono uppercase tracking-[0.3em] mb-4 transition-colors duration-300 ${isVibe ? 'opacity-70' : 'text-white/30'}`}
                                style={isVibe ? textStyle(1) : undefined}
                            >
                                The Marketplace for AI Builders
                            </span>
                            <h1
                                className={`text-3xl sm:text-4xl md:text-5xl font-serif leading-[1.1] tracking-tight mb-4 transition-colors duration-300 ${isVibe ? '' : 'text-white'}`}
                                style={isVibe ? textStyle(0) : undefined}
                            >
                                Where Vibe Coders<br />
                                <span className="italic">Meet Their Next Build</span>
                            </h1>
                            <p
                                className={`text-sm max-w-md leading-relaxed transition-colors duration-300 ${isVibe ? 'opacity-70' : 'text-white/50'}`}
                                style={isVibe ? textStyle(2) : undefined}
                            >
                                A transparent marketplace connecting AI-native builders with founders who need them.
                            </p>
                        </div>

                        {/* Waitlist tile */}
                        <div
                            className="col-span-2 md:col-span-3 p-6 md:p-8 flex flex-col justify-center min-h-[140px] transition-all duration-300"
                            style={{ background: bg(3) }}
                        >
                            <WaitlistInput count={waitlistCount} isVibe={isVibe} vibeColor={pal(3)} />
                        </div>

                        {/* Counter tile */}
                        <div
                            className="col-span-1 flex flex-col items-center justify-center p-6 min-h-[120px] transition-all duration-300"
                            style={{ background: bg(4) }}
                        >
                            <span
                                className={`text-3xl font-bold font-mono transition-colors duration-300 ${isVibe ? '' : 'text-[#37352f]'}`}
                                style={textStyle(4)}
                            >
                                {waitlistCount || '∞'}
                            </span>
                            <span className="text-[9px] font-mono text-[#9b9a97] uppercase tracking-[0.2em] mt-1">Waiting</span>
                        </div>

                        {/* Tagline tile */}
                        <div
                            className="col-span-2 md:col-span-2 p-5 md:p-6 flex items-center min-h-[70px] transition-all duration-300"
                            style={{ background: bg(1) }}
                        >
                            <p
                                className={`text-[13px] font-serif italic transition-colors duration-300 ${isVibe ? '' : 'text-[#37352f] opacity-70'}`}
                                style={textStyle(1)}
                            >
                                Ship fast. Get found. Get paid.
                            </p>
                        </div>

                        {/* Status tile */}
                        <div
                            className="col-span-1 flex flex-col items-center justify-center p-4 min-h-[70px] transition-all duration-300"
                            style={{ background: bg(2) }}
                        >
                            <span
                                className={`text-[10px] font-mono uppercase tracking-[0.3em] font-bold transition-colors duration-300 ${isVibe ? '' : 'text-[#D80018]'}`}
                                style={textStyle(2)}
                            >
                                Active
                            </span>
                            <span className="text-[8px] font-mono text-[#9b9a97] uppercase tracking-[0.2em] mt-1">Feb 2026</span>
                        </div>

                        {/* Filler */}
                        <div
                            className="col-span-1 min-h-[70px] transition-all duration-300"
                            style={{ backgroundColor: isVibe ? `${pal(0)}1A` : '#f0f0ef' }}
                        />
                    </div>
                </section>

                {/* ══════════════════════════════════════════════
                   THE PROBLEM
                   ══════════════════════════════════════════════ */}
                <section className="mb-24 md:mb-36">
                    <FadeIn>
                        <div className={GRID}>
                            <div
                                className="col-span-2 md:col-span-4 p-8 md:p-12 flex flex-col justify-center min-h-[200px] transition-all duration-300"
                                style={{ background: darkBg(2) }}
                            >
                                <span
                                    className={`text-[9px] font-mono uppercase tracking-[0.2em] mb-4 transition-colors duration-300 ${isVibe ? 'opacity-60' : 'text-white/30'}`}
                                    style={isVibe ? textStyle(3) : undefined}
                                >The Problem</span>
                                <p
                                    className={`text-xl md:text-2xl font-serif leading-relaxed max-w-xl transition-colors duration-300 ${isVibe ? '' : 'text-white/90'}`}
                                    style={textStyle(2)}
                                >
                                    Millions of tokens are burned every day. Most build nothing anyone needs.
                                </p>
                                <p
                                    className={`text-sm mt-4 font-mono leading-relaxed max-w-lg transition-colors duration-300 ${isVibe ? 'opacity-70' : 'text-white/50'}`}
                                    style={isVibe ? textStyle(4) : undefined}
                                >
                                    Vibe coding is powerful — but without direction, it&apos;s just expensive experimentation.
                                    We connect builders who ship with people who need things built.
                                </p>
                            </div>
                        </div>
                    </FadeIn>
                </section>

                {/* ══════════════════════════════════════════════
                   FOR BUILDERS & SEEKERS
                   ══════════════════════════════════════════════ */}
                <section className="mb-24 md:mb-36">
                    <div className={GRID}>
                        <FadeIn className="contents" delay={0}>
                            <div
                                className="col-span-2 p-6 md:p-8 flex flex-col justify-between min-h-[240px] transition-all duration-300"
                                style={{ background: bg(0) }}
                            >
                                <div>
                                    <span
                                        className={`text-[9px] font-mono uppercase tracking-[0.2em] mb-3 block transition-colors duration-300 ${isVibe ? '' : 'text-[#D80018]'}`}
                                        style={textStyle(0)}
                                    >For Builders</span>
                                    <h2
                                        className={`text-2xl md:text-3xl font-serif leading-tight mb-4 transition-colors duration-300 ${isVibe ? '' : 'text-[#0a0a0a]'}`}
                                        style={textStyle(0)}
                                    >
                                        Ship fast.<br />Get found.<br />Get paid.
                                    </h2>
                                    <p
                                        className={`text-sm leading-relaxed transition-colors duration-300 ${isVibe ? 'opacity-70' : 'text-[#78716c]'}`}
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
                                            className={`text-[9px] font-mono uppercase tracking-[0.15em] px-2 py-1 border transition-colors duration-300 ${isVibe ? 'border-current opacity-60' : 'border-[#e7e5e4] text-[#78716c]'}`}
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
                                        className={`text-[9px] font-mono uppercase tracking-[0.2em] mb-3 block transition-colors duration-300 ${isVibe ? '' : 'text-[#D80018]'}`}
                                        style={textStyle(1)}
                                    >For Seekers</span>
                                    <h2
                                        className={`text-2xl md:text-3xl font-serif leading-tight mb-4 transition-colors duration-300 ${isVibe ? '' : 'text-[#0a0a0a]'}`}
                                        style={textStyle(1)}
                                    >
                                        Proof,<br />not promises.
                                    </h2>
                                    <p
                                        className={`text-sm leading-relaxed transition-colors duration-300 ${isVibe ? 'opacity-70' : 'text-[#78716c]'}`}
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
                                            className={`text-[9px] font-mono uppercase tracking-[0.15em] px-2 py-1 border transition-colors duration-300 ${isVibe ? 'border-current opacity-60' : 'border-[#e7e5e4] text-[#78716c]'}`}
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

                {/* ══════════════════════════════════════════════
                   HOW IT WORKS
                   ══════════════════════════════════════════════ */}
                <section className="mb-24 md:mb-36">
                    <FadeIn>
                        <div className="text-center mb-10">
                            <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-[#9b9a97]">How It Works</span>
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
                                        className={`text-[32px] md:text-[40px] font-serif leading-none mb-4 transition-colors duration-300 ${isVibe ? 'opacity-30' : 'text-[#ededeb]'}`}
                                        style={isVibe ? textStyle(i) : undefined}
                                    >{item.step}</span>
                                    <h3
                                        className={`text-base md:text-lg font-serif mb-2 transition-colors duration-300 ${isVibe ? '' : 'text-[#0a0a0a]'}`}
                                        style={textStyle(i)}
                                    >{item.title}</h3>
                                    <p className={`text-[13px] leading-relaxed flex-1 transition-colors duration-300 ${isVibe ? 'opacity-70' : 'text-[#78716c]'}`} style={isVibe ? textStyle((i + 2) % 5) : undefined}>{item.desc}</p>
                                    <span
                                        className={`text-[9px] font-mono uppercase tracking-[0.15em] mt-4 transition-colors duration-300 ${isVibe ? '' : 'text-[#D80018]'}`}
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

                {/* ══════════════════════════════════════════════
                   PHILOSOPHY
                   ══════════════════════════════════════════════ */}
                <section className="mb-24 md:mb-36">
                    <FadeIn>
                        <div
                            className="py-16 md:py-24 flex flex-col items-center text-center border-y transition-colors duration-300"
                            style={{ borderColor: isVibe ? `${pal(1)}30` : '#ededeb' }}
                        >
                            <p
                                className={`text-xl md:text-2xl lg:text-3xl font-serif italic leading-relaxed max-w-lg transition-colors duration-300 ${isVibe ? '' : 'text-[#37352f]'}`}
                                style={textStyle(1)}
                            >
                                &ldquo;Every token burned should build something someone needs.&rdquo;
                            </p>
                            <div className="flex items-center gap-3 mt-6">
                                <div className="w-6 h-px transition-colors duration-300" style={{ backgroundColor: isVibe ? pal(0) : 'rgba(216,0,24,0.3)' }} />
                                <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-[#9b9a97]">Our Philosophy</span>
                                <div className="w-6 h-px transition-colors duration-300" style={{ backgroundColor: isVibe ? pal(0) : 'rgba(216,0,24,0.3)' }} />
                            </div>
                        </div>
                    </FadeIn>
                </section>

                {/* ══════════════════════════════════════════════
                   TRUST & TRANSPARENCY
                   ══════════════════════════════════════════════ */}
                <section className="mb-24 md:mb-36">
                    <FadeIn>
                        <div className={GRID}>
                            <div className="col-span-2 md:col-span-2 p-6 md:p-8 flex flex-col min-h-[180px] transition-all duration-300" style={{ background: bg(3) }}>
                                <span className={`text-[9px] font-mono uppercase tracking-[0.2em] mb-3 transition-colors duration-300 ${isVibe ? 'opacity-60' : 'text-[#9b9a97]'}`} style={isVibe ? textStyle(4) : undefined}>Built on GitHub</span>
                                <h3 className={`text-lg md:text-xl font-serif mb-2 transition-colors duration-300 ${isVibe ? '' : 'text-[#0a0a0a]'}`} style={textStyle(3)}>Fully auditable. No black boxes.</h3>
                                <p className={`text-[13px] leading-relaxed transition-colors duration-300 ${isVibe ? 'opacity-70' : 'text-[#78716c]'}`} style={isVibe ? textStyle(1) : undefined}>
                                    Your profile lives on a GitHub branch you control. Hire requests are Issues.
                                    Reviews are public. We chose radical transparency over convenience.
                                </p>
                            </div>
                            <div className="col-span-1 p-6 md:p-8 flex flex-col items-center justify-center min-h-[180px] transition-all duration-300" style={{ background: bg(4) }}>
                                <span className={`text-[32px] font-mono transition-colors duration-300 ${isVibe ? '' : 'text-[#ededeb]'}`} style={textStyle(4)}>{'{ }'}</span>
                                <span className="text-[9px] font-mono uppercase tracking-[0.15em] text-[#9b9a97] mt-2">JSON on Git</span>
                            </div>
                            <div className="col-span-1 p-6 md:p-8 flex flex-col items-center justify-center min-h-[180px] transition-all duration-300" style={{ background: darkBg(0) }}>
                                <svg className={`w-8 h-8 transition-colors duration-300 ${isVibe ? '' : 'text-white/60'}`} style={isVibe ? { color: pal(0) } : undefined} fill="currentColor" viewBox="0 0 24 24">
                                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0012 2z" clipRule="evenodd" />
                                </svg>
                                <span className={`text-[9px] font-mono uppercase tracking-[0.15em] mt-2 transition-colors duration-300 ${isVibe ? 'opacity-40' : 'text-white/40'}`} style={isVibe ? textStyle(2) : undefined}>Powered by</span>
                            </div>
                        </div>
                    </FadeIn>
                </section>

                {/* ══════════════════════════════════════════════
                   PLATFORM FEATURES
                   ══════════════════════════════════════════════ */}
                <section className="mb-24 md:mb-36">
                    <FadeIn>
                        <div className="text-center mb-10">
                            <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-[#9b9a97]">Platform Features</span>
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
                                    <h4 className={`text-[13px] font-serif mb-1 transition-colors duration-300 ${isVibe ? '' : 'text-[#0a0a0a]'}`} style={textStyle(i)}>{feature.title}</h4>
                                    <p className={`text-[11px] leading-relaxed transition-colors duration-300 ${isVibe ? 'opacity-60' : 'text-[#9b9a97]'}`} style={isVibe ? textStyle((i + 2) % 5) : undefined}>{feature.desc}</p>
                                </div>
                            </FadeIn>
                        ))}
                    </div>
                </section>

                {/* ══════════════════════════════════════════════
                   FINAL CTA
                   ══════════════════════════════════════════════ */}
                <section className="mb-20">
                    <FadeIn>
                        <div className={GRID}>
                            {/* Signature tile */}
                            <div className="col-span-2 md:col-span-1 p-6 md:p-8 flex items-center min-h-[80px] transition-all duration-300" style={{ background: bg(2) }}>
                                <div className="flex items-center gap-4">
                                    <div className="w-8 h-px transition-colors duration-300" style={{ backgroundColor: isVibe ? pal(2) : 'rgba(216,0,24,0.3)' }} />
                                    <span className={`text-sm font-serif italic transition-colors duration-300 ${isVibe ? '' : 'text-[#37352f]'}`} style={textStyle(2)}>vibecoder.dev</span>
                                </div>
                            </div>

                            {/* CTA */}
                            <div
                                className="col-span-2 md:col-span-3 p-8 md:p-12 flex flex-col items-center text-center min-h-[280px] justify-center transition-all duration-300"
                                style={{ background: darkBg(4) }}
                            >
                                <span
                                    className={`text-[9px] font-mono uppercase tracking-[0.3em] mb-4 transition-colors duration-300 ${isVibe ? 'opacity-60' : 'text-white/30'}`}
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
                                <div className="w-full max-w-md [&_input]:border-white/20 [&_input]:bg-white/5 [&_input]:text-white [&_input]:placeholder:text-white/30 [&_input:focus]:border-[#D80018] [&_input:focus]:ring-[#D80018]/20 [&_span]:text-white/40">
                                    <WaitlistInput count={waitlistCount} variant="bottom" isVibe={isVibe} vibeColor={pal(4)} />
                                </div>
                            </div>
                        </div>
                    </FadeIn>
                </section>

                {/* ── Footer ───────────────────────────────── */}
                <footer className="pt-8 border-t border-[#ebebeb] text-[#9b9a97] text-sm flex flex-col md:flex-row justify-between items-center gap-6 md:gap-0 pb-8">
                    <div className="italic font-serif flex items-center gap-2 shrink-0 whitespace-nowrap transition-colors duration-300" style={isVibe ? { color: pal(0) } : { color: '#37352f' }}>
                        <div className={`w-2 h-2 transition-all duration-300 ${isVibe ? 'scale-110' : ''}`} style={{ backgroundColor: isVibe ? pal(0) : '#D80018' }} />
                        VibeCoder Marketplace
                    </div>
                    <div className="flex flex-wrap items-center justify-center md:justify-end gap-x-6 gap-y-3">
                        <Link href="/home" className="hover:text-[#37352f] transition-colors duration-300 hover:underline decoration-dotted underline-offset-4">
                            Marketplace
                        </Link>
                        <Link href="/explore" className="hover:text-[#37352f] transition-colors duration-300 hover:underline decoration-dotted underline-offset-4">
                            Explore
                        </Link>
                        <span className="shrink-0 whitespace-nowrap">© 2026</span>
                    </div>
                </footer>

            </div>
        </div>
    );
}
