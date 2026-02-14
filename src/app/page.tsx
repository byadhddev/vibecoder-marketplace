'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';

/* ═══════════════════════════════════════════════════════════
   INTERACTIVE HERO BACKGROUND — Mouse-reactive dot grid
   ═══════════════════════════════════════════════════════════ */
function HeroBackground() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const mouseRef = useRef({ x: -1000, y: -1000 });
    const animRef = useRef<number>(0);
    const dotsRef = useRef<{ x: number; y: number; baseX: number; baseY: number; size: number; opacity: number }[]>([]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        function resize() {
            if (!canvas) return;
            const dpr = window.devicePixelRatio || 1;
            const rect = canvas.getBoundingClientRect();
            canvas.width = rect.width * dpr;
            canvas.height = rect.height * dpr;
            ctx!.scale(dpr, dpr);
            initDots(rect.width, rect.height);
        }

        function initDots(w: number, h: number) {
            const spacing = 32;
            const dots: typeof dotsRef.current = [];
            for (let x = spacing; x < w; x += spacing) {
                for (let y = spacing; y < h; y += spacing) {
                    dots.push({
                        x, y, baseX: x, baseY: y,
                        size: 1 + Math.random() * 0.5,
                        opacity: 0.08 + Math.random() * 0.06,
                    });
                }
            }
            dotsRef.current = dots;
        }

        function animate() {
            if (!canvas || !ctx) return;
            const rect = canvas.getBoundingClientRect();
            ctx.clearRect(0, 0, rect.width, rect.height);

            const mx = mouseRef.current.x;
            const my = mouseRef.current.y;
            const radius = 180;

            for (const dot of dotsRef.current) {
                const dx = mx - dot.baseX;
                const dy = my - dot.baseY;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < radius) {
                    const force = (1 - dist / radius) * 18;
                    const angle = Math.atan2(dy, dx);
                    dot.x += (dot.baseX - Math.cos(angle) * force - dot.x) * 0.12;
                    dot.y += (dot.baseY - Math.sin(angle) * force - dot.y) * 0.12;
                } else {
                    dot.x += (dot.baseX - dot.x) * 0.08;
                    dot.y += (dot.baseY - dot.y) * 0.08;
                }

                const proximity = dist < radius ? (1 - dist / radius) : 0;
                const alpha = dot.opacity + proximity * 0.35;
                const size = dot.size + proximity * 2;

                // Red glow for close dots
                if (proximity > 0.3) {
                    ctx.beginPath();
                    ctx.arc(dot.x, dot.y, size + 4, 0, Math.PI * 2);
                    ctx.fillStyle = `rgba(216, 0, 24, ${proximity * 0.08})`;
                    ctx.fill();
                }

                ctx.beginPath();
                ctx.arc(dot.x, dot.y, size, 0, Math.PI * 2);
                ctx.fillStyle = proximity > 0.5
                    ? `rgba(216, 0, 24, ${alpha})`
                    : `rgba(55, 53, 47, ${alpha})`;
                ctx.fill();
            }

            animRef.current = requestAnimationFrame(animate);
        }

        resize();
        animate();
        window.addEventListener('resize', resize);

        return () => {
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(animRef.current);
        };
    }, []);

    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        const rect = canvasRef.current?.getBoundingClientRect();
        if (!rect) return;
        mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    }, []);

    const handleMouseLeave = useCallback(() => {
        mouseRef.current = { x: -1000, y: -1000 };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full pointer-events-auto"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
        />
    );
}

/* ═══════════════════════════════════════════════════════════
   FLOATING SYMBOLS — Ambient decorative elements
   ═══════════════════════════════════════════════════════════ */
