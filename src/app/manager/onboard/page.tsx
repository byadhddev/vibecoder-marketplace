'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { PageShell } from '@/components/layout/PageShell';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { GRID_CLASSES } from '@/lib/vibe';

const SKILL_SUGGESTIONS = [
    'React', 'Next.js', 'TypeScript', 'Python', 'Node.js', 'Tailwind CSS',
    'Vue', 'Svelte', 'Go', 'Rust', 'Swift', 'Flutter', 'Django', 'Rails',
    'PostgreSQL', 'MongoDB', 'Firebase', 'AWS', 'Figma', 'Three.js',
];

const AI_TOOL_SUGGESTIONS = [
    'Cursor', 'GitHub Copilot', 'Claude', 'ChatGPT', 'v0', 'Bolt',
    'Windsurf', 'Replit AI', 'Devin', 'Gemini',
];

interface ProfileForm {
    name: string;
    role: string;
    skills: string[];
    skillInput: string;
}

interface ShowcaseForm {
    title: string;
    description: string;
    url: string;
    build_hours: string;
    ai_tools: string[];
    tags: string[];
    tagInput: string;
}

interface RateForm {
    available_for_hire: boolean;
    hourly_rate: string;
    rate_type: 'hourly' | 'project' | 'negotiable';
}

const STEP_LABELS = ['Profile', 'Showcase', 'Rate', 'Publish'];

