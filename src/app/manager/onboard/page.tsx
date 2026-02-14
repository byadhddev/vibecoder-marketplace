'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { PageShell } from '@/components/layout/PageShell';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { GRID_CLASSES, ACCENTS } from '@/lib/vibe';

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

    // Pre-fill from session
    useEffect(() => {
        if (session?.user?.name && !profileForm.name) {
            setProfileForm(prev => ({ ...prev, name: session.user?.name || '' }));
        }
    }, [session]); // eslint-disable-line react-hooks/exhaustive-deps

    const username = session ? ((session.user as { username?: string }).username || '') : '';

    const addSkill = (skill: string) => {
        const s = skill.trim();
        if (s && !profileForm.skills.includes(s)) {
            setProfileForm(prev => ({ ...prev, skills: [...prev.skills, s], skillInput: '' }));
        }
    };

    const addTag = (tag: string) => {
        const t = tag.trim();
        if (t && !showcaseForm.tags.includes(t)) {
            setShowcaseForm(prev => ({ ...prev, tags: [...prev.tags, t], tagInput: '' }));
        }
    };

    const toggleAiTool = (tool: string) => {
        setShowcaseForm(prev => ({
            ...prev,
            ai_tools: prev.ai_tools.includes(tool)
                ? prev.ai_tools.filter(t => t !== tool)
                : [...prev.ai_tools, tool],
        }));
    };

    const saveProfile = async () => {
        setSaving(true);
        try {
            await fetch('/api/marketplace/profile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: profileForm.name,
                    role: profileForm.role,
                    skills: profileForm.skills,
                }),
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
                    title: showcaseForm.title,
                    description: showcaseForm.description,
                    url: showcaseForm.url,
                    build_hours: showcaseForm.build_hours ? parseInt(showcaseForm.build_hours) : 0,
                    ai_tools: showcaseForm.ai_tools,
                    tags: showcaseForm.tags,
                    status: 'published',
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

    const handlePublish = () => {
        router.push(`/m/${username}`);
    };

    if (status === 'loading') return null;

    const steps = [
        { num: 1, label: 'Profile' },
        { num: 2, label: 'Showcase' },
        { num: 3, label: 'Rate' },
        { num: 4, label: 'Publish' },
    ];

    return (
        <PageShell>
            <Header />
            <section>
                <div className={GRID_CLASSES}>
                    {/* Progress bar */}
                    <div className="col-span-2 md:col-span-4 p-4 bg-[#242423] flex items-center justify-center gap-6">
                        {steps.map(s => (
                            <div key={s.num} className="flex items-center gap-2">
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-mono transition-all ${
                                    step >= s.num ? 'bg-brand-red text-white' : 'bg-white/10 text-white/40'
                                }`}>
                                    {step > s.num ? '✓' : s.num}
                                </div>
                                <span className={`text-[9px] font-mono uppercase tracking-[0.15em] hidden sm:inline ${
                                    step >= s.num ? 'text-white' : 'text-white/30'
                                }`}>{s.label}</span>
                                {s.num < 4 && <div className={`w-8 h-px ${step > s.num ? 'bg-brand-red' : 'bg-white/10'}`} />}
                            </div>
                        ))}
                    </div>

                    {/* Step 1: Profile basics */}
                    {step === 1 && (
                        <>
                            <div className="col-span-2 md:col-span-2 p-6 md:p-8 flex flex-col gap-1 min-h-[100px]" style={{ background: `radial-gradient(circle at center, ${ACCENTS[0]}15 0%, white 70%)` }}>
                                <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-[#9b9a97]">Step 1 of 4</span>
                                <span className="text-lg font-serif text-[#37352f]">Tell us about yourself</span>
                                <span className="text-[11px] font-mono text-[#9b9a97] mt-1">This shows on your public profile</span>
                            </div>
                            <div className="col-span-2 md:col-span-2 p-6 flex flex-col gap-4 bg-white">
                                <div>
                                    <label className="text-[9px] font-mono uppercase tracking-[0.15em] text-[#9b9a97] block mb-1">Name</label>
                                    <input value={profileForm.name} onChange={e => setProfileForm(p => ({ ...p, name: e.target.value }))}
                                        className="w-full px-3 py-2 border border-[#ededeb] rounded-md text-sm font-mono text-[#37352f] outline-none focus:border-brand-red/40" placeholder="Your display name" />
                                </div>
                                <div>
                                    <label className="text-[9px] font-mono uppercase tracking-[0.15em] text-[#9b9a97] block mb-1">Role</label>
                                    <input value={profileForm.role} onChange={e => setProfileForm(p => ({ ...p, role: e.target.value }))}
                                        className="w-full px-3 py-2 border border-[#ededeb] rounded-md text-sm font-mono text-[#37352f] outline-none focus:border-brand-red/40" placeholder="e.g. Full-Stack Vibe Coder" />
                                </div>
                                <div>
                                    <label className="text-[9px] font-mono uppercase tracking-[0.15em] text-[#9b9a97] block mb-1">Skills</label>
                                    <div className="flex flex-wrap gap-1 mb-2">
                                        {profileForm.skills.map(s => (
                                            <span key={s} className="text-[9px] font-mono px-2 py-1 bg-[#f7f6f3] text-[#37352f] rounded-sm flex items-center gap-1">
                                                {s}
                                                <button onClick={() => setProfileForm(p => ({ ...p, skills: p.skills.filter(x => x !== s) }))} className="text-[#9b9a97] hover:text-brand-red">×</button>
                                            </span>
                                        ))}
                                    </div>
                                    <input value={profileForm.skillInput}
                                        onChange={e => setProfileForm(p => ({ ...p, skillInput: e.target.value }))}
                                        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSkill(profileForm.skillInput); } }}
                                        className="w-full px-3 py-2 border border-[#ededeb] rounded-md text-sm font-mono text-[#37352f] outline-none focus:border-brand-red/40" placeholder="Type and press Enter" />
                                    <div className="flex flex-wrap gap-1 mt-2">
                                        {SKILL_SUGGESTIONS.filter(s => !profileForm.skills.includes(s)).slice(0, 8).map(s => (
                                            <button key={s} onClick={() => addSkill(s)}
                                                className="text-[8px] font-mono px-1.5 py-0.5 rounded-sm bg-[#f7f6f3] text-[#9b9a97] hover:text-[#37352f] hover:bg-[#ededeb] transition-colors">+ {s}</button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="col-span-2 md:col-span-4 p-4 flex justify-end bg-[#f7f6f3]">
                                <button onClick={saveProfile} disabled={saving || !profileForm.name}
                                    className="px-6 py-2.5 bg-brand-red text-white text-sm font-medium rounded-lg hover:bg-[#b50014] transition-colors disabled:opacity-50">
                                    {saving ? 'Saving...' : 'Next → First Showcase'}
                                </button>
                            </div>
                        </>
                    )}

                    {/* Step 2: First showcase */}
                    {step === 2 && (
                        <>
                            <div className="col-span-2 md:col-span-2 p-6 md:p-8 flex flex-col gap-1 min-h-[100px]" style={{ background: `radial-gradient(circle at center, ${ACCENTS[1]}15 0%, white 70%)` }}>
                                <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-[#9b9a97]">Step 2 of 4</span>
                                <span className="text-lg font-serif text-[#37352f]">Your first showcase</span>
                                <span className="text-[11px] font-mono text-[#9b9a97] mt-1">Show what you&apos;ve built — a live project or demo</span>
                            </div>
                            <div className="col-span-2 md:col-span-2 p-6 flex flex-col gap-4 bg-white">
                                <div>
                                    <label className="text-[9px] font-mono uppercase tracking-[0.15em] text-[#9b9a97] block mb-1">Project Title</label>
                                    <input value={showcaseForm.title} onChange={e => setShowcaseForm(p => ({ ...p, title: e.target.value }))}
                                        className="w-full px-3 py-2 border border-[#ededeb] rounded-md text-sm font-mono text-[#37352f] outline-none focus:border-brand-red/40" placeholder="e.g. AI Dashboard MVP" />
                                </div>
                                <div>
                                    <label className="text-[9px] font-mono uppercase tracking-[0.15em] text-[#9b9a97] block mb-1">Description</label>
                                    <textarea value={showcaseForm.description} onChange={e => setShowcaseForm(p => ({ ...p, description: e.target.value }))} rows={2}
                                        className="w-full px-3 py-2 border border-[#ededeb] rounded-md text-sm font-mono text-[#37352f] outline-none focus:border-brand-red/40 resize-none" placeholder="What does it do? Who is it for?" />
                                </div>
                                <div>
                                    <label className="text-[9px] font-mono uppercase tracking-[0.15em] text-[#9b9a97] block mb-1">Live URL</label>
                                    <input value={showcaseForm.url} onChange={e => setShowcaseForm(p => ({ ...p, url: e.target.value }))}
                                        className="w-full px-3 py-2 border border-[#ededeb] rounded-md text-sm font-mono text-[#37352f] outline-none focus:border-brand-red/40" placeholder="https://..." />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-[9px] font-mono uppercase tracking-[0.15em] text-[#9b9a97] block mb-1">Build Time (hours)</label>
                                        <input type="number" value={showcaseForm.build_hours} onChange={e => setShowcaseForm(p => ({ ...p, build_hours: e.target.value }))}
                                            className="w-full px-3 py-2 border border-[#ededeb] rounded-md text-sm font-mono text-[#37352f] outline-none focus:border-brand-red/40" placeholder="e.g. 6" />
                                    </div>
                                    <div>
                                        <label className="text-[9px] font-mono uppercase tracking-[0.15em] text-[#9b9a97] block mb-1">Tags</label>
                                        <input value={showcaseForm.tagInput}
                                            onChange={e => setShowcaseForm(p => ({ ...p, tagInput: e.target.value }))}
                                            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag(showcaseForm.tagInput); } }}
                                            className="w-full px-3 py-2 border border-[#ededeb] rounded-md text-sm font-mono text-[#37352f] outline-none focus:border-brand-red/40" placeholder="Press Enter" />
                                    </div>
                                </div>
                                {showcaseForm.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-1">
                                        {showcaseForm.tags.map(t => (
                                            <span key={t} className="text-[9px] font-mono px-2 py-1 bg-[#f7f6f3] text-[#37352f] rounded-sm flex items-center gap-1">
                                                {t}
                                                <button onClick={() => setShowcaseForm(p => ({ ...p, tags: p.tags.filter(x => x !== t) }))} className="text-[#9b9a97] hover:text-brand-red">×</button>
                                            </span>
                                        ))}
                                    </div>
                                )}
                                <div>
                                    <label className="text-[9px] font-mono uppercase tracking-[0.15em] text-[#9b9a97] block mb-1">AI Tools Used</label>
                                    <div className="flex flex-wrap gap-1">
                                        {AI_TOOL_SUGGESTIONS.map(tool => (
                                            <button key={tool} onClick={() => toggleAiTool(tool)}
                                                className={`text-[9px] font-mono px-2 py-1 rounded-sm transition-colors ${
                                                    showcaseForm.ai_tools.includes(tool) ? 'bg-brand-red text-white' : 'bg-[#f7f6f3] text-[#9b9a97] hover:text-[#37352f]'
                                                }`}>{tool}</button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="col-span-2 md:col-span-4 p-4 flex justify-between bg-[#f7f6f3]">
                                <button onClick={() => setStep(1)} className="px-4 py-2 text-sm font-mono text-[#9b9a97] hover:text-[#37352f] transition-colors">← Back</button>
                                <div className="flex gap-3">
                                    <button onClick={() => setStep(3)} className="px-4 py-2 text-sm font-mono text-[#9b9a97] hover:text-[#37352f] transition-colors">Skip</button>
                                    <button onClick={saveShowcase} disabled={saving || !showcaseForm.title || !showcaseForm.url}
                                        className="px-6 py-2.5 bg-brand-red text-white text-sm font-medium rounded-lg hover:bg-[#b50014] transition-colors disabled:opacity-50">
                                        {saving ? 'Saving...' : 'Next → Set Rate'}
                                    </button>
                                </div>
                            </div>
                        </>
                    )}

                    {/* Step 3: Set rate */}
                    {step === 3 && (
                        <>
                            <div className="col-span-2 md:col-span-2 p-6 md:p-8 flex flex-col gap-1 min-h-[100px]" style={{ background: `radial-gradient(circle at center, ${ACCENTS[2]}15 0%, white 70%)` }}>
                                <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-[#9b9a97]">Step 3 of 4</span>
                                <span className="text-lg font-serif text-[#37352f]">Set your rate</span>
                                <span className="text-[11px] font-mono text-[#9b9a97] mt-1">Let seekers know what you charge</span>
                            </div>
                            <div className="col-span-2 md:col-span-2 p-6 flex flex-col gap-4 bg-white">
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => setRateForm(p => ({ ...p, available_for_hire: !p.available_for_hire }))}
                                        className={`w-10 h-5 rounded-full transition-colors relative ${rateForm.available_for_hire ? 'bg-brand-red' : 'bg-[#ededeb]'}`}>
                                        <div className={`w-4 h-4 rounded-full bg-white shadow absolute top-0.5 transition-all ${rateForm.available_for_hire ? 'left-5' : 'left-0.5'}`} />
                                    </button>
                                    <span className="text-sm font-mono text-[#37352f]">Available for Hire</span>
                                </div>
                                <div>
                                    <label className="text-[9px] font-mono uppercase tracking-[0.15em] text-[#9b9a97] block mb-1">Rate (USD)</label>
                                    <input type="number" value={rateForm.hourly_rate} onChange={e => setRateForm(p => ({ ...p, hourly_rate: e.target.value }))}
                                        className="w-full px-3 py-2 border border-[#ededeb] rounded-md text-sm font-mono text-[#37352f] outline-none focus:border-brand-red/40" placeholder="e.g. 75" />
                                </div>
                                <div>
                                    <label className="text-[9px] font-mono uppercase tracking-[0.15em] text-[#9b9a97] block mb-1">Rate Type</label>
                                    <div className="flex gap-2">
                                        {(['hourly', 'project', 'negotiable'] as const).map(t => (
                                            <button key={t} onClick={() => setRateForm(p => ({ ...p, rate_type: t }))}
                                                className={`text-[10px] font-mono px-3 py-1.5 rounded-md transition-colors ${
                                                    rateForm.rate_type === t ? 'bg-[#242423] text-white' : 'bg-[#f7f6f3] text-[#9b9a97] hover:text-[#37352f]'
                                                }`}>{t}</button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="col-span-2 md:col-span-4 p-4 flex justify-between bg-[#f7f6f3]">
                                <button onClick={() => setStep(2)} className="px-4 py-2 text-sm font-mono text-[#9b9a97] hover:text-[#37352f] transition-colors">← Back</button>
                                <button onClick={saveRate} disabled={saving}
                                    className="px-6 py-2.5 bg-brand-red text-white text-sm font-medium rounded-lg hover:bg-[#b50014] transition-colors disabled:opacity-50">
                                    {saving ? 'Saving...' : 'Next → Preview'}
                                </button>
                            </div>
                        </>
                    )}

                    {/* Step 4: Preview & publish */}
                    {step === 4 && (
                        <>
                            <div className="col-span-2 md:col-span-4 p-6 md:p-8 flex flex-col items-center gap-3 min-h-[200px] justify-center" style={{ background: `radial-gradient(circle at center, ${ACCENTS[3]}15 0%, white 70%)` }}>
                                <div className="w-16 h-16 bg-brand-red rounded-lg flex items-center justify-center mb-2">
                                    <span className="text-3xl">🚀</span>
                                </div>
                                <span className="text-xl font-serif text-[#37352f]">You&apos;re all set!</span>
                                <span className="text-[11px] font-mono text-[#9b9a97] text-center max-w-md">
                                    Your profile is live. Seekers can now find you, see your showcases, and send hire requests.
                                    You can always edit everything in the Manager.
                                </span>
                            </div>
                            <div className="col-span-2 p-5 md:p-6 bg-white flex flex-col gap-2 min-h-[100px]">
                                <span className="text-[9px] font-mono uppercase tracking-[0.15em] text-[#9b9a97]">Profile</span>
                                <span className="text-sm font-serif text-[#37352f]">{profileForm.name || username}</span>
                                <span className="text-[11px] font-mono text-[#9b9a97]">{profileForm.role}</span>
                                {profileForm.skills.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-1">
                                        {profileForm.skills.map(s => (
                                            <span key={s} className="text-[8px] font-mono px-1.5 py-0.5 rounded-sm bg-[#f7f6f3] text-[#9b9a97]">{s}</span>
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
                                    <span className="text-[11px] font-mono text-[#9b9a97] italic">Skipped — add one anytime in Manager</span>
                                )}
                            </div>
                            <div className="col-span-2 md:col-span-4 p-4 flex justify-center gap-4 bg-[#f7f6f3]">
                                <button onClick={() => router.push('/manager')} className="px-4 py-2 text-sm font-mono text-[#9b9a97] hover:text-[#37352f] transition-colors">
                                    Go to Manager
                                </button>
                                <button onClick={handlePublish}
                                    className="px-8 py-2.5 bg-brand-red text-white text-sm font-medium rounded-lg hover:bg-[#b50014] transition-colors">
                                    View My Profile →
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
