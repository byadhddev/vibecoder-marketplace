'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { useSession, signIn, signOut } from 'next-auth/react';

interface HeaderProps {
    breadcrumbs?: ReactNode;
    rightContent?: ReactNode;
    className?: string;
}

export function Header({ breadcrumbs, rightContent, className = '' }: HeaderProps) {
    const { data: session, status } = useSession();

    return (
        <header className={`flex items-center justify-between ${className}`}>
            <div className="text-sm">
                {breadcrumbs || (
                    <div className="flex items-center gap-2 text-[#9b9a97]">
                        <Link href="/" className="flex items-center gap-2 hover:text-[#37352f] transition-colors">
                            <div className="w-3 h-3 bg-brand-red rounded-[2px]" />
                            <span className="text-[#37352f] font-medium">VibeCoder</span>
                        </Link>
                    </div>
                )}
            </div>
            <div className="flex items-center gap-3">
                {rightContent}
                {status === 'loading' ? (
                    <div className="w-4 h-4 border border-[#ededeb] border-t-[#9b9a97] rounded-full animate-spin" />
                ) : session?.user ? (
                    <div className="flex items-center gap-2.5">
                        <Link
                            href="/explore"
                            className="text-[10px] font-mono uppercase tracking-[0.15em] text-[#9b9a97] hover:text-[#37352f] transition-colors"
                        >
                            Explore
                        </Link>
                        <Link
                            href="/gallery"
                            className="text-[10px] font-mono uppercase tracking-[0.15em] text-[#9b9a97] hover:text-[#37352f] transition-colors"
                        >
                            Gallery
                        </Link>
                        <Link
                            href="/manager"
                            className="text-[10px] font-mono uppercase tracking-[0.15em] text-[#9b9a97] hover:text-[#37352f] transition-colors"
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
                            className="text-[10px] font-mono uppercase tracking-[0.15em] text-[#9b9a97] hover:text-brand-red transition-colors"
                        >
                            Sign out
                        </button>
                    </div>
                ) : (
                    <div className="flex items-center gap-2.5">
                        <Link
                            href="/explore"
                            className="text-[10px] font-mono uppercase tracking-[0.15em] text-[#9b9a97] hover:text-[#37352f] transition-colors"
                        >
                            Explore
                        </Link>
                        <Link
                            href="/gallery"
                            className="text-[10px] font-mono uppercase tracking-[0.15em] text-[#9b9a97] hover:text-[#37352f] transition-colors"
                        >
                            Gallery
                        </Link>
                        <button
                            onClick={() => signIn('github')}
                            className="text-[10px] font-mono uppercase tracking-[0.15em] text-[#9b9a97] hover:text-[#37352f] transition-colors"
                        >
                            Sign in
                        </button>
                    </div>
                )}
            </div>
        </header>
    );
}