export default function OnboardPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [saving, setSaving] = useState(false);
    const [profileForm, setProfileForm] = useState<ProfileForm>({ name: '', role: '', skills: [], skillInput: '' });
    const [showcaseForm, setShowcaseForm] = useState<ShowcaseForm>({ title: '', description: '', url: '', build_hours: '', ai_tools: [], tags: [], tagInput: '' });
    const [rateForm, setRateForm] = useState<RateForm>({ available_for_hire: true, hourly_rate: '', rate_type: 'negotiable' });

    useEffect(() => {
        if (status === 'unauthenticated') router.push('/login');
    }, [status, router]);

    useEffect(() => {
        if (session?.user?.name && !profileForm.name) {
            setProfileForm(prev => ({ ...prev, name: session.user?.name || '' }));
        }
    }, [session]); // eslint-disable-line react-hooks/exhaustive-deps

    const username = session ? ((session.user as { username?: string }).username || '') : '';

    const addSkill = (skill: string) => {
        const s = skill.trim();
        if (s && !profileForm.skills.includes(s)) setProfileForm(prev => ({ ...prev, skills: [...prev.skills, s], skillInput: '' }));
    };

    const addTag = (tag: string) => {
        const t = tag.trim();
        if (t && !showcaseForm.tags.includes(t)) setShowcaseForm(prev => ({ ...prev, tags: [...prev.tags, t], tagInput: '' }));
    };

    const toggleAiTool = (tool: string) => {
        setShowcaseForm(prev => ({
            ...prev,
            ai_tools: prev.ai_tools.includes(tool) ? prev.ai_tools.filter(t => t !== tool) : [...prev.ai_tools, tool],
        }));
    };

    const saveProfile = async () => {
        setSaving(true);
        try {
            await fetch('/api/marketplace/profile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: profileForm.name, role: profileForm.role, skills: profileForm.skills }),
            });
            setStep(2);
        } catch { /* ignore */ }
        setSaving(false);
    };

    const saveShowcase = async () => {
        setSaving(true);
        try {
            await fetch('/api/marketplace/showcases', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: showcaseForm.title, description: showcaseForm.description, url: showcaseForm.url,
                    build_hours: showcaseForm.build_hours ? parseInt(showcaseForm.build_hours) : 0,
                    ai_tools: showcaseForm.ai_tools, tags: showcaseForm.tags, status: 'published',
                }),
            });
            setStep(3);
        } catch { /* ignore */ }
        setSaving(false);
    };

    const saveRate = async () => {
        setSaving(true);
        try {
            await fetch('/api/marketplace/profile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    available_for_hire: rateForm.available_for_hire,
                    hourly_rate: rateForm.hourly_rate ? parseInt(rateForm.hourly_rate) : 0,
                    rate_type: rateForm.rate_type,
                }),
            });
            setStep(4);
        } catch { /* ignore */ }
        setSaving(false);
    };

    if (status === 'loading') return null;

    const inputClass = 'w-full px-3 py-2 border border-[#ededeb] rounded-md text-sm font-mono text-[#37352f] outline-none focus:border-brand-red/40 bg-white';

    return (
        <PageShell>
            <Header />
            <section>
                <div className={GRID_CLASSES}>

                    {/* ── Title row ── */}
                    <div className="col-span-1 aspect-square bg-[#242423] flex items-center justify-center">
                        <span className="text-[28px] font-serif text-white/20">{step}</span>
                    </div>
                    <div className="col-span-1 md:col-span-2 p-6 md:p-8 bg-[#242423] flex flex-col justify-end min-h-[100px]">
                        <span className="text-lg font-serif text-white">{
                            step === 1 ? 'Tell us about yourself' :
                            step === 2 ? 'Your first showcase' :
                            step === 3 ? 'Set your rate' :
                            'You\u2019re all set'
                        }</span>
                        <span className="text-[10px] font-mono text-white/40 mt-1">{
                            step === 1 ? 'This shows on your public profile' :
                            step === 2 ? 'Show what you\u2019ve built — a live project or demo' :
                            step === 3 ? 'Let seekers know what you charge' :
                            'Your profile is live on VibeCoder'
                        }</span>
                    </div>
                    <div className="col-span-1 p-5 bg-white flex flex-col justify-between min-h-[100px]">
                        <span className="text-[9px] font-mono uppercase tracking-[0.15em] text-[#9b9a97]">Progress</span>
                        <span className="text-2xl font-serif text-[#37352f]">{step}<span className="text-[#ededeb]">/4</span></span>
                        <span className="text-[9px] font-mono text-[#9b9a97]">{STEP_LABELS[step - 1]}</span>
                    </div>

                    {/* ── Step bar ── */}
                    <div className="col-span-2 md:col-span-4 px-5 py-3 bg-[#f7f6f3] flex items-center gap-4">
                        {STEP_LABELS.map((label, i) => (
                            <div key={label} className="flex items-center gap-2">
                                <div className={`w-5 h-5 flex items-center justify-center text-[9px] font-mono transition-all ${
                                    step > i + 1 ? 'bg-[#37352f] text-white' : step === i + 1 ? 'bg-[#D80018] text-white' : 'bg-[#ededeb] text-[#9b9a97]'
                                }`}>
                                    {step > i + 1 ? '✓' : i + 1}
                                </div>
                                <span className={`text-[9px] font-mono uppercase tracking-[0.1em] hidden sm:inline ${step >= i + 1 ? 'text-[#37352f]' : 'text-[#9b9a97]'}`}>{label}</span>
                                {i < 3 && <div className={`w-6 h-px ${step > i + 1 ? 'bg-[#37352f]' : 'bg-[#ededeb]'}`} />}
                            </div>
                        ))}
                    </div>

                    {/* ── Step 1: Profile ── */}
                    {step === 1 && (
                        <>
                            <div className="col-span-2 md:col-span-2 p-6 flex flex-col gap-4 bg-white">
                                <div>
                                    <label className="text-[9px] font-mono uppercase tracking-[0.15em] text-[#9b9a97] block mb-1.5">Name</label>
                                    <input value={profileForm.name} onChange={e => setProfileForm(p => ({ ...p, name: e.target.value }))}
                                        className={inputClass} placeholder="Your display name" />
                                </div>
                                <div>
                                    <label className="text-[9px] font-mono uppercase tracking-[0.15em] text-[#9b9a97] block mb-1.5">Role</label>
                                    <input value={profileForm.role} onChange={e => setProfileForm(p => ({ ...p, role: e.target.value }))}
                                        className={inputClass} placeholder="e.g. Full-Stack Vibe Coder" />
                                </div>
                            </div>
                            <div className="col-span-2 md:col-span-2 p-6 flex flex-col gap-3 bg-white">
                                <label className="text-[9px] font-mono uppercase tracking-[0.15em] text-[#9b9a97]">Skills</label>
                                {profileForm.skills.length > 0 && (
                                    <div className="flex flex-wrap gap-1">
                                        {profileForm.skills.map(s => (
                                            <span key={s} className="text-[9px] font-mono px-2 py-1 bg-[#f7f6f3] text-[#37352f] flex items-center gap-1">
                                                {s}
                                                <button onClick={() => setProfileForm(p => ({ ...p, skills: p.skills.filter(x => x !== s) }))} className="text-[#9b9a97] hover:text-[#D80018]">×</button>
                                            </span>
                                        ))}
                                    </div>
                                )}
                                <input value={profileForm.skillInput}
                                    onChange={e => setProfileForm(p => ({ ...p, skillInput: e.target.value }))}
                                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSkill(profileForm.skillInput); } }}
                                    className={inputClass} placeholder="Type a skill and press Enter" />
                                <div className="flex flex-wrap gap-1">
                                    {SKILL_SUGGESTIONS.filter(s => !profileForm.skills.includes(s)).slice(0, 8).map(s => (
                                        <button key={s} onClick={() => addSkill(s)}
                                            className="text-[8px] font-mono px-1.5 py-0.5 bg-[#f7f6f3] text-[#9b9a97] hover:text-[#37352f] hover:bg-[#ededeb] transition-colors">+ {s}</button>
                                    ))}
                                </div>
                            </div>
                            <div className="col-span-2 md:col-span-4 p-4 flex justify-end bg-[#f7f6f3]">
                                <button onClick={saveProfile} disabled={saving || !profileForm.name}
                                    className="px-6 py-2 bg-[#242423] text-white text-[11px] font-mono uppercase tracking-[0.1em] hover:bg-[#37352f] transition-colors disabled:opacity-40">
                                    {saving ? 'Saving...' : 'Next \u2192'}
                                </button>
                            </div>
                        </>
                    )}

                    {/* ── Step 2: Showcase ── */}
                    {step === 2 && (
                        <>
                            <div className="col-span-2 md:col-span-2 p-6 flex flex-col gap-4 bg-white">
                                <div>
                                    <label className="text-[9px] font-mono uppercase tracking-[0.15em] text-[#9b9a97] block mb-1.5">Project Title</label>
                                    <input value={showcaseForm.title} onChange={e => setShowcaseForm(p => ({ ...p, title: e.target.value }))}
                                        className={inputClass} placeholder="e.g. AI Dashboard MVP" />
                                </div>
                                <div>
                                    <label className="text-[9px] font-mono uppercase tracking-[0.15em] text-[#9b9a97] block mb-1.5">Description</label>
                                    <textarea value={showcaseForm.description} onChange={e => setShowcaseForm(p => ({ ...p, description: e.target.value }))} rows={2}
                                        className={`${inputClass} resize-none`} placeholder="What does it do? Who is it for?" />
                                </div>
                                <div>
                                    <label className="text-[9px] font-mono uppercase tracking-[0.15em] text-[#9b9a97] block mb-1.5">Live URL</label>
                                    <input value={showcaseForm.url} onChange={e => setShowcaseForm(p => ({ ...p, url: e.target.value }))}
                                        className={inputClass} placeholder="https://..." />
                                </div>
                            </div>
                            <div className="col-span-2 md:col-span-2 p-6 flex flex-col gap-4 bg-white">
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-[9px] font-mono uppercase tracking-[0.15em] text-[#9b9a97] block mb-1.5">Build Hours</label>
                                        <input type="number" value={showcaseForm.build_hours} onChange={e => setShowcaseForm(p => ({ ...p, build_hours: e.target.value }))}
                                            className={inputClass} placeholder="e.g. 6" />
                                    </div>
                                    <div>
                                        <label className="text-[9px] font-mono uppercase tracking-[0.15em] text-[#9b9a97] block mb-1.5">Tags</label>
                                        <input value={showcaseForm.tagInput}
                                            onChange={e => setShowcaseForm(p => ({ ...p, tagInput: e.target.value }))}
                                            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag(showcaseForm.tagInput); } }}
                                            className={inputClass} placeholder="Enter to add" />
                                    </div>
                                </div>
                                {showcaseForm.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-1">
                                        {showcaseForm.tags.map(t => (
                                            <span key={t} className="text-[9px] font-mono px-2 py-1 bg-[#f7f6f3] text-[#37352f] flex items-center gap-1">
                                                {t}
                                                <button onClick={() => setShowcaseForm(p => ({ ...p, tags: p.tags.filter(x => x !== t) }))} className="text-[#9b9a97] hover:text-[#D80018]">×</button>
                                            </span>
                                        ))}
                                    </div>
                                )}
                                <div>
                                    <label className="text-[9px] font-mono uppercase tracking-[0.15em] text-[#9b9a97] block mb-1.5">AI Tools Used</label>
                                    <div className="flex flex-wrap gap-1">
                                        {AI_TOOL_SUGGESTIONS.map(tool => (
                                            <button key={tool} onClick={() => toggleAiTool(tool)}
                                                className={`text-[9px] font-mono px-2 py-1 transition-colors ${
                                                    showcaseForm.ai_tools.includes(tool) ? 'bg-[#242423] text-white' : 'bg-[#f7f6f3] text-[#9b9a97] hover:text-[#37352f]'
                                                }`}>{tool}</button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="col-span-2 md:col-span-4 p-4 flex justify-between bg-[#f7f6f3]">
                                <button onClick={() => setStep(1)} className="text-[11px] font-mono text-[#9b9a97] hover:text-[#37352f] transition-colors">\u2190 Back</button>
                                <div className="flex gap-3">
                                    <button onClick={() => setStep(3)} className="text-[11px] font-mono text-[#9b9a97] hover:text-[#37352f] transition-colors">Skip</button>
                                    <button onClick={saveShowcase} disabled={saving || !showcaseForm.title || !showcaseForm.url}
                                        className="px-6 py-2 bg-[#242423] text-white text-[11px] font-mono uppercase tracking-[0.1em] hover:bg-[#37352f] transition-colors disabled:opacity-40">
                                        {saving ? 'Saving...' : 'Next \u2192'}
                                    </button>
                                </div>
                            </div>
                        </>
                    )}

                    {/* ── Step 3: Rate ── */}
                    {step === 3 && (
                        <>
                            <div className="col-span-2 md:col-span-2 p-6 flex flex-col gap-5 bg-white">
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => setRateForm(p => ({ ...p, available_for_hire: !p.available_for_hire }))}
                                        className={`w-10 h-5 rounded-full transition-colors relative ${rateForm.available_for_hire ? 'bg-[#242423]' : 'bg-[#ededeb]'}`}>
                                        <div className={`w-4 h-4 rounded-full bg-white shadow-sm absolute top-0.5 transition-all ${rateForm.available_for_hire ? 'left-5' : 'left-0.5'}`} />
                                    </button>
                                    <span className="text-sm font-mono text-[#37352f]">Available for Hire</span>
                                </div>
                                <div>
                                    <label className="text-[9px] font-mono uppercase tracking-[0.15em] text-[#9b9a97] block mb-1.5">Rate (USD)</label>
                                    <input type="number" value={rateForm.hourly_rate} onChange={e => setRateForm(p => ({ ...p, hourly_rate: e.target.value }))}
                                        className={inputClass} placeholder="e.g. 75" />
                                </div>
                                <div>
                                    <label className="text-[9px] font-mono uppercase tracking-[0.15em] text-[#9b9a97] block mb-1.5">Rate Type</label>
                                    <div className="flex gap-2">
                                        {(['hourly', 'project', 'negotiable'] as const).map(t => (
                                            <button key={t} onClick={() => setRateForm(p => ({ ...p, rate_type: t }))}
                                                className={`text-[10px] font-mono px-3 py-1.5 transition-colors ${
                                                    rateForm.rate_type === t ? 'bg-[#242423] text-white' : 'bg-[#f7f6f3] text-[#9b9a97] hover:text-[#37352f]'
                                                }`}>{t}</button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="col-span-2 md:col-span-2 p-6 bg-white flex flex-col justify-center min-h-[120px]">
                                <span className="text-[9px] font-mono uppercase tracking-[0.15em] text-[#9b9a97] mb-2">Tip</span>
                                <p className="text-[13px] font-serif text-[#37352f] leading-relaxed">
                                    Setting a rate helps seekers filter by budget. You can always change it later or set to &ldquo;negotiable&rdquo;.
                                </p>
                            </div>
                            <div className="col-span-2 md:col-span-4 p-4 flex justify-between bg-[#f7f6f3]">
                                <button onClick={() => setStep(2)} className="text-[11px] font-mono text-[#9b9a97] hover:text-[#37352f] transition-colors">\u2190 Back</button>
                                <button onClick={saveRate} disabled={saving}
                                    className="px-6 py-2 bg-[#242423] text-white text-[11px] font-mono uppercase tracking-[0.1em] hover:bg-[#37352f] transition-colors disabled:opacity-40">
                                    {saving ? 'Saving...' : 'Next \u2192'}
                                </button>
                            </div>
                        </>
                    )}

                    {/* ── Step 4: Done ── */}
                    {step === 4 && (
                        <>
                            <div className="col-span-2 md:col-span-4 p-8 md:p-12 flex flex-col items-center text-center min-h-[180px] justify-center bg-white">
                                <div className="w-10 h-10 bg-[#242423] flex items-center justify-center mb-4">
                                    <span className="text-white text-lg font-serif">✓</span>
                                </div>
                                <span className="text-xl font-serif text-[#37352f] mb-2">Profile is live</span>
                                <p className="text-[12px] font-mono text-[#9b9a97] max-w-md leading-relaxed">
                                    Seekers can now find you, see your showcases, and send hire requests. Edit anytime in the Manager.
                                </p>
                            </div>
                            <div className="col-span-2 p-5 md:p-6 bg-white flex flex-col gap-2 min-h-[100px]">
                                <span className="text-[9px] font-mono uppercase tracking-[0.15em] text-[#9b9a97]">Profile</span>
                                <span className="text-sm font-serif text-[#37352f]">{profileForm.name || username}</span>
                                <span className="text-[11px] font-mono text-[#9b9a97]">{profileForm.role}</span>
                                {profileForm.skills.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-1">
                                        {profileForm.skills.map(s => (
                                            <span key={s} className="text-[8px] font-mono px-1.5 py-0.5 bg-[#f7f6f3] text-[#9b9a97]">{s}</span>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div className="col-span-2 p-5 md:p-6 bg-white flex flex-col gap-2 min-h-[100px]">
                                <span className="text-[9px] font-mono uppercase tracking-[0.15em] text-[#9b9a97]">Showcase</span>
                                {showcaseForm.title ? (
                                    <>
                                        <span className="text-sm font-serif text-[#37352f]">{showcaseForm.title}</span>
                                        <span className="text-[11px] font-mono text-[#9b9a97]">{showcaseForm.url}</span>
                                    </>
                                ) : (
                                    <span className="text-[11px] font-mono text-[#9b9a97] italic">Skipped — add anytime in Manager</span>
                                )}
                            </div>
                            {/* Signature */}
                            <div className="col-span-2 md:col-span-2 p-6 bg-white flex items-center">
                                <div className="flex items-center gap-4">
                                    <div className="w-8 h-px bg-[#D80018]/30" />
                                    <span className="text-sm font-serif italic text-[#37352f]">vibecoder.dev</span>
                                </div>
                            </div>
                            <div className="col-span-2 md:col-span-2 p-4 bg-[#f7f6f3] flex items-center justify-end gap-3">
                                <button onClick={() => router.push('/manager')} className="text-[11px] font-mono text-[#9b9a97] hover:text-[#37352f] transition-colors">
                                    Go to Manager
                                </button>
                                <button onClick={() => router.push(`/m/${username}`)}
                                    className="px-6 py-2 bg-[#242423] text-white text-[11px] font-mono uppercase tracking-[0.1em] hover:bg-[#37352f] transition-colors">
                                    View Profile \u2192
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </section>
            <Footer />
        </PageShell>
    );
}