function FloatingSymbols() {
    const symbols = ['◈', '{ }', '→', '◇', '//'];
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
            {symbols.map((sym, i) => (
                <span
                    key={i}
                    className="absolute text-[#e7e5e4] font-mono text-sm select-none"
                    style={{
                        left: `${15 + i * 18}%`,
                        top: `${20 + (i % 3) * 25}%`,
                        animation: `floatSymbol ${6 + i * 1.5}s ease-in-out infinite`,
                        animationDelay: `${i * 0.8}s`,
                        opacity: 0.4,
                    }}
                >
                    {sym}
                </span>
            ))}
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════
   STAGGERED TEXT REVEAL — Word-by-word hero animation
   ═══════════════════════════════════════════════════════════ */
function RevealText({ text, className = '', delay = 0, italic = false }: {
    text: string; className?: string; delay?: number; italic?: boolean;
}) {
    const [isVisible, setIsVisible] = useState(false);
    const ref = useRef<HTMLSpanElement>(null);

    useEffect(() => {
        const timer = setTimeout(() => setIsVisible(true), delay);
        return () => clearTimeout(timer);
    }, [delay]);

    const words = text.split(' ');

    return (
        <span ref={ref} className={`inline ${italic ? 'italic' : ''} ${className}`}>
            {words.map((word, i) => (
                <span key={i} className="inline-block overflow-hidden mr-[0.3em]">
                    <span
                        className="inline-block transition-all duration-700 ease-out"
                        style={{
                            transform: isVisible ? 'translateY(0)' : 'translateY(110%)',
                            opacity: isVisible ? 1 : 0,
                            transitionDelay: `${delay + i * 80}ms`,
                        }}
                    >
                        {word}
                    </span>
                </span>
            ))}
        </span>
    );
}

/* ═══════════════════════════════════════════════════════════
   SHIMMER TEXT — Subtle shine sweep for accent elements
   ═══════════════════════════════════════════════════════════ */
function ShimmerText({ children, className = '' }: { children: React.ReactNode; className?: string }) {
    return (
        <span className={`relative inline-block ${className}`}>
            {children}
            <span
                className="absolute inset-0 pointer-events-none"
                style={{
                    background: 'linear-gradient(90deg, transparent 0%, rgba(216,0,24,0.08) 50%, transparent 100%)',
                    backgroundSize: '200% 100%',
                    animation: 'shimmerSweep 4s ease-in-out infinite',
                }}
            />
        </span>
    );
}

/* ═══════════════════════════════════════════════════════════
   WAITLIST INPUT — Reusable email capture
   ═══════════════════════════════════════════════════════════ */
function WaitlistInput({ count, variant = 'default' }: { count: number; variant?: 'default' | 'bottom' }) {
    const [email, setEmail] = useState('');
    const [state, setState] = useState<'idle' | 'loading' | 'success' | 'error' | 'duplicate'>('idle');
    const [message, setMessage] = useState('');
    const buttonRef = useRef<HTMLButtonElement>(null);

    // Magnetic button effect
    const handleButtonMouseMove = useCallback((e: React.MouseEvent) => {
        const btn = buttonRef.current;
        if (!btn) return;
        const rect = btn.getBoundingClientRect();
        const x = (e.clientX - rect.left - rect.width / 2) * 0.15;
        const y = (e.clientY - rect.top - rect.height / 2) * 0.15;
        btn.style.transform = `translate(${x}px, ${y}px)`;
    }, []);

    const handleButtonMouseLeave = useCallback(() => {
        const btn = buttonRef.current;
        if (btn) btn.style.transform = 'translate(0, 0)';
    }, []);

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
            <div className="flex flex-col items-center gap-3 animate-in">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-[#D80018]" style={{ animation: 'pulse 2s ease-in-out infinite' }} />
                    <span className="text-sm font-mono text-[#37352f]">{message}</span>
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
                    ref={buttonRef}
                    type="submit"
                    disabled={state === 'loading'}
                    onMouseMove={handleButtonMouseMove}
                    onMouseLeave={handleButtonMouseLeave}
                    className="px-6 py-3 bg-[#D80018] text-white text-xs font-mono uppercase tracking-[0.15em] hover:bg-[#b80015] hover:shadow-[0_4px_20px_rgba(216,0,24,0.3)] active:scale-[0.97] transition-all duration-300 disabled:opacity-50 whitespace-nowrap"
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

/* ═══════════════════════════════════════════════════════════
   SCROLL HOOKS — Fade-in + Parallax
   ═══════════════════════════════════════════════════════════ */
function useScrollFade() {
    const ref = useRef<HTMLDivElement>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const observer = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) setIsVisible(true); },
            { threshold: 0.12 },
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
            className={`transition-all duration-700 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} ${className}`}
            style={{ transitionDelay: `${delay}ms` }}
        >
            {children}
        </div>
    );
}

