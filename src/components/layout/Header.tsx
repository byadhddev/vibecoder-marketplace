'use client';

import type { ReactNode } from 'react';
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

export function Header({ breadcrumbs, rightContent, className = '', showAuth = true }: HeaderProps) {
    const { data: session, status } = useSession();

    return (
        <nav className={`flex items-center justify-between mb-12 text-sm ${className}`}>
            <div className="flex items-center gap-3 text-[#9b9a97]">
                {breadcrumbs || <VibeLogo />}
            </div>

            <div className="flex items-center text-[#9b9a97]">
                {/* Nav links */}
                <div className="hidden md:flex items-center gap-4 mr-4">
                    {rightContent || (
                        <Link href="/explore" className="hover:text-[#37352f] transition-colors">
                            Explore
                        </Link>
                    )}
                </div>

                {/* Auth section - border separated */}
                {showAuth && (
                    <div className="md:border-l md:border-[#ededeb] md:pl-4 ml-3">
                        {status === 'loading' ? (
                            <div className="w-4 h-4 border border-[#ededeb] border-t-[#9b9a97] rounded-full animate-spin" />
                        ) : session?.user ? (
                            <div className="flex items-center gap-3">
                                <Link
                                    href="/explore"
                                    className="md:hidden text-xs hover:text-[#37352f] transition-colors"
                                >
                                    Explore
                                </Link>
                                <Link
                                    href="/manager"
                                    className="text-xs hover:text-[#37352f] transition-colors"
                                >
                                    Manager
                                </Link>
                                {session.user.image && (
                                    <Link href={`/m/${(session.user as { username?: string }).username || session.user.name || ''}`}>
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src={session.user.image}
                                            alt=""
                                            className="w-6 h-6 rounded-sm border border-[#ededeb]"
                                        />
                                    </Link>
                                )}
                                <button
                                    onClick={() => signOut()}
                                    className="text-xs hover:text-brand-red transition-colors"
                                >
                                    Sign out
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3">
                                <Link
                                    href="/explore"
                                    className="md:hidden text-xs hover:text-[#37352f] transition-colors"
                                >
                                    Explore
                                </Link>
                                <button
                                    onClick={() => signIn('github')}
                                    className="text-xs hover:text-[#37352f] transition-colors"
                                >
                                    Sign in
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </nav>
    );
}
