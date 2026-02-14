'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { PageShell } from '@/components/layout/PageShell';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import type { Showcase, Profile, ProfileInput } from '@/lib/db/types';
import {
    ACCENTS,
    vibeColor, vibeText, vibeRaw,
    GRID_CLASSES,
} from '@/lib/vibe';

type TileVariant = 'artode' | 'title' | 'counter' | 'form-url' | 'form-links' | 'form-details' | 'form-action' | 'form-speed' | 'profile-identity' | 'profile-bio' | 'profile-socials' | 'profile-skills' | 'profile-hire' | 'profile-save' | 'signature' | 'filler' | 'showcase' | 'empty' | 'nav' | 'stat-views' | 'stat-clicks' | 'stat-top' | 'request' | 'earn-form' | 'earn-total';

interface Tile {
    id: string;
    colSpan: string;
    variant: TileVariant;
    href?: string;
    showcase?: Showcase;
}

interface FormState {
    title: string;
    description: string;
    url: string;
    source_url: string;
    post_url: string;
    tags: string;
    status: 'published' | 'draft';
    build_hours: string;
    ai_tools: string;
}

const EMPTY_FORM: FormState = { title: '', description: '', url: '', source_url: '', post_url: '', tags: '', status: 'draft', build_hours: '', ai_tools: '' };

function buildProfileTiles(): Tile[] {
    return [
        { id: 'p-artode', colSpan: 'col-span-1', variant: 'artode' },
        { id: 'p-title', colSpan: 'col-span-2 md:col-span-2', variant: 'title' },
        { id: 'p-filler-top', colSpan: 'col-span-1', variant: 'filler' },
        { id: 'profile-identity', colSpan: 'col-span-2 md:col-span-2', variant: 'profile-identity' },
        { id: 'profile-bio', colSpan: 'col-span-2 md:col-span-2', variant: 'profile-bio' },
        { id: 'profile-socials', colSpan: 'col-span-2 md:col-span-2', variant: 'profile-socials' },
        { id: 'profile-skills', colSpan: 'col-span-2 md:col-span-2', variant: 'profile-skills' },
        { id: 'profile-hire', colSpan: 'col-span-2 md:col-span-2', variant: 'profile-hire' },
        { id: 'profile-save', colSpan: 'col-span-1', variant: 'profile-save' },
        { id: 'p-filler', colSpan: 'col-span-1', variant: 'filler' },
    ];
}

function buildFormTiles(): Tile[] {
    return [
        { id: 'f-counter', colSpan: 'col-span-1', variant: 'counter' },
        { id: 'form-url', colSpan: 'col-span-2 md:col-span-2', variant: 'form-url' },
        { id: 'f-filler-top', colSpan: 'col-span-1', variant: 'filler' },
        { id: 'form-links', colSpan: 'col-span-2 md:col-span-2', variant: 'form-links' },
        { id: 'form-details', colSpan: 'col-span-2 md:col-span-2', variant: 'form-details' },
        { id: 'form-speed', colSpan: 'col-span-2 md:col-span-2', variant: 'form-speed' },
        { id: 'form-action', colSpan: 'col-span-1', variant: 'form-action' },
        { id: 'f-filler', colSpan: 'col-span-1', variant: 'filler' },
    ];
}

function buildShowcaseTiles(showcases: Showcase[], username?: string): Tile[] {
    const tiles: Tile[] = [
        { id: 's-signature', colSpan: 'col-span-2 md:col-span-2', variant: 'signature' },
    ];
    if (username) tiles.push({ id: 'nav-public', colSpan: 'col-span-1', variant: 'nav', href: `/m/${username}` });

    const showcaseTiles: Tile[] = showcases.map(s => ({
        id: s.id, colSpan: 'col-span-2 md:col-span-2', variant: 'showcase' as const, showcase: s,
    }));
    if (showcases.length === 0) showcaseTiles.push({ id: 'empty', colSpan: 'col-span-2 md:col-span-2', variant: 'empty' });

    return [...tiles, ...showcaseTiles];
}

function buildStatsTiles(showcases: Showcase[], totalViews: number): Tile[] {
    return [
        { id: 'stat-views', colSpan: 'col-span-1', variant: 'stat-views' },
        { id: 'stat-clicks', colSpan: 'col-span-1', variant: 'stat-clicks' },
        { id: 'stat-top', colSpan: 'col-span-2 md:col-span-2', variant: 'stat-top' },
    ];
}

function buildRequestTiles(requests: { id: string; name: string; email: string; description: string; budget: string; timeline: string; status: string; created_at: string; }[]): Tile[] {
    const active = requests.filter(r => r.status !== 'archived');
    if (active.length === 0) return [];
    return [
        { id: 'req-artode', colSpan: 'col-span-1', variant: 'artode' },
        ...active.map(r => ({ id: `req-${r.id}`, colSpan: 'col-span-2 md:col-span-2' as const, variant: 'request' as const })),
        { id: 'req-filler', colSpan: 'col-span-1', variant: 'filler' },
    ];
}

function buildEarningsTiles(earnings: { id: string; amount: number; }[], totalEarned: number): Tile[] {
    return [
        { id: 'earn-total', colSpan: 'col-span-1', variant: 'earn-total' },
        { id: 'earn-form', colSpan: 'col-span-2 md:col-span-2', variant: 'earn-form' },
        { id: 'earn-filler', colSpan: 'col-span-1', variant: 'filler' },
    ];
}

