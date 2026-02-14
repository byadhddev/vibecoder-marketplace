'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { PageShell } from '@/components/layout/PageShell';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { GRID_CLASSES, ACCENTS } from '@/lib/vibe';

interface SearchResult {
    type: 'builder' | 'showcase';
    title: string;
    subtitle: string;
    url: string;
    avatar_url?: string;
    tags?: string[];
    score: number;
}

function SearchPageContent() {
    const searchParams = useSearchParams();
    const initialQ = searchParams.get('q') || '';
    const [query, setQuery] = useState(initialQ);
    const [results, setResults] = useState<SearchResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);

    const doSearch = useCallback(async (q: string) => {
        if (q.length < 2) { setResults([]); setSearched(false); return; }
        setLoading(true);
        try {
            const res = await fetch(`/api/marketplace/search?q=${encodeURIComponent(q)}`);
            const data = await res.json();
            setResults(data.results || []);
            setSearched(true);
        } catch { setResults([]); }
        setLoading(false);
    }, []);

    useEffect(() => {
        if (initialQ) doSearch(initialQ);
    }, [initialQ, doSearch]);

    useEffect(() => {
        const t = setTimeout(() => { if (query.length >= 2) doSearch(query); }, 300);
        return () => clearTimeout(t);
    }, [query, doSearch]);

    const builders = results.filter(r => r.type === 'builder');
    const showcases = results.filter(r => r.type === 'showcase');

    const breadcrumbs = (
        <div className="flex items-center gap-2 text-[#9b9a97]">
            <Link href="/" className="flex items-center gap-2 hover:text-[#37352f] transition-colors font-medium">
                <div className="w-3 h-3 bg-brand-red rounded-[2px]" />
                <span>VibeCoder</span>
            </Link>
            <span className="text-[#d5d5d3]">/</span>
            <span className="text-[#37352f] font-medium">search</span>
        </div>
    );

    return (
        <PageShell>
            <Header breadcrumbs={breadcrumbs} />
            <section>
                <div className={GRID_CLASSES}>
                    {/* Search input tile */}
                    <div className="col-span-2 md:col-span-4 p-6 md:p-8 bg-[#242423]">
                        <input
                            type="text"
                            value={query}
                            onChange={e => setQuery(e.target.value)}
                            placeholder="Search builders, showcases, skills, tags..."
                            autoFocus
                            className="w-full bg-transparent text-white text-lg md:text-xl font-serif outline-none placeholder:text-white/30"
                        />
                    </div>

                    {/* Loading */}
                    {loading && (
                        <div className="col-span-2 md:col-span-4 p-6 flex items-center justify-center">
                            <span className="text-[11px] font-mono text-[#9b9a97] uppercase tracking-[0.15em] animate-pulse">Searching...</span>
                        </div>
                    )}

                    {/* No results */}
                    {searched && !loading && results.length === 0 && (
                        <div className="col-span-2 md:col-span-4 p-8 flex flex-col items-center justify-center min-h-[200px]">
                            <span className="text-lg font-serif text-[#37352f] mb-2">No results found</span>
                            <span className="text-[11px] font-mono text-[#9b9a97] text-center">
                                Try searching for a builder name, skill (e.g. &quot;React&quot;), or showcase title
                            </span>
                        </div>
                    )}

                    {/* Builders section */}
                    {builders.length > 0 && (
                        <>
                            <div className="col-span-2 md:col-span-4 p-4 bg-[#f7f6f3]">
                                <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-[#9b9a97]">Builders ({builders.length})</span>
                            </div>
                            {builders.map((r, i) => (
                                <Link key={r.url} href={r.url} className="contents">
                                    <div className="col-span-2 p-5 md:p-6 flex flex-col justify-between min-h-[120px] bg-white group hover:bg-[#fafaf9] transition-colors">
                                        <div className="flex items-center gap-3">
                                            {r.avatar_url && (
                                                <Image src={r.avatar_url} alt="" width={24} height={24} className="rounded-sm" />
                                            )}
                                            <span className="text-sm font-serif text-[#37352f] group-hover:text-brand-red transition-colors">{r.title}</span>
                                            <div className="flex-1 h-px" style={{ backgroundColor: `${ACCENTS[i % ACCENTS.length]}20` }} />
                                        </div>
                                        <span className="text-[11px] font-mono text-[#9b9a97]">{r.subtitle}</span>
                                        {r.tags && r.tags.length > 0 && (
                                            <div className="flex flex-wrap gap-1 mt-2">
                                                {r.tags.map(t => (
                                                    <span key={t} className="text-[8px] font-mono px-1.5 py-0.5 rounded-sm bg-[#f7f6f3] text-[#9b9a97]">{t}</span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </Link>
                            ))}
                        </>
                    )}

                    {/* Showcases section */}
                    {showcases.length > 0 && (
                        <>
                            <div className="col-span-2 md:col-span-4 p-4 bg-[#f7f6f3]">
                                <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-[#9b9a97]">Showcases ({showcases.length})</span>
                            </div>
                            {showcases.map((r, i) => (
                                <Link key={r.url} href={r.url} className="contents">
                                    <div className="col-span-2 p-5 md:p-6 flex flex-col justify-between min-h-[100px] bg-white group hover:bg-[#fafaf9] transition-colors">
                                        <div className="flex items-center gap-3">
                                            {r.avatar_url && (
                                                <Image src={r.avatar_url} alt="" width={20} height={20} className="rounded-sm opacity-60" />
                                            )}
                                            <span className="text-sm font-serif text-[#37352f] group-hover:text-brand-red transition-colors">{r.title}</span>
                                        </div>
                                        <span className="text-[11px] font-mono text-[#9b9a97]">{r.subtitle}</span>
                                        {r.tags && r.tags.length > 0 && (
                                            <div className="flex flex-wrap gap-1 mt-2">
                                                {r.tags.map(t => (
                                                    <span key={t} className="text-[8px] font-mono px-1.5 py-0.5 rounded-sm bg-[#f7f6f3] text-[#9b9a97]">{t}</span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </Link>
                            ))}
                        </>
                    )}

                    {/* Empty state filler */}
                    {!searched && !loading && (
                        <div className="col-span-2 md:col-span-4 p-8 flex flex-col items-center justify-center min-h-[200px]">
                            <span className="text-[11px] font-mono text-[#9b9a97] uppercase tracking-[0.15em]">Type to search</span>
                        </div>
                    )}
                </div>
            </section>
            <Footer />
        </PageShell>
    );
}

export default function SearchPage() {
    return (
        <Suspense fallback={
            <PageShell>
                <Header />
                <div className="flex items-center justify-center min-h-[300px]">
                    <span className="text-[11px] font-mono text-[#9b9a97] uppercase tracking-[0.15em] animate-pulse">Loading...</span>
                </div>
                <Footer />
            </PageShell>
        }>
            <SearchPageContent />
        </Suspense>
    );
}