function useParallax(speed: number = 0.1) {
    const ref = useRef<HTMLDivElement>(null);
    const [offset, setOffset] = useState(0);

    useEffect(() => {
        function handleScroll() {
            const el = ref.current;
            if (!el) return;
            const rect = el.getBoundingClientRect();
            const center = rect.top + rect.height / 2;
            const viewCenter = window.innerHeight / 2;
            setOffset((center - viewCenter) * speed);
        }
        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll();
        return () => window.removeEventListener('scroll', handleScroll);
    }, [speed]);

    return { ref, offset };
}

function Parallax({ children, speed = 0.08, className = '' }: { children: React.ReactNode; speed?: number; className?: string }) {
    const { ref, offset } = useParallax(speed);
    return (
        <div ref={ref} className={className} style={{ transform: `translateY(${offset}px)`, willChange: 'transform' }}>
            {children}
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════
   TILE HOVER — Glow effect on tile hover
   ═══════════════════════════════════════════════════════════ */
function GlowTile({ children, className = '', dark = false }: { children: React.ReactNode; className?: string; dark?: boolean }) {
    const tileRef = useRef<HTMLDivElement>(null);

    const handleMove = useCallback((e: React.MouseEvent) => {
        const el = tileRef.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        el.style.setProperty('--glow-x', `${x}px`);
        el.style.setProperty('--glow-y', `${y}px`);
        el.style.setProperty('--glow-opacity', '1');
    }, []);

    const handleLeave = useCallback(() => {
        tileRef.current?.style.setProperty('--glow-opacity', '0');
    }, []);

    return (
        <div
            ref={tileRef}
            className={`relative overflow-hidden ${className}`}
            onMouseMove={handleMove}
            onMouseLeave={handleLeave}
            style={{ '--glow-opacity': '0' } as React.CSSProperties}
        >
            <div
                className="absolute inset-0 pointer-events-none transition-opacity duration-500"
                style={{
                    background: `radial-gradient(300px circle at var(--glow-x, 50%) var(--glow-y, 50%), ${dark ? 'rgba(216,0,24,0.06)' : 'rgba(216,0,24,0.04)'} 0%, transparent 70%)`,
                    opacity: 'var(--glow-opacity)',
                }}
            />
            {children}
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════
   GRID CONSTANT
   ═══════════════════════════════════════════════════════════ */
const GRID = 'border border-[#ededeb] rounded-lg overflow-hidden bg-[#ededeb] grid grid-cols-2 md:grid-cols-4 gap-px';

/* ═══════════════════════════════════════════════════════════
   LANDING PAGE
   ═══════════════════════════════════════════════════════════ */
export default function LandingPage() {
    const [waitlistCount, setWaitlistCount] = useState(0);
    const [scrollY, setScrollY] = useState(0);

    useEffect(() => {
        fetch('/api/waitlist')
            .then(r => r.json())
            .then(d => setWaitlistCount(d.count || 0))
            .catch(() => {});
    }, []);

    useEffect(() => {
        function onScroll() { setScrollY(window.scrollY); }
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    // Hero nav fades as you scroll
    const navOpacity = Math.max(0, 1 - scrollY / 300);

    return (
        <div className="min-h-screen w-full bg-[#fbfbfa] text-[#37352f] relative">
            {/* CSS Keyframes */}
            <style jsx global>{`
                @keyframes floatSymbol {
                    0%, 100% { transform: translateY(0) rotate(0deg); }
                    25% { transform: translateY(-12px) rotate(2deg); }
                    75% { transform: translateY(8px) rotate(-1.5deg); }
                }
                @keyframes shimmerSweep {
                    0% { background-position: 200% 0; }
                    100% { background-position: -200% 0; }
                }
                @keyframes heroGradientPulse {
                    0%, 100% { opacity: 0.25; transform: scale(1); }
                    50% { opacity: 0.45; transform: scale(1.05); }
                }
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes brandPulse {
                    0%, 100% { box-shadow: 0 0 0 0 rgba(216,0,24,0.2); }
                    50% { box-shadow: 0 0 0 8px rgba(216,0,24,0); }
                }
                @keyframes countUp {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>

            {/* Background grid pattern — subtle parallax */}
            <div
                className="fixed inset-0 pointer-events-none opacity-[0.35]"
                style={{
                    backgroundImage: 'linear-gradient(#e5e5e5 1px, transparent 1px), linear-gradient(90deg, #e5e5e5 1px, transparent 1px)',
                    backgroundSize: '32px 32px',
                    transform: `translateY(${scrollY * 0.02}px)`,
                }}
            />

            <div className="relative mx-auto max-w-[900px] px-6 py-8 md:px-20 md:py-16 bg-white min-h-screen shadow-[0_0_60px_-12px_rgba(0,0,0,0.06)] border-x border-[#ededeb]">

                {/* ── Nav ─────────────────────────────────── */}
                <nav
                    className="flex items-center justify-between mb-20 md:mb-32 transition-opacity duration-300"
                    style={{ opacity: navOpacity }}
                >
                    <div className="flex items-center gap-2">
                        <div
                            className="w-3 h-3 bg-[#D80018]"
                            style={{ animation: 'brandPulse 3s ease-in-out infinite' }}
                        />
                        <span className="text-sm font-serif italic text-[#37352f]">VibeCoder</span>
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
                   SECTION 1: HERO — Interactive background + text reveal
                   ══════════════════════════════════════════════ */}
                <section className="mb-24 md:mb-40 relative">
                    {/* Interactive dot grid background */}
                    <div className="absolute -inset-x-6 md:-inset-x-20 -top-16 -bottom-8 overflow-hidden">
                        <HeroBackground />
                        <FloatingSymbols />
                        {/* Ambient gradient orb */}
                        <div
                            className="absolute w-[500px] h-[500px] rounded-full pointer-events-none"
                            style={{
                                left: '50%',
                                top: '40%',
                                transform: `translate(-50%, -50%) translateY(${scrollY * -0.05}px)`,
                                background: 'radial-gradient(circle, rgba(216,0,24,0.04) 0%, transparent 70%)',
                                animation: 'heroGradientPulse 6s ease-in-out infinite',
                            }}
                        />
                    </div>

                    <div className="flex flex-col items-center text-center relative z-10">
                        <span
                            className="text-[10px] font-mono uppercase tracking-[0.3em] text-[#D80018] mb-6"
                            style={{ animation: 'fadeInUp 0.6s ease-out both', animationDelay: '0.2s' }}
                        >
                            <ShimmerText>The Marketplace for AI Builders</ShimmerText>
                        </span>

                        <h1 className="text-4xl sm:text-5xl md:text-7xl font-serif leading-[1.05] tracking-tight text-[#0a0a0a] mb-6">
                            <RevealText text="Where Vibe Coders" delay={400} /><br />
                            <RevealText text="Meet Their Next Build" delay={700} italic />
                        </h1>

                        <p
                            className="text-base md:text-lg text-[#78716c] max-w-lg leading-relaxed mb-10 font-light"
                            style={{ animation: 'fadeInUp 0.8s ease-out both', animationDelay: '1.2s' }}
                        >
                            A transparent marketplace connecting AI-native builders with founders who need them.
                            Ship fast. Get found. Get paid.
                        </p>

                        <div style={{ animation: 'fadeInUp 0.8s ease-out both', animationDelay: '1.5s' }}>
                            <WaitlistInput count={waitlistCount} />
                        </div>
                    </div>
                </section>

                {/* ══════════════════════════════════════════════
                   SECTION 2: THE PROBLEM — Parallax dark tile
                   ══════════════════════════════════════════════ */}
                <section className="mb-24 md:mb-36">
                    <FadeIn>
                        <Parallax speed={0.04}>
                            <div className={GRID}>
                                <GlowTile className="col-span-2 md:col-span-4 p-8 md:p-12 bg-[#242423] flex flex-col justify-center min-h-[220px]" dark>
                                    <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-white/30 mb-4">The Problem</span>
                                    <p className="text-xl md:text-2xl font-serif leading-relaxed text-white/90 max-w-xl">
                                        Millions of tokens are burned every day. Most build nothing anyone needs.
                                    </p>
                                    <p className="text-sm text-white/50 mt-4 font-mono leading-relaxed max-w-lg">
                                        Vibe coding is powerful — but without direction, it&apos;s just expensive experimentation.
                                        We connect builders who ship with people who need things built.
                                    </p>
                                </GlowTile>
                            </div>
                        </Parallax>
                    </FadeIn>
                </section>

                {/* ══════════════════════════════════════════════
                   SECTION 3: BUILDERS & SEEKERS — Hover glow tiles
                   ══════════════════════════════════════════════ */}
                <section className="mb-24 md:mb-36">
                    <div className={GRID}>
                        <FadeIn className="contents" delay={0}>
                            <GlowTile className="col-span-2 p-6 md:p-8 bg-white flex flex-col justify-between min-h-[260px]">
                                <div>
                                    <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-[#D80018] mb-3 block">For Builders</span>
                                    <h2 className="text-2xl md:text-3xl font-serif leading-tight text-[#0a0a0a] mb-4">
                                        Ship fast.<br />Get found.<br />Get paid.
                                    </h2>
                                    <p className="text-sm text-[#78716c] leading-relaxed">
                                        Your showcases are your storefront. Every project you build becomes proof of what you can do —
                                        live demos, build hours, AI tools used. Set your rate. Let the work speak.
                                    </p>
                                </div>
                                <div className="mt-6 flex flex-wrap gap-2">
                                    {['Showcase Portfolio', 'Set Your Rate', 'Get Hired', 'Earn Transparently'].map(tag => (
                                        <span key={tag} className="text-[9px] font-mono uppercase tracking-[0.15em] px-2 py-1 border border-[#e7e5e4] text-[#78716c] hover:border-[#D80018] hover:text-[#D80018] transition-colors duration-300 cursor-default">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </GlowTile>
                        </FadeIn>
                        <FadeIn className="contents" delay={150}>
                            <GlowTile className="col-span-2 p-6 md:p-8 bg-white flex flex-col justify-between min-h-[260px]">
                                <div>
                                    <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-[#D80018] mb-3 block">For Seekers</span>
                                    <h2 className="text-2xl md:text-3xl font-serif leading-tight text-[#0a0a0a] mb-4">
                                        Proof,<br />not promises.
                                    </h2>
                                    <p className="text-sm text-[#78716c] leading-relaxed">
                                        Browse real projects, not PDF portfolios. See how fast they build, what tools they use,
                                        what others say. Hire with confidence — every interaction is a public record.
                                    </p>
                                </div>
                                <div className="mt-6 flex flex-wrap gap-2">
                                    {['Browse Builders', 'See Real Work', 'Transparent Hiring', 'Open Reviews'].map(tag => (
                                        <span key={tag} className="text-[9px] font-mono uppercase tracking-[0.15em] px-2 py-1 border border-[#e7e5e4] text-[#78716c] hover:border-[#D80018] hover:text-[#D80018] transition-colors duration-300 cursor-default">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </GlowTile>
                        </FadeIn>
                    </div>
                </section>

                {/* ══════════════════════════════════════════════
                   SECTION 4: HOW IT WORKS — Staggered parallax tiles
                   ══════════════════════════════════════════════ */}
                <section className="mb-24 md:mb-36">
                    <FadeIn>
                        <div className="text-center mb-10">
                            <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-[#9b9a97]">How It Works</span>
                        </div>
                    </FadeIn>
                    <Parallax speed={0.03}>
                        <div className={GRID}>
                            {[
                                { step: '01', title: 'Create Your Profile', desc: 'Sign in with GitHub. Your data lives on your own branch — you own it completely.', detail: 'GitHub-backed identity' },
                                { step: '02', title: 'Showcase Real Projects', desc: 'Add live demos, build hours, AI tools used. Every showcase is verifiable proof.', detail: 'Live demos + metrics' },
                                { step: '03', title: 'Get Hired Transparently', desc: 'Hire requests are GitHub Issues. Reviews are public. Everything is auditable.', detail: 'Open GitHub Issues' },
                            ].map((item, i) => (
                                <FadeIn key={item.step} className="contents" delay={i * 120}>
                                    <GlowTile className={`${i < 2 ? 'col-span-1' : 'col-span-2 md:col-span-2'} p-6 md:p-8 bg-white flex flex-col min-h-[220px]`}>
                                        <span className="text-[36px] md:text-[44px] font-serif text-[#ededeb] leading-none mb-4 transition-colors duration-500 group-hover:text-[#D80018]/20">{item.step}</span>
                                        <h3 className="text-base md:text-lg font-serif text-[#0a0a0a] mb-2">{item.title}</h3>
                                        <p className="text-[13px] text-[#78716c] leading-relaxed flex-1">{item.desc}</p>
                                        <span className="text-[9px] font-mono uppercase tracking-[0.15em] text-[#D80018] mt-4">{item.detail}</span>
                                    </GlowTile>
                                </FadeIn>
                            ))}
                            <FadeIn className="contents" delay={360}>
                                <div className="col-span-1 md:col-span-1 bg-[#242423] flex items-center justify-center p-6 min-h-[220px] group">
                                    <div
                                        className="w-10 h-10 bg-[#D80018] transition-all duration-500 group-hover:scale-110 group-hover:rotate-45"
                                        style={{ animation: 'brandPulse 3s ease-in-out infinite 1s' }}
                                    />
                                </div>
                            </FadeIn>
                        </div>
                    </Parallax>
                </section>

                {/* ══════════════════════════════════════════════
                   SECTION 5: PHILOSOPHY — Parallax quote
                   ══════════════════════════════════════════════ */}
                <section className="mb-24 md:mb-36">
                    <FadeIn>
                        <Parallax speed={0.06}>
                            <div className="py-16 md:py-28 flex flex-col items-center text-center border-y border-[#ededeb] relative overflow-hidden">
                                {/* Decorative line accent */}
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-px bg-gradient-to-r from-transparent via-[#D80018]/40 to-transparent" />
                                <p className="text-xl md:text-2xl lg:text-3xl font-serif italic leading-relaxed text-[#37352f] max-w-lg">
                                    <ShimmerText>
                                        &ldquo;Every token burned should build something someone needs.&rdquo;
                                    </ShimmerText>
                                </p>
                                <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-[#9b9a97] mt-6">Our Philosophy</span>
                                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-px bg-gradient-to-r from-transparent via-[#D80018]/40 to-transparent" />
                            </div>
                        </Parallax>
                    </FadeIn>
                </section>

                {/* ══════════════════════════════════════════════
                   SECTION 6: TRUST — Hover glow tiles
                   ══════════════════════════════════════════════ */}
                <section className="mb-24 md:mb-36">
                    <FadeIn>
                        <div className={GRID}>
                            <GlowTile className="col-span-2 md:col-span-2 p-6 md:p-8 bg-white flex flex-col min-h-[180px]">
                                <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-[#9b9a97] mb-3">Built on GitHub</span>
                                <h3 className="text-lg md:text-xl font-serif text-[#0a0a0a] mb-2">Fully auditable. No black boxes.</h3>
                                <p className="text-[13px] text-[#78716c] leading-relaxed">
                                    Your profile lives on a GitHub branch you control. Hire requests are Issues.
                                    Reviews are public. We chose radical transparency over convenience.
                                </p>
                            </GlowTile>
                            <GlowTile className="col-span-1 p-6 md:p-8 bg-white flex flex-col items-center justify-center min-h-[180px]">
                                <span className="text-[32px] font-mono text-[#ededeb] transition-transform duration-500 hover:scale-110 inline-block">{'{ }'}</span>
                                <span className="text-[9px] font-mono uppercase tracking-[0.15em] text-[#9b9a97] mt-2">JSON on Git</span>
                            </GlowTile>
                            <GlowTile className="col-span-1 p-6 md:p-8 bg-[#242423] flex flex-col items-center justify-center min-h-[180px]" dark>
                                <svg className="w-8 h-8 text-white/60 transition-transform duration-500 hover:scale-110 hover:text-white/80" fill="currentColor" viewBox="0 0 24 24">
                                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0012 2z" clipRule="evenodd" />
                                </svg>
                                <span className="text-[9px] font-mono uppercase tracking-[0.15em] text-white/40 mt-2">Powered by</span>
                            </GlowTile>
                        </div>
                    </FadeIn>
                </section>

                {/* ══════════════════════════════════════════════
                   SECTION 7: FEATURES — Staggered + hover glow
                   ══════════════════════════════════════════════ */}
                <section className="mb-24 md:mb-36">
                    <FadeIn>
                        <div className="text-center mb-10">
                            <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-[#9b9a97]">Platform Features</span>
                        </div>
                    </FadeIn>
                    <Parallax speed={0.02}>
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
                                <FadeIn key={feature.title} className="contents" delay={i * 60}>
                                    <GlowTile className="col-span-1 p-5 md:p-6 bg-white flex flex-col min-h-[150px] group">
                                        <span className="text-lg text-[#D80018] mb-3 transition-transform duration-300 group-hover:scale-125 inline-block w-fit">{feature.icon}</span>
                                        <h4 className="text-[13px] font-serif text-[#0a0a0a] mb-1">{feature.title}</h4>
                                        <p className="text-[11px] text-[#9b9a97] leading-relaxed">{feature.desc}</p>
                                    </GlowTile>
                                </FadeIn>
                            ))}
                        </div>
                    </Parallax>
                </section>

                {/* ══════════════════════════════════════════════
                   SECTION 8: FINAL CTA — Parallax + glow
                   ══════════════════════════════════════════════ */}
                <section className="mb-20">
                    <FadeIn>
                        <Parallax speed={0.05}>
                            <div className={GRID}>
                                <GlowTile className="col-span-2 md:col-span-4 p-8 md:p-14 bg-[#242423] flex flex-col items-center text-center min-h-[300px] justify-center" dark>
                                    <span className="text-[9px] font-mono uppercase tracking-[0.3em] text-white/30 mb-4">Early Access</span>
                                    <h2 className="text-2xl md:text-4xl font-serif leading-tight text-white mb-3">
                                        Be the first to <span className="italic">vibe</span>.
                                    </h2>
                                    <p className="text-sm text-white/50 max-w-md mb-8 leading-relaxed">
                                        We&apos;re onboarding builders and seekers in small batches.
                                        Join the waitlist to get early access and shape the platform.
                                    </p>
                                    <div className="w-full max-w-md [&_input]:border-white/20 [&_input]:bg-white/5 [&_input]:text-white [&_input]:placeholder:text-white/30 [&_input:focus]:border-[#D80018] [&_input:focus]:ring-[#D80018]/20 [&_span]:text-white/40">
                                        <WaitlistInput count={waitlistCount} variant="bottom" />
                                    </div>
                                </GlowTile>
                            </div>
                        </Parallax>
                    </FadeIn>
                </section>

                {/* ── Footer ───────────────────────────────── */}
                <footer className="pt-8 border-t border-[#ebebeb] text-[#9b9a97] text-sm flex flex-col md:flex-row justify-between items-center gap-6 md:gap-0 pb-8">
                    <div className="italic text-[#37352f] font-serif flex items-center gap-2 shrink-0 whitespace-nowrap">
                        <div className="w-2 h-2 bg-[#D80018]" style={{ animation: 'brandPulse 3s ease-in-out infinite' }} />
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