export default function ManagerPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [showcases, setShowcases] = useState<Showcase[]>([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState<string | null>(null);
    const [form, setForm] = useState<FormState>(EMPTY_FORM);
    const [saving, setSaving] = useState(false);
    const [fetchingOG, setFetchingOG] = useState(false);
    const [vibeLocked, setVibeLocked] = useState(false);
    const [hovered, setHovered] = useState(false);
    const isVibe = vibeLocked || hovered;
    const toggleVibe = useCallback(() => setVibeLocked(v => !v), []);
    const [username, setUsername] = useState<string | undefined>(undefined);
    // Profile state
    const [profile, setProfile] = useState<ProfileInput>({ name: '', role: '', bio: '', website: '', location: '', social_links: {}, skills: [], available_for_hire: false, hourly_rate: 0, rate_type: 'negotiable' });
    const [totalViews, setTotalViews] = useState(0);
    const [savingProfile, setSavingProfile] = useState(false);
    const [profileDirty, setProfileDirty] = useState(false);
    // Requests & Earnings
    interface ContactReq { id: string; name: string; email: string; description: string; budget: string; timeline: string; status: string; created_at: string; }
    interface EarningEntry { id: string; amount: number; currency: string; client_name: string; showcase_id: string; note: string; created_at: string; }
    const [requests, setRequests] = useState<ContactReq[]>([]);
    const [earnings, setEarnings] = useState<EarningEntry[]>([]);
    const [totalEarned, setTotalEarned] = useState(0);
    const [earnForm, setEarnForm] = useState({ amount: '', client_name: '', showcase_id: '', note: '' });
    const [savingEarning, setSavingEarning] = useState(false);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login');
        }
    }, [status, router]);

    useEffect(() => {
        if (status !== 'authenticated') return;
        // Fetch showcases
        fetch('/api/marketplace/showcases')
            .then(r => r.ok ? r.json() : { showcases: [] })
            .then(d => {
                setShowcases(d.showcases || []);
                if (d.username) setUsername(d.username);
            })
            .catch(() => {})
            .finally(() => setLoading(false));
        // Fetch profile
        fetch('/api/marketplace/profile')
            .then(r => r.ok ? r.json() : null)
            .then(d => {
                if (d?.profile) {
                    setProfile({
                        name: d.profile.name || '',
                        role: d.profile.role || '',
                        bio: d.profile.bio || '',
                        website: d.profile.website || '',
                        location: d.profile.location || '',
                        social_links: d.profile.social_links || {},
                        skills: d.profile.skills || [],
                        available_for_hire: d.profile.available_for_hire || false,
                        hourly_rate: d.profile.hourly_rate || 0,
                        rate_type: d.profile.rate_type || 'negotiable',
                    });
                    setTotalViews(d.profile.total_views || 0);
                }
            })
            .catch(() => {});
        // Fetch requests
        fetch('/api/marketplace/contact')
            .then(r => r.ok ? r.json() : { requests: [] })
            .then(d => setRequests(d.requests || []))
            .catch(() => {});
        // Fetch earnings
        fetch('/api/marketplace/earnings')
            .then(r => r.ok ? r.json() : { earnings: [], total: 0 })
            .then(d => { setEarnings(d.earnings || []); setTotalEarned(d.total || 0); })
            .catch(() => {});
    }, [status]);

    const handleArchiveRequest = async (id: string) => {
        await fetch('/api/marketplace/contact', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ request_id: id, status: 'archived' }) });
        setRequests(prev => prev.filter(r => r.id !== id));
    };
    const handleLogEarning = async () => {
        if (!earnForm.amount) return;
        setSavingEarning(true);
        try {
            const res = await fetch('/api/marketplace/earnings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...earnForm, amount: parseFloat(earnForm.amount) }) });
            if (res.ok) {
                const d = await res.json();
                setEarnings(prev => [d.earning, ...prev]);
                setTotalEarned(prev => prev + parseFloat(earnForm.amount));
                setEarnForm({ amount: '', client_name: '', showcase_id: '', note: '' });
            }
        } catch {}
        setSavingEarning(false);
    };

    const fetchOG = async (url: string) => {
        if (!url) return;
        setFetchingOG(true);
        try {
            const res = await fetch('/api/marketplace/og', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url }) });
            if (res.ok) { const d = await res.json(); setForm(prev => ({ ...prev, title: prev.title || d.title || '', description: prev.description || d.description || '' })); }
        } catch {}
        setFetchingOG(false);
    };

    const handleSave = async () => {
        setSaving(true);
        const body = { ...(editing ? { id: editing } : {}), title: form.title, description: form.description, url: form.url, source_url: form.source_url, post_url: form.post_url, tags: form.tags.split(',').map(t => t.trim()).filter(Boolean), status: form.status, build_hours: form.build_hours ? parseFloat(form.build_hours) : 0, ai_tools: form.ai_tools.split(',').map(t => t.trim()).filter(Boolean) };
        const method = editing ? 'PUT' : 'POST';
        const res = await fetch('/api/marketplace/showcases', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
        if (res.ok) {
            const data = await res.json();
            if (editing) setShowcases(prev => prev.map(s => s.id === editing ? data.showcase : s));
            else setShowcases(prev => [...prev, data.showcase]);
            setForm(EMPTY_FORM); setEditing(null);
        }
        setSaving(false);
    };

    const handleDelete = async (id: string) => {
        const res = await fetch(`/api/marketplace/showcases?id=${id}`, { method: 'DELETE' });
        if (res.ok) setShowcases(prev => prev.filter(s => s.id !== id));
    };

    const startEdit = (s: Showcase) => {
        setEditing(s.id);
        setForm({ title: s.title, description: s.description, url: s.url, source_url: s.source_url || '', post_url: s.post_url || '', tags: s.tags.join(', '), status: s.status === 'archived' ? 'draft' : s.status, build_hours: s.build_hours ? String(s.build_hours) : '', ai_tools: (s.ai_tools || []).join(', ') });
    };

    const handleSaveProfile = async () => {
        setSavingProfile(true);
        const res = await fetch('/api/marketplace/profile', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(profile) });
        if (res.ok) setProfileDirty(false);
        setSavingProfile(false);
    };

    const updateProfile = (field: string, value: string) => {
        setProfile(prev => ({ ...prev, [field]: value }));
        setProfileDirty(true);
    };

    const updateSocial = (key: string, value: string) => {
        setProfile(prev => ({ ...prev, social_links: { ...prev.social_links, [key]: value } }));
        setProfileDirty(true);
    };

    const breadcrumbs = (
        <div className="flex items-center gap-2 text-[#9b9a97]">
            <Link href="/" className="flex items-center gap-2 hover:text-[#37352f] transition-colors font-medium">
                <div className="w-3 h-3 bg-brand-red rounded-[2px]" />
                <span>VibeCoder</span>
            </Link>
            <span className="text-[#d5d5d3]">/</span>
            <span className="text-[#37352f] font-medium">manager</span>
        </div>
    );

    function renderTile(tile: Tile, index: number) {
        const vt = vibeText(index);
        const bg = isVibe ? vibeColor(index) : 'white';

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
                    <div className={`${tile.colSpan} p-6 md:p-8 flex flex-col justify-center min-h-[120px] transition-all duration-300`} style={{ background: isVibe ? vibeColor(index) : '#242423' }}>
                        <span className={`text-[9px] font-mono uppercase tracking-[0.2em] mb-3 transition-colors duration-300 ${isVibe ? vt + ' opacity-60' : 'text-white/40'}`}>Manager</span>
                        <span className={`text-lg md:text-xl font-serif leading-tight transition-colors duration-300 ${isVibe ? vt : 'text-white'}`}>Your Showcases</span>
                    </div>
                );
            case 'counter':
                return (
                    <div className={`${tile.colSpan} flex flex-col items-center justify-center p-6 min-h-[120px] transition-all duration-300`} style={{ background: bg }}>
                        <span className={`text-3xl font-bold font-mono transition-colors duration-300 ${isVibe ? vt : 'text-[#37352f]'}`}>{showcases.length}</span>
                        <span className="text-[9px] font-mono text-[#9b9a97] uppercase tracking-[0.2em] mt-1">Total</span>
                    </div>
                );
            case 'signature':
                return (
                    <div className={`${tile.colSpan} p-6 md:p-8 flex items-center min-h-[80px] transition-all duration-300`} style={{ background: bg }}>
                        <div className="flex items-center gap-4">
                            <div className="w-8 h-px transition-colors duration-300" style={{ backgroundColor: isVibe ? vibeRaw(index) : 'rgba(216,0,24,0.3)' }} />
                            <span className={`text-sm font-serif italic transition-colors duration-300 ${isVibe ? vt : 'text-[#37352f]'}`}>
                                {username ? `vibecoder.dev/m/${username}` : 'Your marketplace'}
                            </span>
                        </div>
                    </div>
                );
            case 'profile-identity':
                return (
                    <div className={`${tile.colSpan} p-5 md:p-6 flex flex-col justify-between min-h-[140px] md:min-h-[160px] transition-all duration-300`} style={{ background: bg }}>
                        <div className="flex items-center gap-3">
                            <span className="text-[10px] font-mono transition-colors duration-300" style={{ color: isVibe ? vibeRaw(index) : ACCENTS[4] }}>Profile</span>
                            <div className="flex-1 h-px transition-colors duration-300" style={{ backgroundColor: isVibe ? `${vibeRaw(index)}4D` : `${ACCENTS[4]}20` }} />
                        </div>
                        <div className="space-y-2">
                            <input type="text" placeholder="Your name" value={profile.name}
                                onChange={e => updateProfile('name', e.target.value)}
                                className="w-full bg-transparent border-b border-[#ededeb] focus:border-[#37352f] text-sm font-serif text-[#37352f] placeholder:text-[#9b9a97] outline-none pb-1 transition-colors" />
                            <input type="text" placeholder="Role (e.g. Frontend Engineer)" value={profile.role}
                                onChange={e => updateProfile('role', e.target.value)}
                                className="w-full bg-transparent border-b border-[#ededeb] focus:border-[#37352f] text-[12px] font-mono text-[#37352f] placeholder:text-[#9b9a97] outline-none pb-1 transition-colors" />
                            <input type="text" placeholder="Location" value={profile.location}
                                onChange={e => updateProfile('location', e.target.value)}
                                className="w-full bg-transparent border-b border-[#ededeb] focus:border-[#37352f] text-[12px] font-mono text-[#37352f] placeholder:text-[#9b9a97] outline-none pb-1 transition-colors" />
                        </div>
                    </div>
                );
            case 'profile-bio':
                return (
                    <div className={`${tile.colSpan} p-5 md:p-6 flex flex-col justify-between min-h-[140px] md:min-h-[160px] transition-all duration-300`} style={{ background: bg }}>
                        <div className="flex items-center gap-3">
                            <span className="text-[10px] font-mono transition-colors duration-300" style={{ color: isVibe ? vibeRaw(index) : ACCENTS[5] }}>About</span>
                            <div className="flex-1 h-px transition-colors duration-300" style={{ backgroundColor: isVibe ? `${vibeRaw(index)}4D` : `${ACCENTS[5]}20` }} />
                        </div>
                        <div className="space-y-2">
                            <textarea placeholder="Bio — tell the world what you build" value={profile.bio}
                                onChange={e => updateProfile('bio', e.target.value)} rows={3}
                                className="w-full bg-transparent border-b border-[#ededeb] focus:border-[#37352f] text-[12px] font-serif text-[#37352f] placeholder:text-[#9b9a97] outline-none pb-1 transition-colors resize-none" />
                            <input type="url" placeholder="Website URL" value={profile.website}
                                onChange={e => updateProfile('website', e.target.value)}
                                className="w-full bg-transparent border-b border-[#ededeb] focus:border-[#37352f] text-[12px] font-mono text-[#37352f] placeholder:text-[#9b9a97] outline-none pb-1 transition-colors" />
                        </div>
                    </div>
                );
            case 'profile-socials':
                return (
                    <div className={`${tile.colSpan} p-5 md:p-6 flex flex-col justify-between min-h-[140px] md:min-h-[160px] transition-all duration-300`} style={{ background: bg }}>
                        <div className="flex items-center gap-3">
                            <span className="text-[10px] font-mono transition-colors duration-300" style={{ color: isVibe ? vibeRaw(index) : ACCENTS[6] }}>Socials</span>
                            <div className="flex-1 h-px transition-colors duration-300" style={{ backgroundColor: isVibe ? `${vibeRaw(index)}4D` : `${ACCENTS[6]}20` }} />
                        </div>
                        <div className="space-y-2">
                            <input type="text" placeholder="GitHub username" value={profile.social_links?.github || ''}
                                onChange={e => updateSocial('github', e.target.value)}
                                className="w-full bg-transparent border-b border-[#ededeb] focus:border-[#37352f] text-[12px] font-mono text-[#37352f] placeholder:text-[#9b9a97] outline-none pb-1 transition-colors" />
                            <input type="text" placeholder="Twitter / X handle" value={profile.social_links?.twitter || ''}
                                onChange={e => updateSocial('twitter', e.target.value)}
                                className="w-full bg-transparent border-b border-[#ededeb] focus:border-[#37352f] text-[12px] font-mono text-[#37352f] placeholder:text-[#9b9a97] outline-none pb-1 transition-colors" />
                            <input type="text" placeholder="LinkedIn username" value={profile.social_links?.linkedin || ''}
                                onChange={e => updateSocial('linkedin', e.target.value)}
                                className="w-full bg-transparent border-b border-[#ededeb] focus:border-[#37352f] text-[12px] font-mono text-[#37352f] placeholder:text-[#9b9a97] outline-none pb-1 transition-colors" />
                        </div>
                    </div>
                );
            case 'profile-skills':
                return (
                    <div className={`${tile.colSpan} p-5 md:p-6 flex flex-col justify-between min-h-[140px] md:min-h-[160px] transition-all duration-300`} style={{ background: bg }}>
                        <div className="flex items-center gap-3">
                            <span className="text-[10px] font-mono transition-colors duration-300" style={{ color: isVibe ? vibeRaw(index) : ACCENTS[7 % ACCENTS.length] }}>Stack</span>
                            <div className="flex-1 h-px transition-colors duration-300" style={{ backgroundColor: isVibe ? `${vibeRaw(index)}4D` : `${ACCENTS[7 % ACCENTS.length]}20` }} />
                        </div>
                        <div className="space-y-2">
                            <input type="text" placeholder="Skills (comma-separated: React, Next.js, Python…)" value={(profile.skills || []).join(', ')}
                                onChange={e => { setProfile(prev => ({ ...prev, skills: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })); setProfileDirty(true); }}
                                className="w-full bg-transparent border-b border-[#ededeb] focus:border-[#37352f] text-[12px] font-mono text-[#37352f] placeholder:text-[#9b9a97] outline-none pb-1 transition-colors" />
                            {(profile.skills || []).length > 0 && (
                                <div className="flex flex-wrap gap-1.5 mt-1">
                                    {(profile.skills || []).map(s => (
                                        <span key={s} className="text-[9px] font-mono uppercase tracking-wider text-[#9b9a97] bg-[#f0f0f0] px-1.5 py-0.5 rounded">{s}</span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                );
            case 'profile-hire':
                return (
                    <div className={`${tile.colSpan} p-5 md:p-6 flex flex-col justify-between min-h-[140px] md:min-h-[160px] transition-all duration-300`} style={{ background: bg }}>
                        <div className="flex items-center gap-3">
                            <span className="text-[10px] font-mono transition-colors duration-300" style={{ color: isVibe ? vibeRaw(index) : ACCENTS[0] }}>Hire</span>
                            <div className="flex-1 h-px transition-colors duration-300" style={{ backgroundColor: isVibe ? `${vibeRaw(index)}4D` : `${ACCENTS[0]}20` }} />
                        </div>
                        <div className="space-y-3">
                            <label className="flex items-center gap-3 cursor-pointer">
                                <div
                                    onClick={() => { setProfile(prev => ({ ...prev, available_for_hire: !prev.available_for_hire })); setProfileDirty(true); }}
                                    className={`w-8 h-4 rounded-full transition-colors duration-200 relative cursor-pointer ${profile.available_for_hire ? 'bg-brand-red' : 'bg-[#ededeb]'}`}
                                >
                                    <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white shadow transition-transform duration-200 ${profile.available_for_hire ? 'translate-x-4' : 'translate-x-0.5'}`} />
                                </div>
                                <span className={`text-[11px] font-mono ${profile.available_for_hire ? 'text-brand-red font-medium' : 'text-[#9b9a97]'}`}>
                                    {profile.available_for_hire ? 'Available for Hire' : 'Not Available'}
                                </span>
                            </label>
                            <div className="flex items-center gap-3">
                                <input type="number" placeholder="Rate" value={profile.hourly_rate || ''}
                                    onChange={e => { setProfile(prev => ({ ...prev, hourly_rate: parseFloat(e.target.value) || 0 })); setProfileDirty(true); }}
                                    className="w-20 bg-transparent border-b border-[#ededeb] focus:border-[#37352f] text-[12px] font-mono text-[#37352f] placeholder:text-[#9b9a97] outline-none pb-1 transition-colors" />
                                <span className="text-[10px] font-mono text-[#9b9a97]">$</span>
                                <select value={profile.rate_type || 'negotiable'}
                                    onChange={e => { setProfile(prev => ({ ...prev, rate_type: e.target.value as 'hourly' | 'project' | 'negotiable' })); setProfileDirty(true); }}
                                    className="bg-transparent border-b border-[#ededeb] focus:border-[#37352f] text-[12px] font-mono text-[#37352f] outline-none pb-1 transition-colors">
                                    <option value="hourly">/hour</option>
                                    <option value="project">/project</option>
                                    <option value="negotiable">negotiable</option>
                                </select>
                            </div>
                        </div>
                    </div>
                );
            case 'profile-save':
                return (
                    <div className={`${tile.colSpan} flex flex-col items-center justify-center p-6 min-h-[120px] transition-all duration-300`} style={{ background: bg }}>
                        <button onClick={handleSaveProfile} disabled={savingProfile || !profileDirty}
                            className={`text-[9px] font-mono uppercase tracking-[0.2em] transition-colors duration-300 disabled:opacity-30 ${isVibe ? vt : 'text-[#37352f] hover:text-brand-red'}`}>
                            {savingProfile ? 'Saving…' : profileDirty ? 'Save Profile ↑' : 'Saved ✓'}
                        </button>
                    </div>
                );
            case 'form-url':
                return (
                    <div className={`${tile.colSpan} p-5 md:p-6 flex flex-col justify-between min-h-[140px] md:min-h-[160px] transition-all duration-300`} style={{ background: bg }}>
                        <div className="flex items-center gap-3">
                            <span className="text-[10px] font-mono transition-colors duration-300" style={{ color: isVibe ? vibeRaw(index) : ACCENTS[0] }}>{editing ? 'Ed' : 'New'}</span>
                            <div className="flex-1 h-px transition-colors duration-300" style={{ backgroundColor: isVibe ? `${vibeRaw(index)}4D` : `${ACCENTS[0]}20` }} />
                            {fetchingOG && <span className="text-[8px] font-mono text-[#9b9a97] uppercase tracking-wider animate-pulse">Fetching…</span>}
                        </div>
                        <div className="space-y-2">
                            <input type="url" placeholder="Paste URL (GitHub, CodeSandbox, etc.)" value={form.url}
                                onChange={e => setForm(prev => ({ ...prev, url: e.target.value }))} onBlur={() => fetchOG(form.url)}
                                className="w-full bg-transparent border-b border-[#ededeb] focus:border-[#37352f] text-sm font-serif text-[#37352f] placeholder:text-[#9b9a97] placeholder:font-serif outline-none pb-1 transition-colors" />
                            <input type="text" placeholder="Title" value={form.title}
                                onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))}
                                className="w-full bg-transparent border-b border-[#ededeb] focus:border-[#37352f] text-sm font-serif text-[#37352f] placeholder:text-[#9b9a97] placeholder:font-serif outline-none pb-1 transition-colors" />
                        </div>
                    </div>
                );
            case 'form-links':
                return (
                    <div className={`${tile.colSpan} p-5 md:p-6 flex flex-col justify-between min-h-[140px] md:min-h-[160px] transition-all duration-300`} style={{ background: bg }}>
                        <div className="flex items-center gap-3">
                            <span className="text-[10px] font-mono transition-colors duration-300" style={{ color: isVibe ? vibeRaw(index) : ACCENTS[2] }}>Links</span>
                            <div className="flex-1 h-px transition-colors duration-300" style={{ backgroundColor: isVibe ? `${vibeRaw(index)}4D` : `${ACCENTS[2]}20` }} />
                        </div>
                        <div className="space-y-2">
                            <input type="url" placeholder="Source code URL (GitHub, GitLab, etc.)" value={form.source_url}
                                onChange={e => setForm(prev => ({ ...prev, source_url: e.target.value }))}
                                className="w-full bg-transparent border-b border-[#ededeb] focus:border-[#37352f] text-[12px] font-mono text-[#37352f] placeholder:text-[#9b9a97] placeholder:font-mono outline-none pb-1 transition-colors" />
                            <input type="url" placeholder="Blog post / article URL" value={form.post_url}
                                onChange={e => setForm(prev => ({ ...prev, post_url: e.target.value }))}
                                className="w-full bg-transparent border-b border-[#ededeb] focus:border-[#37352f] text-[12px] font-mono text-[#37352f] placeholder:text-[#9b9a97] placeholder:font-mono outline-none pb-1 transition-colors" />
                        </div>
                    </div>
                );
            case 'form-details':
                return (
                    <div className={`${tile.colSpan} p-5 md:p-6 flex flex-col justify-between min-h-[140px] md:min-h-[160px] transition-all duration-300`} style={{ background: bg }}>
                        <div className="flex items-center gap-3">
                            <span className="text-[10px] font-mono transition-colors duration-300" style={{ color: isVibe ? vibeRaw(index) : ACCENTS[1] }}>Info</span>
                            <div className="flex-1 h-px transition-colors duration-300" style={{ backgroundColor: isVibe ? `${vibeRaw(index)}4D` : `${ACCENTS[1]}20` }} />
                        </div>
                        <div className="space-y-2">
                            <input type="text" placeholder="Description" value={form.description}
                                onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
                                className="w-full bg-transparent border-b border-[#ededeb] focus:border-[#37352f] text-[12px] font-serif text-[#37352f] placeholder:text-[#9b9a97] placeholder:font-serif outline-none pb-1 transition-colors" />
                            <input type="text" placeholder="Tags (comma-separated)" value={form.tags}
                                onChange={e => setForm(prev => ({ ...prev, tags: e.target.value }))}
                                className="w-full bg-transparent border-b border-[#ededeb] focus:border-[#37352f] text-[12px] font-mono text-[#37352f] placeholder:text-[#9b9a97] placeholder:font-mono outline-none pb-1 transition-colors" />
                        </div>
                    </div>
                );
            case 'form-speed':
                return (
                    <div className={`${tile.colSpan} p-5 md:p-6 flex flex-col justify-between min-h-[140px] md:min-h-[160px] transition-all duration-300`} style={{ background: bg }}>
                        <div className="flex items-center gap-3">
                            <span className="text-[10px] font-mono transition-colors duration-300" style={{ color: isVibe ? vibeRaw(index) : ACCENTS[3] }}>Speed</span>
                            <div className="flex-1 h-px transition-colors duration-300" style={{ backgroundColor: isVibe ? `${vibeRaw(index)}4D` : `${ACCENTS[3]}20` }} />
                        </div>
                        <div className="space-y-2">
                            <input type="number" placeholder="Build time in hours (e.g. 6)" value={form.build_hours}
                                onChange={e => setForm(prev => ({ ...prev, build_hours: e.target.value }))}
                                className="w-full bg-transparent border-b border-[#ededeb] focus:border-[#37352f] text-[12px] font-mono text-[#37352f] placeholder:text-[#9b9a97] placeholder:font-mono outline-none pb-1 transition-colors" />
                            <input type="text" placeholder="AI tools (comma-separated: Cursor, Claude, Copilot…)" value={form.ai_tools}
                                onChange={e => setForm(prev => ({ ...prev, ai_tools: e.target.value }))}
                                className="w-full bg-transparent border-b border-[#ededeb] focus:border-[#37352f] text-[12px] font-mono text-[#37352f] placeholder:text-[#9b9a97] placeholder:font-mono outline-none pb-1 transition-colors" />
                        </div>
                    </div>
                );
            case 'form-action':
                return (
                    <div className={`${tile.colSpan} flex flex-col items-center justify-center p-6 min-h-[120px] transition-all duration-300`} style={{ background: bg }}>
                        <button onClick={() => setForm(prev => ({ ...prev, status: prev.status === 'published' ? 'draft' : 'published' }))}
                            className={`text-[10px] font-mono uppercase tracking-[0.3em] font-bold transition-colors duration-300 mb-3 ${isVibe ? vt : form.status === 'published' ? 'text-brand-red' : 'text-[#9b9a97]'}`}>
                            {form.status === 'published' ? 'Live' : 'Draft'}
                        </button>
                        <button onClick={handleSave} disabled={saving || !form.title || !form.url}
                            className={`text-[9px] font-mono uppercase tracking-[0.2em] transition-colors duration-300 disabled:opacity-30 ${isVibe ? vt : 'text-[#37352f] hover:text-brand-red'}`}>
                            {saving ? 'Saving…' : editing ? 'Update ↑' : 'Add ↑'}
                        </button>
                        {editing && (
                            <button onClick={() => { setEditing(null); setForm(EMPTY_FORM); }}
                                className="text-[9px] font-mono text-[#9b9a97] uppercase tracking-[0.2em] mt-2 hover:text-[#37352f] transition-colors">Cancel</button>
                        )}
                    </div>
                );
            case 'filler':
                return (
                    <div className={`${tile.colSpan} min-h-[120px] transition-all duration-300`} style={{ backgroundColor: isVibe ? `${vibeRaw(index)}1A` : '#f0f0ef' }} />
                );
            case 'stat-views':
                return (
                    <div className={`${tile.colSpan} flex flex-col items-center justify-center p-6 min-h-[120px] transition-all duration-300`} style={{ background: bg }}>
                        <span className={`text-3xl font-bold font-mono transition-colors duration-300 ${isVibe ? vt : 'text-[#37352f]'}`}>{totalViews}</span>
                        <span className="text-[9px] font-mono text-[#9b9a97] uppercase tracking-[0.2em] mt-1">Page Views</span>
                    </div>
                );
            case 'stat-clicks': {
                const totalClicks = showcases.reduce((sum, s) => sum + (s.clicks_count || 0), 0);
                return (
                    <div className={`${tile.colSpan} flex flex-col items-center justify-center p-6 min-h-[120px] transition-all duration-300`} style={{ background: bg }}>
                        <span className={`text-3xl font-bold font-mono transition-colors duration-300 ${isVibe ? vt : 'text-[#37352f]'}`}>{totalClicks}</span>
                        <span className="text-[9px] font-mono text-[#9b9a97] uppercase tracking-[0.2em] mt-1">Total Clicks</span>
                    </div>
                );
            }
            case 'stat-top': {
                const sorted = [...showcases].sort((a, b) => (b.clicks_count || 0) - (a.clicks_count || 0));
                const top = sorted[0];
                return (
                    <div className={`${tile.colSpan} p-5 md:p-6 flex flex-col justify-between min-h-[120px] transition-all duration-300`} style={{ background: bg }}>
                        <div className="flex items-center gap-3">
                            <span className="text-[10px] font-mono transition-colors duration-300" style={{ color: isVibe ? vibeRaw(index) : ACCENTS[3] }}>Top</span>
                            <div className="flex-1 h-px transition-colors duration-300" style={{ backgroundColor: isVibe ? `${vibeRaw(index)}4D` : `${ACCENTS[3]}20` }} />
                        </div>
                        {top ? (
                            <div>
                                <span className={`text-sm font-serif transition-colors duration-300 ${isVibe ? vt : 'text-[#37352f]'}`}>{top.title}</span>
                                <span className={`text-[10px] font-mono ml-2 transition-colors duration-300 ${isVibe ? `${vt} opacity-60` : 'text-[#9b9a97]'}`}>{top.clicks_count || 0} clicks · {top.views_count || 0} views</span>
                            </div>
                        ) : (
                            <span className={`text-[13px] font-serif italic transition-colors duration-300 ${isVibe ? vt : 'text-[#37352f] opacity-70'}`}>No data yet</span>
                        )}
                    </div>
                );
            }
            case 'nav':
                return (
                    <div className={`${tile.colSpan} p-5 flex flex-col justify-between min-h-[100px] group transition-all duration-300`} style={{ background: bg }}>
                        <span className="text-[9px] font-mono text-[#9b9a97] uppercase tracking-[0.2em]">Public</span>
                        <span className={`text-sm font-serif transition-colors duration-300 ${isVibe ? vt : 'text-[#37352f] group-hover:text-brand-red'}`}>View Page ↗</span>
                    </div>
                );
            case 'empty':
                return (
                    <div className={`${tile.colSpan} p-6 md:p-8 flex items-center min-h-[80px] transition-all duration-300`} style={{ background: bg }}>
                        <p className={`text-[13px] leading-relaxed font-serif italic transition-colors duration-300 ${isVibe ? vt : 'text-[#37352f] opacity-70'}`}>
                            No showcases yet. Paste a URL above to get started.
                        </p>
                    </div>
                );
            case 'showcase': {
                const s = tile.showcase!;
                const si = showcases.indexOf(s);
                const numStr = String(si + 1).padStart(2, '0');
                const accent = ACCENTS[si % ACCENTS.length];
                return (
                    <div className={`${tile.colSpan} p-5 md:p-6 flex flex-col justify-between min-h-[140px] md:min-h-[160px] group transition-all duration-300`} style={{ background: bg }}>
                        <div className="flex items-center gap-3">
                            <span className="text-[10px] font-mono transition-colors duration-300" style={{ color: isVibe ? vibeRaw(index) : accent }}>{numStr}</span>
                            <div className="flex-1 h-px transition-colors duration-300" style={{ backgroundColor: isVibe ? `${vibeRaw(index)}4D` : `${accent}20` }} />
                            <span className={`text-[8px] font-mono uppercase tracking-wider transition-colors duration-300 ${isVibe ? `${vt} opacity-60` : s.status === 'published' ? 'text-brand-red' : 'text-[#9b9a97]'}`}>{s.status}</span>
                        </div>
                        <div>
                            <h3 className={`text-base font-serif mb-1 transition-colors duration-300 ${isVibe ? vt : 'text-[#37352f] group-hover:text-brand-red'} ${tile.colSpan.includes('col-span-2') ? 'md:text-lg' : ''}`}>{s.title}</h3>
                            <p className={`text-[12px] leading-relaxed transition-colors duration-300 ${isVibe ? `${vt} opacity-60` : 'text-[#9b9a97]'}`}>{s.description}</p>
                            {s.tags.length > 0 && (
                                <div className="flex items-center gap-2 mt-2">
                                    <div className="w-4 h-px transition-colors duration-300" style={{ backgroundColor: isVibe ? `${vibeRaw(index)}4D` : `${accent}20` }} />
                                    <span className={`text-[8px] font-mono uppercase tracking-wider transition-colors duration-300 ${isVibe ? `${vt} opacity-40` : 'text-[#9b9a97]'}`}>{s.tags.join(' · ')}</span>
                                </div>
                            )}
                        </div>
                        <div className="flex items-center gap-3 mt-3">
                            <button onClick={() => startEdit(s)} className={`text-[9px] font-mono uppercase tracking-[0.2em] transition-colors duration-300 ${isVibe ? `${vt} opacity-60` : 'text-[#9b9a97] hover:text-[#37352f]'}`}>Edit</button>
                            <div className="w-3 h-px" style={{ backgroundColor: isVibe ? `${vibeRaw(index)}30` : '#ededeb' }} />
                            <button onClick={() => handleDelete(s.id)} className={`text-[9px] font-mono uppercase tracking-[0.2em] transition-colors duration-300 ${isVibe ? `${vt} opacity-60` : 'text-[#9b9a97] hover:text-brand-red'}`}>Remove</button>
                            <div className="flex-1" />
                            {s.source_url && (
                                <a href={s.source_url} target="_blank" rel="noopener noreferrer" className={`text-[8px] font-mono uppercase tracking-wider transition-colors duration-300 ${isVibe ? `${vt} opacity-60` : 'text-[#9b9a97] hover:text-[#37352f]'}`}>Source ↗</a>
                            )}
                            {s.post_url && (
                                <a href={s.post_url} target="_blank" rel="noopener noreferrer" className={`text-[8px] font-mono uppercase tracking-wider transition-colors duration-300 ${isVibe ? `${vt} opacity-60` : 'text-[#9b9a97] hover:text-[#37352f]'}`}>Post ↗</a>
                            )}
                        </div>
                    </div>
                );
            }
            case 'request': {
                const reqId = tile.id.replace('req-', '');
                const req = requests.find(r => r.id === reqId);
                if (!req) return null;
                return (
                    <div className={`${tile.colSpan} p-5 md:p-6 flex flex-col gap-2 min-h-[120px] transition-all duration-300`} style={{ background: bg }}>
                        <div className="flex items-center gap-3">
                            <span className="text-[10px] font-mono transition-colors duration-300" style={{ color: isVibe ? vibeRaw(index) : ACCENTS[index % ACCENTS.length] }}>Request</span>
                            <div className="flex-1 h-px transition-colors duration-300" style={{ backgroundColor: isVibe ? `${vibeRaw(index)}4D` : `${ACCENTS[index % ACCENTS.length]}20` }} />
                            <span className={`text-[8px] font-mono uppercase tracking-wider ${isVibe ? `${vt} opacity-40` : 'text-[#9b9a97]'}`}>{new Date(req.created_at).toLocaleDateString()}</span>
                        </div>
                        <p className={`text-sm font-serif transition-colors duration-300 ${isVibe ? vt : 'text-[#37352f]'}`}>{req.description}</p>
                        <div className="flex items-center gap-4 mt-1">
                            <span className={`text-[10px] font-mono ${isVibe ? `${vt} opacity-60` : 'text-[#9b9a97]'}`}>{req.name} · {req.email}</span>
                            {req.budget && <span className={`text-[10px] font-mono ${isVibe ? `${vt} opacity-60` : 'text-[#9b9a97]'}`}>Budget: {req.budget}</span>}
                            {req.timeline && <span className={`text-[10px] font-mono ${isVibe ? `${vt} opacity-60` : 'text-[#9b9a97]'}`}>Timeline: {req.timeline}</span>}
                        </div>
                        <div className="flex items-center gap-3 mt-2">
                            <a href={`mailto:${req.email}?subject=Re: Your VibeCoder request`} className={`text-[9px] font-mono uppercase tracking-[0.15em] transition-colors ${isVibe ? vt : 'text-brand-red hover:text-[#37352f]'}`}>Reply ↗</a>
                            <div className="w-3 h-px" style={{ backgroundColor: isVibe ? `${vibeRaw(index)}30` : '#ededeb' }} />
                            <button onClick={() => handleArchiveRequest(req.id)} className={`text-[9px] font-mono uppercase tracking-[0.2em] transition-colors ${isVibe ? `${vt} opacity-60` : 'text-[#9b9a97] hover:text-[#37352f]'}`}>Archive</button>
                        </div>
                    </div>
                );
            }
            case 'earn-total':
                return (
                    <div className={`${tile.colSpan} flex flex-col items-center justify-center p-6 min-h-[120px] transition-all duration-300`} style={{ background: bg }}>
                        <span className={`text-2xl font-bold font-mono transition-colors duration-300 ${isVibe ? vt : 'text-[#37352f]'}`}>${totalEarned.toLocaleString()}</span>
                        <span className="text-[9px] font-mono text-[#9b9a97] uppercase tracking-[0.2em] mt-1">Earned</span>
                    </div>
                );
            case 'earn-form':
                return (
                    <div className={`${tile.colSpan} p-5 md:p-6 flex flex-col gap-2 min-h-[120px] transition-all duration-300`} style={{ background: bg }}>
                        <div className="flex items-center gap-3 mb-1">
                            <span className="text-[10px] font-mono transition-colors duration-300" style={{ color: isVibe ? vibeRaw(index) : ACCENTS[index % ACCENTS.length] }}>Log Earning</span>
                            <div className="flex-1 h-px transition-colors duration-300" style={{ backgroundColor: isVibe ? `${vibeRaw(index)}4D` : `${ACCENTS[index % ACCENTS.length]}20` }} />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <input type="number" placeholder="Amount ($)" value={earnForm.amount}
                                onChange={e => setEarnForm(prev => ({ ...prev, amount: e.target.value }))}
                                className={`bg-transparent border-b focus:border-[#37352f] text-[12px] font-mono outline-none pb-1 transition-colors ${isVibe ? `${vt} border-white/20` : 'text-[#37352f] border-[#ededeb] placeholder:text-[#9b9a97]'}`} />
                            <input type="text" placeholder="Client (optional)" value={earnForm.client_name}
                                onChange={e => setEarnForm(prev => ({ ...prev, client_name: e.target.value }))}
                                className={`bg-transparent border-b focus:border-[#37352f] text-[12px] font-mono outline-none pb-1 transition-colors ${isVibe ? `${vt} border-white/20` : 'text-[#37352f] border-[#ededeb] placeholder:text-[#9b9a97]'}`} />
                        </div>
                        <input type="text" placeholder="Note (optional)" value={earnForm.note}
                            onChange={e => setEarnForm(prev => ({ ...prev, note: e.target.value }))}
                            className={`w-full bg-transparent border-b focus:border-[#37352f] text-[12px] font-serif outline-none pb-1 transition-colors ${isVibe ? `${vt} border-white/20` : 'text-[#37352f] border-[#ededeb] placeholder:text-[#9b9a97]'}`} />
                        <button
                            onClick={handleLogEarning}
                            disabled={savingEarning || !earnForm.amount}
                            className={`text-[9px] font-mono uppercase tracking-[0.15em] mt-1 self-start transition-colors disabled:opacity-30 ${isVibe ? vt : 'text-brand-red hover:text-[#37352f]'}`}
                        >
                            {savingEarning ? 'Saving…' : 'Log Earning →'}
                        </button>
                    </div>
                );
        }
    }

    const renderGrid = (tiles: Tile[]) => (
        <div className={GRID_CLASSES}>
            {tiles.map((tile, i) => {
                const rendered = renderTile(tile, i);
                return tile.href ? (
                    <Link key={tile.id} href={tile.href} target={tile.variant === 'nav' ? '_blank' : undefined} className="contents">{rendered}</Link>
                ) : (
                    <div key={tile.id} className="contents">{rendered}</div>
                );
            })}
        </div>
    );

    return (
        <PageShell>
            <Header breadcrumbs={breadcrumbs} />
            <section className="flex-1">
                {loading ? (
                    <div className="flex items-center justify-center py-32">
                        <div className="w-6 h-6 border-2 border-[#ededeb] border-t-[#37352f] rounded-full animate-spin" />
                    </div>
                ) : (
                    <div className="space-y-4">
                        {renderGrid(buildProfileTiles())}
                        {renderGrid(buildFormTiles())}
                        {renderGrid(buildShowcaseTiles(showcases, username))}
                        {renderGrid(buildStatsTiles(showcases, totalViews))}
                        {requests.length > 0 && renderGrid(buildRequestTiles(requests))}
                        {renderGrid(buildEarningsTiles(earnings, totalEarned))}
                    </div>
                )}
            </section>
            <Footer />
        </PageShell>
    );
}
