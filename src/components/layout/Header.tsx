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
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-[#37352f] hover:bg-[#f0f0f0] rounded-lg transition-colors"
            >
                Sign In
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
                        <Link href="/explore" className="hover:text-[#37352f] transition-colors">
                            Explore
                        </Link>
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
