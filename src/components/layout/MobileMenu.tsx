'use client';

import Link from 'next/link';
import { useSession, signIn, signOut } from 'next-auth/react';

interface MobileMenuProps {
    open: boolean;
    onClose: () => void;
}

export default function MobileMenu({ open, onClose }: MobileMenuProps) {
    const { data: session } = useSession();
    const username = session ? ((session.user as { username?: string }).username || session.user?.name || '') : '';
    if (!open) return null;
    return (
        <div className="fixed inset-0 z-[90] md:hidden" onClick={onClose}>
            <div className="absolute inset-0 bg-black/30" />
            <div className="absolute top-0 right-0 w-64 h-full bg-vc-surface shadow-xl p-6 flex flex-col gap-4" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="self-end text-vc-text-secondary hover:text-vc-text text-lg">✕</button>
                <Link href="/explore" onClick={onClose} className="text-sm font-medium text-vc-text py-2 border-b border-vc-border">Explore</Link>
                <Link href="/leaderboard" onClick={onClose} className="text-sm font-medium text-vc-text py-2 border-b border-vc-border">Leaderboard</Link>
                <Link href="/search" onClick={onClose} className="text-sm font-medium text-vc-text py-2 border-b border-vc-border">Search</Link>
                {session ? (
                    <>
                        <Link href={`/m/${username}`} onClick={onClose} className="text-sm font-medium text-vc-text py-2 border-b border-vc-border">Profile</Link>
                        <Link href="/manager" onClick={onClose} className="text-sm font-medium text-vc-text py-2 border-b border-vc-border">Manager</Link>
                        <button onClick={() => { signOut({ callbackUrl: '/' }); onClose(); }} className="text-sm font-medium text-left text-vc-text py-2">Sign Out</button>
                    </>
                ) : (
                    <button onClick={() => { signIn('github'); onClose(); }} className="text-sm font-medium text-brand-red py-2">Sign in with GitHub</button>
                )}
            </div>
        </div>
    );
}
