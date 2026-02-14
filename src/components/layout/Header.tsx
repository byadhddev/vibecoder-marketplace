'use client';

import { useState, useRef, useEffect, useCallback, type ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession, signIn, signOut } from 'next-auth/react';

interface HeaderProps {
    breadcrumbs?: ReactNode;
    rightContent?: ReactNode;
    className?: string;
    showAuth?: boolean;
}

function VibeLogo() {
    return (
        <Link href="/" className="flex items-center gap-2 hover:text-[#37352f] transition-colors font-medium text-[#9b9a97]">
            <div className="w-3 h-3 bg-brand-red rounded-[2px]" />
            <span>VibeCoder</span>
        </Link>
    );
}

function UserButton() {
    const { data: session, status } = useSession();
    const [showMenu, setShowMenu] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setShowMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    if (status === 'loading') {
        return <div className="w-7 h-7 rounded-sm bg-[#ededeb] animate-pulse" />;
    }

    if (!session) {
        return (
            <button
                onClick={() => signIn('github')}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-red hover:bg-[#b50014] text-white text-sm font-medium rounded-lg transition-all hover:shadow-md hover:shadow-brand-red/20 active:scale-[0.98]"
            >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
                Sign in with GitHub
            </button>
        );
    }

    const username = (session.user as { username?: string }).username || session.user?.name || '';

    return (
        <div ref={menuRef} className="relative">
            <button
                onClick={() => setShowMenu(!showMenu)}
                className="flex items-center gap-2 px-2 py-1 hover:bg-[#f0f0f0] rounded-lg transition-colors"
            >
                {session.user?.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={session.user.image}
                        alt=""
                        className="w-7 h-7 rounded-sm border border-[#ededeb]"
                    />
                ) : (
                    <div className="w-7 h-7 rounded-sm bg-[#37352f] flex items-center justify-center text-white text-xs font-bold">
                        {session.user?.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                )}
            </button>

            {showMenu && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-[#ededeb] rounded-lg shadow-xl py-1 z-50">
                    <div className="px-4 py-3 border-b border-[#ededeb]">
                        <p className="text-sm font-medium text-[#37352f] truncate">
                            {session.user?.name || 'User'}
                        </p>
                        <p className="text-xs text-[#787774] truncate">
                            @{username}
                        </p>
                    </div>
                    <div className="py-1">
                        <Link
                            href={`/m/${username}`}
                            onClick={() => setShowMenu(false)}
                            className="w-full text-left px-4 py-2 text-sm text-[#37352f] hover:bg-[#f7f7f5] flex items-center gap-2 transition-colors"
                        >
                            Profile
                        </Link>
                        <Link
                            href="/manager"
                            onClick={() => setShowMenu(false)}
                            className="w-full text-left px-4 py-2 text-sm text-[#37352f] hover:bg-[#f7f7f5] flex items-center gap-2 transition-colors"
                        >
                            Manager
                        </Link>
                        <button
                            onClick={() => signOut({ callbackUrl: '/' })}
                            className="w-full text-left px-4 py-2 text-sm text-[#37352f] hover:bg-[#f7f7f5] flex items-center gap-2 transition-colors"
                        >
                            Sign Out
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

interface QuickResult {
    type: 'builder' | 'showcase';
    title: string;
    subtitle: string;
    url: string;
    avatar_url?: string;
}

function SearchOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<QuickResult[]>([]);
    const [selected, setSelected] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    useEffect(() => {
        if (open) { inputRef.current?.focus(); setQuery(''); setResults([]); setSelected(0); }
    }, [open]);

    useEffect(() => {
        if (query.length < 2) { setResults([]); return; }
        const t = setTimeout(async () => {
            try {
                const res = await fetch(`/api/marketplace/search?q=${encodeURIComponent(query)}`);
                const data = await res.json();
                setResults((data.results || []).slice(0, 8));
                setSelected(0);
            } catch { /* ignore */ }
        }, 200);
        return () => clearTimeout(t);
    }, [query]);

    const navigate = useCallback((url: string) => { onClose(); router.push(url); }, [onClose, router]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'ArrowDown') { e.preventDefault(); setSelected(s => Math.min(s + 1, results.length)); }
        else if (e.key === 'ArrowUp') { e.preventDefault(); setSelected(s => Math.max(s - 1, 0)); }
        else if (e.key === 'Enter') {
            e.preventDefault();
            if (selected === 0 && query.length >= 2) navigate(`/search?q=${encodeURIComponent(query)}`);
            else if (results[selected - 1]) navigate(results[selected - 1].url);
        }
        else if (e.key === 'Escape') onClose();
    };

    if (!open) return null;
    return (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]" onClick={onClose}>
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <div className="relative w-full max-w-lg mx-4 bg-white rounded-lg shadow-2xl border border-[#ededeb] overflow-hidden" onClick={e => e.stopPropagation()}>
                <div className="flex items-center gap-3 px-4 py-3 border-b border-[#ededeb]">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9b9a97" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Search builders, showcases, skills..."
                        className="flex-1 text-sm outline-none text-[#37352f] placeholder:text-[#9b9a97]"
                    />
                    <kbd className="text-[9px] font-mono text-[#9b9a97] bg-[#f7f6f3] px-1.5 py-0.5 rounded border border-[#ededeb]">ESC</kbd>
                </div>
                {results.length > 0 && (
                    <div className="max-h-[300px] overflow-y-auto py-1">
                        <button
                            className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 transition-colors ${selected === 0 ? 'bg-[#f7f6f3]' : 'hover:bg-[#fafaf9]'}`}
                            onClick={() => navigate(`/search?q=${encodeURIComponent(query)}`)}
                        >
                            <span className="text-[#9b9a97]">View all results for &quot;{query}&quot;</span>
                        </button>
                        {results.map((r, i) => (
                            <button
                                key={r.url}
                                className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-3 transition-colors ${selected === i + 1 ? 'bg-[#f7f6f3]' : 'hover:bg-[#fafaf9]'}`}
                                onClick={() => navigate(r.url)}
                            >
                                {r.avatar_url ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={r.avatar_url} alt="" className="w-5 h-5 rounded-sm" />
                                ) : (
                                    <div className="w-5 h-5 rounded-sm bg-[#ededeb]" />
                                )}
                                <div className="flex-1 min-w-0">
                                    <span className="text-[#37352f] font-medium truncate block">{r.title}</span>
                                    <span className="text-[10px] font-mono text-[#9b9a97]">{r.subtitle}</span>
                                </div>
                                <span className="text-[8px] font-mono text-[#9b9a97] uppercase">{r.type}</span>
                            </button>
                        ))}
                    </div>
                )}
                {query.length >= 2 && results.length === 0 && (
                    <div className="px-4 py-6 text-center">
                        <span className="text-sm text-[#9b9a97]">No results found</span>
                    </div>
                )}
            </div>
        </div>
    );
}

function MobileMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
    const { data: session } = useSession();
    const username = session ? ((session.user as { username?: string }).username || session.user?.name || '') : '';
    if (!open) return null;
    return (
        <div className="fixed inset-0 z-[90] md:hidden" onClick={onClose}>
            <div className="absolute inset-0 bg-black/30" />
            <div className="absolute top-0 right-0 w-64 h-full bg-white shadow-xl p-6 flex flex-col gap-4" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="self-end text-[#9b9a97] hover:text-[#37352f] text-lg">✕</button>
                <Link href="/explore" onClick={onClose} className="text-sm font-medium text-[#37352f] py-2 border-b border-[#ededeb]">Explore</Link>
                <Link href="/leaderboard" onClick={onClose} className="text-sm font-medium text-[#37352f] py-2 border-b border-[#ededeb]">Leaderboard</Link>
                <Link href="/search" onClick={onClose} className="text-sm font-medium text-[#37352f] py-2 border-b border-[#ededeb]">Search</Link>
                {session ? (
                    <>
                        <Link href={`/m/${username}`} onClick={onClose} className="text-sm font-medium text-[#37352f] py-2 border-b border-[#ededeb]">Profile</Link>
                        <Link href="/manager" onClick={onClose} className="text-sm font-medium text-[#37352f] py-2 border-b border-[#ededeb]">Manager</Link>
                        <button onClick={() => { signOut({ callbackUrl: '/' }); onClose(); }} className="text-sm font-medium text-left text-[#37352f] py-2">Sign Out</button>
                    </>
                ) : (
                    <button onClick={() => { signIn('github'); onClose(); }} className="text-sm font-medium text-brand-red py-2">Sign in with GitHub</button>
                )}
            </div>
        </div>
    );
}

export function Header({ breadcrumbs, rightContent, className = '', showAuth = true }: HeaderProps) {
    const [searchOpen, setSearchOpen] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setSearchOpen(true); }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, []);

    return (
        <>
            <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
            <MobileMenu open={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
            <nav className={`flex items-center justify-between mb-12 text-sm ${className}`}>
                <div className="flex items-center gap-3 text-[#9b9a97]">
                    {breadcrumbs || <VibeLogo />}
                </div>

                <div className="flex items-center text-[#9b9a97]">
                    <div className="hidden md:flex items-center gap-4 mr-4">
                        {rightContent || (
                            <>
                                <Link href="/explore" className="hover:text-[#37352f] transition-colors">
                                    Explore
                                </Link>
                                <Link href="/leaderboard" className="hover:text-[#37352f] transition-colors">
                                    Leaderboard
                                </Link>
                            </>
                        )}
                        <button
                            onClick={() => setSearchOpen(true)}
                            className="flex items-center gap-2 px-2.5 py-1.5 rounded-md border border-[#ededeb] hover:border-[#d5d5d3] transition-colors text-[#9b9a97] hover:text-[#37352f]"
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                            <span className="text-xs">Search</span>
                            <kbd className="text-[9px] font-mono bg-[#f7f6f3] px-1 py-0.5 rounded border border-[#ededeb] ml-1">⌘K</kbd>
                        </button>
                    </div>

                    {showAuth && (
                        <div className="hidden md:block md:border-l md:border-[#ededeb] md:pl-4 ml-3">
                            <UserButton />
                        </div>
                    )}

                    {/* Mobile: search + hamburger */}
                    <div className="flex md:hidden items-center gap-2">
                        <button onClick={() => setSearchOpen(true)} className="p-2 text-[#9b9a97] hover:text-[#37352f]">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                        </button>
                        <button onClick={() => setMobileMenuOpen(true)} className="p-2 text-[#9b9a97] hover:text-[#37352f]">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 12h18M3 6h18M3 18h18"/></svg>
                        </button>
                    </div>
                </div>
            </nav>
        </>
    );
}
