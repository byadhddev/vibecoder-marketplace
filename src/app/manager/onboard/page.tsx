'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { PageShell } from '@/components/layout/PageShell';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { GRID_CLASSES } from '@/lib/vibe';

const SKILL_SUGGESTIONS = [
    'React', 'Next.js', 'TypeScript', 'Python', 'Node.js', 'Tailwind CSS',
    'Vue', 'Svelte', 'Go', 'Rust', 'Swift', 'Flutter', 'Django', 'Rails',
    'PostgreSQL', 'MongoDB', 'Firebase', 'AWS', 'Figma', 'Three.js',
];

export default function OnboardPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [name, setName] = useState('');
    const [role, setRole] = useState('');
    const [skills, setSkills] = useState<string[]>([]);
    const [skillInput, setSkillInput] = useState('');

    const username = session ? ((session.user as { username?: string }).username || '') : '';
    const avatarUrl = session?.user?.image || '';

    // Redirect if not logged in
    useEffect(() => {
        if (status === 'unauthenticated') router.push('/login');
    }, [status, router]);

    // Load existing profile data
    useEffect(() => {
        if (status !== 'authenticated') return;
        fetch('/api/marketplace/profile')
            .then(r => r.ok ? r.json() : null)
            .then(d => {
                if (d?.profile) {
                    setName(d.profile.name || session?.user?.name || '');
                    setRole(d.profile.role || '');
                    setSkills(d.profile.skills || []);
                } else {
                    setName(session?.user?.name || '');
                }
            })
            .catch(() => setName(session?.user?.name || ''))
            .finally(() => setLoading(false));
    }, [status]); // eslint-disable-line react-hooks/exhaustive-deps

    const addSkill = (skill: string) => {
        const s = skill.trim();
        if (s && !skills.includes(s)) {
            setSkills(prev => [...prev, s]);
            setSkillInput('');
        }
    };

    const removeSkill = (skill: string) => setSkills(prev => prev.filter(s => s !== skill));

    const handleGoLive = async () => {
        setSaving(true);
        try {
            await fetch('/api/marketplace/profile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, role, skills }),
            });
            router.push('/manager');
        } catch { /* ignore */ }
        setSaving(false);
    };

    if (status === 'loading' || loading) return (
        <PageShell><Header />
            <section><div className={GRID_CLASSES}>
                <div className="col-span-2 md:col-span-4 p-12 bg-vc-surface flex items-center justify-center">
                    <div className="w-5 h-5 bg-vc-border animate-pulse" />
                </div>
            </div></section>
        <Footer /></PageShell>
    );

    const isValid = name.trim().length > 0 && role.trim().length > 0;

    return (
        <PageShell>
            <Header />
            <section>
                <div className={GRID_CLASSES}>

                    {/* ── Row 1: Dark welcome ── */}
                    <div className="col-span-1 aspect-square bg-vc-dark flex items-center justify-center">
                        {avatarUrl ? (
                            <Image src={avatarUrl} alt={username} width={48} height={48}
                                className="w-12 h-12 rounded-sm opacity-60" />
                        ) : (
                            <span className="text-[28px] font-serif text-white/20">vc</span>
                        )}
                    </div>
                    <div className="col-span-1 md:col-span-2 p-6 md:p-8 bg-vc-dark flex flex-col justify-end min-h-[100px]">
                        <span className="text-lg md:text-xl font-serif text-white">
                            Welcome{username ? `, ${username}` : ''}
                        </span>
                        <span className="text-[10px] font-mono text-white/40 mt-1">
                            Set up the basics — everything else lives in the Manager
                        </span>
                    </div>
                    <div className="col-span-1 p-5 bg-vc-surface flex flex-col justify-between min-h-[100px]">
                        <span className="text-[9px] font-mono uppercase tracking-[0.15em] text-vc-text-secondary">Setup</span>
                        <span className="text-2xl font-serif text-vc-text">3<span className="text-vc-text-muted"> fields</span></span>
                        <span className="text-[9px] font-mono text-vc-text-secondary">name, role, skills</span>
                    </div>

                    {/* ── Row 2: Name + Role ── */}
                    <div className="col-span-2 md:col-span-2 p-5 md:p-6 bg-vc-surface flex flex-col gap-4">
                        <div>
                            <label className="text-[9px] font-mono uppercase tracking-[0.15em] text-vc-text-secondary block mb-1.5">
                                Display Name
                            </label>
                            <input
                                value={name}
                                onChange={e => setName(e.target.value)}
                                className="w-full px-3 py-2.5 border border-vc-border text-sm font-mono text-vc-text outline-none focus:border-[#37352f] bg-vc-surface transition-colors"
                                placeholder="How you appear on the marketplace"
                            />
                        </div>
                        <div>
                            <label className="text-[9px] font-mono uppercase tracking-[0.15em] text-vc-text-secondary block mb-1.5">
                                Role
                            </label>
                            <input
                                value={role}
                                onChange={e => setRole(e.target.value)}
                                className="w-full px-3 py-2.5 border border-vc-border text-sm font-mono text-vc-text outline-none focus:border-[#37352f] bg-vc-surface transition-colors"
                                placeholder="e.g. Full-Stack Vibe Coder"
                            />
                        </div>
                    </div>

                    {/* ── Row 2 right: Skills ── */}
                    <div className="col-span-2 md:col-span-2 p-5 md:p-6 bg-vc-surface flex flex-col gap-3">
                        <label className="text-[9px] font-mono uppercase tracking-[0.15em] text-vc-text-secondary">Skills</label>
                        {skills.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                                {skills.map(s => (
                                    <span key={s} className="text-[9px] font-mono px-2 py-1 bg-vc-surface-raised text-vc-text flex items-center gap-1.5">
                                        {s}
                                        <button onClick={() => removeSkill(s)} className="text-vc-text-secondary hover:text-[#D80018] transition-colors">×</button>
                                    </span>
                                ))}
                            </div>
                        )}
                        <input
                            value={skillInput}
                            onChange={e => setSkillInput(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSkill(skillInput); } }}
                            className="w-full px-3 py-2.5 border border-vc-border text-sm font-mono text-vc-text outline-none focus:border-[#37352f] bg-vc-surface transition-colors"
                            placeholder="Type and press Enter"
                        />
                        <div className="flex flex-wrap gap-1">
                            {SKILL_SUGGESTIONS.filter(s => !skills.includes(s)).slice(0, 10).map(s => (
                                <button key={s} onClick={() => addSkill(s)}
                                    className="text-[8px] font-mono px-1.5 py-0.5 bg-vc-surface-raised text-vc-text-secondary hover:text-vc-text hover:bg-vc-border transition-colors">
                                    + {s}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* ── Row 3: Action bar ── */}
                    <div className="col-span-2 md:col-span-3 p-4 md:p-5 bg-vc-surface-raised flex items-center">
                        <p className="text-[11px] font-mono text-vc-text-secondary leading-relaxed">
                            Showcases, rates, and everything else — set up in the Manager after you go live.
                        </p>
                    </div>
                    <div className="col-span-2 md:col-span-1 p-4 md:p-5 bg-vc-surface-raised flex items-center justify-end">
                        <button
                            onClick={handleGoLive}
                            disabled={saving || !isValid}
                            className="w-full md:w-auto px-8 py-2.5 bg-vc-dark text-white text-[11px] font-mono uppercase tracking-[0.12em] hover:bg-[var(--vc-dark-hover)] transition-colors disabled:opacity-30"
                        >
                            {saving ? 'Saving...' : 'Go Live'}
                        </button>
                    </div>

                    {/* ── Signature ── */}
                    <div className="col-span-2 md:col-span-4 px-5 py-3 bg-vc-surface flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-6 h-px bg-[#D80018]/30" />
                            <span className="text-[11px] font-serif italic text-vc-text-secondary">vibecoder.dev</span>
                        </div>
                        <button
                            onClick={() => router.push('/manager')}
                            className="text-[10px] font-mono text-vc-text-secondary hover:text-vc-text transition-colors"
                        >
                            Skip for now
                        </button>
                    </div>
                </div>
            </section>
            <Footer />
        </PageShell>
    );
}
