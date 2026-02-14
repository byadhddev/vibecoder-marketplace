'use client';

import { useState, useEffect, useRef, type ReactNode } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { useSession, signIn, signOut } from 'next-auth/react';
import { useTheme } from '@/lib/theme';

const SearchOverlay = dynamic(() => import('./SearchOverlay'), { ssr: false });
const MobileMenu = dynamic(() => import('./MobileMenu'), { ssr: false });

interface HeaderProps {
    breadcrumbs?: ReactNode;
    rightContent?: ReactNode;
    className?: string;
    showAuth?: boolean;
}

function ThemeToggle() {
    const { resolved, toggle } = useTheme();
    return (
        <button
            onClick={toggle}
            className="p-1.5 text-vc-text-secondary hover:text-vc-text transition-colors"
            aria-label={`Switch to ${resolved === 'dark' ? 'light' : 'dark'} mode`}
        >
            {resolved === 'dark' ? (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
            ) : (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
            )}
        </button>
    );
}

function VibeLogo() {
    return (
        <Link href="/" className="flex items-center gap-2 hover:text-vc-text transition-colors font-medium text-vc-text-secondary">
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
        return <div className="w-7 h-7 rounded-sm bg-vc-skeleton animate-pulse" />;
    }

    if (!session) {
        return (
            <button
                onClick={() => signIn('github')}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-red hover:bg-[var(--vc-brand-hover)] text-white text-sm font-medium rounded-lg transition-all hover:shadow-md hover:shadow-brand-red/20 active:scale-[0.98]"
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
                className="flex items-center gap-2 px-2 py-1 hover:bg-vc-surface-raised rounded-lg transition-colors"
            >
                {session.user?.image ? (
                    <Image
                        src={session.user.image}
                        alt=""
                        width={28}
                        height={28}
                        className="rounded-sm border border-vc-border"
                    />
                ) : (
                    <div className="w-7 h-7 rounded-sm bg-vc-dark flex items-center justify-center text-[var(--vc-dark-text-strong)] text-xs font-bold">
                        {session.user?.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                )}
            </button>

            {showMenu && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-vc-surface border border-vc-border rounded-lg shadow-xl py-1 z-50">
                    <div className="px-4 py-3 border-b border-vc-border">
                        <p className="text-sm font-medium text-vc-text truncate">
                            {session.user?.name || 'User'}
                        </p>
                        <p className="text-xs text-vc-text-secondary truncate">
                            @{username}
                        </p>
                    </div>
                    <div className="py-1">
                        <Link
                            href={`/m/${username}`}
                            onClick={() => setShowMenu(false)}
                            className="w-full text-left px-4 py-2 text-sm text-vc-text hover:bg-vc-surface-raised flex items-center gap-2 transition-colors"
                        >
                            Profile
                        </Link>
                        <Link
                            href="/manager"
                            onClick={() => setShowMenu(false)}
                            className="w-full text-left px-4 py-2 text-sm text-vc-text hover:bg-vc-surface-raised flex items-center gap-2 transition-colors"
                        >
                            Manager
                        </Link>
                        <button
                            onClick={() => signOut({ callbackUrl: '/' })}
                            className="w-full text-left px-4 py-2 text-sm text-vc-text hover:bg-vc-surface-raised flex items-center gap-2 transition-colors"
                        >
                            Sign Out
                        </button>
                    </div>
                </div>
            )}
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
                <div className="flex items-center gap-3 text-vc-text-secondary">
                    {breadcrumbs || <VibeLogo />}
                </div>

                <div className="flex items-center text-vc-text-secondary">
                    <div className="hidden md:flex items-center gap-4 mr-4">
                        {rightContent || (
                            <>
                                <Link href="/explore" className="hover:text-vc-text transition-colors">
                                    Explore
                                </Link>
                                <Link href="/leaderboard" className="hover:text-vc-text transition-colors">
                                    Leaderboard
                                </Link>
                            </>
                        )}
                        <button
                            onClick={() => setSearchOpen(true)}
                            className="flex items-center gap-2 px-2.5 py-1.5 rounded-md border border-vc-border hover:border-vc-text-muted transition-colors text-vc-text-secondary hover:text-vc-text"
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                            <span className="text-xs">Search</span>
                            <kbd className="text-[9px] font-mono bg-vc-surface-raised px-1 py-0.5 rounded border border-vc-border ml-1">⌘K</kbd>
                        </button>
                        <ThemeToggle />
                    </div>

                    {showAuth && (
                        <div className="hidden md:block md:border-l md:border-vc-border md:pl-4 ml-3">
                            <UserButton />
                        </div>
                    )}

                    {/* Mobile: theme + search + hamburger */}
                    <div className="flex md:hidden items-center gap-1">
                        <ThemeToggle />
                        <button onClick={() => setSearchOpen(true)} className="p-2 text-vc-text-secondary hover:text-vc-text">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                        </button>
                        <button onClick={() => setMobileMenuOpen(true)} className="p-2 text-vc-text-secondary hover:text-vc-text">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 12h18M3 6h18M3 18h18"/></svg>
                        </button>
                    </div>
                </div>
            </nav>
        </>
    );
}
