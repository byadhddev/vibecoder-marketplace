'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

/* ─────────────────────────────────────────────────────────
   WAITLIST INPUT — Reusable email capture component
   ───────────────────────────────────────────────────────── */
function WaitlistInput({ count, variant = 'default' }: { count: number; variant?: 'default' | 'bottom' }) {
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
                    className="flex-1 px-4 py-3 border border-[#e7e5e4] bg-white text-sm font-mono text-[#37352f] placeholder:text-[#c8c6c4] focus:outline-none focus:border-[#D80018] focus:ring-1 focus:ring-[#D80018]/20 transition-all"
                    disabled={state === 'loading'}
                />
                <button
                    type="submit"
                    disabled={state === 'loading'}
                    className="px-6 py-3 bg-[#D80018] text-white text-xs font-mono uppercase tracking-[0.15em] hover:bg-[#b80015] active:scale-[0.98] transition-all disabled:opacity-50 whitespace-nowrap"
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
   SCROLL FADE — Intersection Observer for entrance animations
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
   TILE GRID — Premium tile layout
   ───────────────────────────────────────────────────────── */
const GRID = 'border border-[#ededeb] rounded-lg overflow-hidden bg-[#ededeb] grid grid-cols-2 md:grid-cols-4 gap-px';

/* ─────────────────────────────────────────────────────────
   LANDING PAGE
   ───────────────────────────────────────────────────────── */
export default function LandingPage() {
    const [waitlistCount, setWaitlistCount] = useState(0);

    useEffect(() => {
        fetch('/api/waitlist')
            .then(r => r.json())
            .then(d => setWaitlistCount(d.count || 0))
            .catch(() => {});
    }, []);

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
                <nav className="flex items-center justify-between mb-20 md:mb-32">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-[#D80018]" />
                        <span className="text-sm font-serif italic text-[#37352f]">VibeCoder</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link
                            href="/home"
                            className="text-[10px] font-mono uppercase tracking-[0.15em] text-[#9b9a97] hover:text-[#37352f] transition-colors"
                        >
                            Marketplace →
                        </Link>
                    </div>
                </nav>

                {/* ── Section 1: Hero ────────────────────── */}
                <section className="mb-24 md:mb-36">
                    <FadeIn>
                        <div className="flex flex-col items-center text-center">
                            <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-[#D80018] mb-6">
                                The Marketplace for AI Builders
                            </span>
                            <h1 className="text-4xl sm:text-5xl md:text-7xl font-serif leading-[1.05] tracking-tight text-[#0a0a0a] mb-6">
                                Where Vibe Coders<br />
                                <span className="italic">Meet Their Next Build</span>
                            </h1>
                            <p className="text-base md:text-lg text-[#78716c] max-w-lg leading-relaxed mb-10 font-light">
                                A transparent marketplace connecting AI-native builders with founders who need them. 
                                Ship fast. Get found. Get paid.
                            </p>
                            <WaitlistInput count={waitlistCount} />
                        </div>
                    </FadeIn>
                </section>

                {/* ── Section 2: The Problem ─────────────── */}
                <section className="mb-24 md:mb-36">
                    <FadeIn>
                        <div className={GRID}>
                            <div className="col-span-2 md:col-span-4 p-8 md:p-12 bg-[#242423] flex flex-col justify-center min-h-[200px]">
                                <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-white/30 mb-4">The Problem</span>
                                <p className="text-xl md:text-2xl font-serif leading-relaxed text-white/90 max-w-xl">
                                    Millions of tokens are burned every day. Most build nothing anyone needs.
                                </p>
                                <p className="text-sm text-white/50 mt-4 font-mono leading-relaxed max-w-lg">
                                    Vibe coding is powerful — but without direction, it&apos;s just expensive experimentation. 
                                    We connect builders who ship with people who need things built.
                                </p>
                            </div>
                        </div>
                    </FadeIn>
                </section>

                {/* ── Section 3: For Builders & Seekers ───── */}
                <section className="mb-24 md:mb-36">
                    <div className={GRID}>
                        <FadeIn className="contents" delay={0}>
                            <div className="col-span-2 p-6 md:p-8 bg-white flex flex-col justify-between min-h-[240px]">
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
                                        <span key={tag} className="text-[9px] font-mono uppercase tracking-[0.15em] px-2 py-1 border border-[#e7e5e4] text-[#78716c]">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </FadeIn>
                        <FadeIn className="contents" delay={150}>
                            <div className="col-span-2 p-6 md:p-8 bg-white flex flex-col justify-between min-h-[240px]">
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
                                        <span key={tag} className="text-[9px] font-mono uppercase tracking-[0.15em] px-2 py-1 border border-[#e7e5e4] text-[#78716c]">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </FadeIn>
                    </div>
                </section>

                {/* ── Section 4: How It Works ─────────────── */}
                <section className="mb-24 md:mb-36">
                    <FadeIn>
                        <div className="text-center mb-10">
                            <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-[#9b9a97]">How It Works</span>
                        </div>
                    </FadeIn>
                    <div className={GRID}>
                        {[
                            {
                                step: '01',
                                title: 'Create Your Profile',
                                desc: 'Sign in with GitHub. Your data lives on your own branch — you own it completely.',
                                detail: 'GitHub-backed identity',
                            },
                            {
                                step: '02',
                                title: 'Showcase Real Projects',
                                desc: 'Add live demos, build hours, AI tools used. Every showcase is verifiable proof.',
                                detail: 'Live demos + metrics',
                            },
                            {
                                step: '03',
                                title: 'Get Hired Transparently',
                                desc: 'Hire requests are GitHub Issues. Reviews are public. Everything is auditable.',
                                detail: 'Open GitHub Issues',
                            },
                        ].map((item, i) => (
                            <FadeIn key={item.step} className="contents" delay={i * 100}>
                                <div className={`${i < 2 ? 'col-span-1' : 'col-span-2 md:col-span-2'} p-6 md:p-8 bg-white flex flex-col min-h-[200px]`}>
                                    <span className="text-[32px] md:text-[40px] font-serif text-[#ededeb] leading-none mb-4">{item.step}</span>
                                    <h3 className="text-base md:text-lg font-serif text-[#0a0a0a] mb-2">{item.title}</h3>
                                    <p className="text-[13px] text-[#78716c] leading-relaxed flex-1">{item.desc}</p>
                                    <span className="text-[9px] font-mono uppercase tracking-[0.15em] text-[#D80018] mt-4">{item.detail}</span>
                                </div>
                            </FadeIn>
                        ))}
                        <FadeIn className="contents" delay={300}>
                            <div className="col-span-1 md:col-span-1 bg-[#242423] flex items-center justify-center p-6 min-h-[200px]">
                                <div className="w-8 h-8 bg-[#D80018]" />
                            </div>
                        </FadeIn>
                    </div>
                </section>

                {/* ── Section 5: Philosophy ────────────────── */}
                <section className="mb-24 md:mb-36">
                    <FadeIn>
                        <div className="py-16 md:py-24 flex flex-col items-center text-center border-y border-[#ededeb]">
                            <p className="text-xl md:text-2xl lg:text-3xl font-serif italic leading-relaxed text-[#37352f] max-w-lg">
                                &ldquo;Every token burned should build something someone needs.&rdquo;
                            </p>
                            <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-[#9b9a97] mt-6">Our Philosophy</span>
                        </div>
                    </FadeIn>
                </section>

                {/* ── Section 6: Trust & Transparency ──────── */}
                <section className="mb-24 md:mb-36">
                    <FadeIn>
                        <div className={GRID}>
                            <div className="col-span-2 md:col-span-2 p-6 md:p-8 bg-white flex flex-col min-h-[180px]">
                                <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-[#9b9a97] mb-3">Built on GitHub</span>
                                <h3 className="text-lg md:text-xl font-serif text-[#0a0a0a] mb-2">Fully auditable. No black boxes.</h3>
                                <p className="text-[13px] text-[#78716c] leading-relaxed">
                                    Your profile lives on a GitHub branch you control. Hire requests are Issues. 
                                    Reviews are public. We chose radical transparency over convenience.
                                </p>
                            </div>
                            <div className="col-span-1 p-6 md:p-8 bg-white flex flex-col items-center justify-center min-h-[180px]">
                                <span className="text-[32px] font-mono text-[#ededeb]">{'{ }'}</span>
                                <span className="text-[9px] font-mono uppercase tracking-[0.15em] text-[#9b9a97] mt-2">JSON on Git</span>
                            </div>
                            <div className="col-span-1 p-6 md:p-8 bg-[#242423] flex flex-col items-center justify-center min-h-[180px]">
                                <svg className="w-8 h-8 text-white/60" fill="currentColor" viewBox="0 0 24 24">
                                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0012 2z" clipRule="evenodd" />
                                </svg>
                                <span className="text-[9px] font-mono uppercase tracking-[0.15em] text-white/40 mt-2">Powered by</span>
                            </div>
                        </div>
                    </FadeIn>
                </section>

                {/* ── Section 7: What You Get ──────────────── */}
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
                                <div className="col-span-1 p-5 md:p-6 bg-white flex flex-col min-h-[140px]">
                                    <span className="text-lg text-[#D80018] mb-3">{feature.icon}</span>
                                    <h4 className="text-[13px] font-serif text-[#0a0a0a] mb-1">{feature.title}</h4>
                                    <p className="text-[11px] text-[#9b9a97] leading-relaxed">{feature.desc}</p>
                                </div>
                            </FadeIn>
                        ))}
                    </div>
                </section>

                {/* ── Section 8: Final CTA ─────────────────── */}
                <section className="mb-20">
                    <FadeIn>
                        <div className={GRID}>
                            <div className="col-span-2 md:col-span-4 p-8 md:p-14 bg-[#242423] flex flex-col items-center text-center min-h-[280px] justify-center">
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
                            </div>
                        </div>
                    </FadeIn>
                </section>

                {/* ── Footer ───────────────────────────────── */}
                <footer className="pt-8 border-t border-[#ebebeb] text-[#9b9a97] text-sm flex flex-col md:flex-row justify-between items-center gap-6 md:gap-0 pb-8">
                    <div className="italic text-[#37352f] font-serif flex items-center gap-2 shrink-0 whitespace-nowrap">
                        <div className="w-2 h-2 bg-[#D80018]" />
                        VibeCoder Marketplace
                    </div>
                    <div className="flex flex-wrap items-center justify-center md:justify-end gap-x-6 gap-y-3">
                        <Link href="/home" className="hover:text-[#37352f] transition-colors hover:underline decoration-dotted underline-offset-4">
                            Marketplace
                        </Link>
                        <Link href="/explore" className="hover:text-[#37352f] transition-colors hover:underline decoration-dotted underline-offset-4">
                            Explore
                        </Link>
                        <span className="shrink-0 whitespace-nowrap">© 2026</span>
                    </div>
                </footer>

            </div>
        </div>
    );
}
