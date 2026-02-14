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
