'use client';

import { useState, useRef, useEffect, type ReactNode } from 'react';
import Link from 'next/link';
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

export function Header({ breadcrumbs, rightContent, className = '', showAuth = true }: HeaderProps) {
    return (
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
                </div>

                {showAuth && (
                    <div className="md:border-l md:border-[#ededeb] md:pl-4 ml-3">
                        <UserButton />
                    </div>
                )}
            </div>
        </nav>
    );
}
