'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface QuickResult {
    type: 'builder' | 'showcase';
    title: string;
    subtitle: string;
    url: string;
    avatar_url?: string;
}

interface SearchOverlayProps {
    open: boolean;
    onClose: () => void;
}

export default function SearchOverlay({ open, onClose }: SearchOverlayProps) {
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
            <div className="relative w-full max-w-lg mx-4 bg-vc-surface rounded-lg shadow-2xl border border-vc-border overflow-hidden" onClick={e => e.stopPropagation()}>
                <div className="flex items-center gap-3 px-4 py-3 border-b border-vc-border">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Search builders, showcases, skills..."
                        className="flex-1 text-sm outline-none text-vc-text placeholder:text-vc-text-secondary"
                    />
                    <kbd className="text-[9px] font-mono text-vc-text-secondary bg-vc-surface-raised px-1.5 py-0.5 rounded border border-vc-border">ESC</kbd>
                </div>
                {results.length > 0 && (
                    <div className="max-h-[300px] overflow-y-auto py-1">
                        <button
                            className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 transition-colors ${selected === 0 ? 'bg-vc-surface-raised' : 'hover:bg-vc-surface-raised'}`}
                            onClick={() => navigate(`/search?q=${encodeURIComponent(query)}`)}
                        >
                            <span className="text-vc-text-secondary">View all results for &quot;{query}&quot;</span>
                        </button>
                        {results.map((r, i) => (
                            <button
                                key={r.url}
                                className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-3 transition-colors ${selected === i + 1 ? 'bg-vc-surface-raised' : 'hover:bg-vc-surface-raised'}`}
                                onClick={() => navigate(r.url)}
                            >
                                {r.avatar_url ? (
                                    <Image src={r.avatar_url} alt="" width={20} height={20} className="rounded-sm" />
                                ) : (
                                    <div className="w-5 h-5 rounded-sm bg-vc-border" />
                                )}
                                <div className="flex-1 min-w-0">
                                    <span className="text-vc-text font-medium truncate block">{r.title}</span>
                                    <span className="text-[10px] font-mono text-vc-text-secondary">{r.subtitle}</span>
                                </div>
                                <span className="text-[8px] font-mono text-vc-text-secondary uppercase">{r.type}</span>
                            </button>
                        ))}
                    </div>
                )}
                {query.length >= 2 && results.length === 0 && (
                    <div className="px-4 py-6 text-center">
                        <span className="text-sm text-vc-text-secondary">No results found</span>
                    </div>
                )}
            </div>
        </div>
    );
}
