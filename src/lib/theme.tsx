'use client';

import { useState, useEffect, useCallback, createContext, useContext } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContext {
    theme: Theme;
    resolved: 'light' | 'dark';
    setTheme: (t: Theme) => void;
    toggle: () => void;
}

const Ctx = createContext<ThemeContext>({
    theme: 'system',
    resolved: 'light',
    setTheme: () => {},
    toggle: () => {},
});

export function useTheme() { return useContext(Ctx); }

function getSystemTheme(): 'light' | 'dark' {
    if (typeof window === 'undefined') return 'light';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyTheme(resolved: 'light' | 'dark') {
    document.documentElement.classList.toggle('dark', resolved === 'dark');
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setThemeState] = useState<Theme>('dark');
    const [resolved, setResolved] = useState<'light' | 'dark'>('dark');

    // Init from localStorage (default to dark)
    useEffect(() => {
        const stored = localStorage.getItem('vc-theme') as Theme | null;
        const t = stored || 'dark';
        setThemeState(t);
        const r = t === 'system' ? getSystemTheme() : (t === 'light' ? 'light' : 'dark');
        setResolved(r);
        applyTheme(r);
    }, []);

    // Listen for system preference changes
    useEffect(() => {
        const mq = window.matchMedia('(prefers-color-scheme: dark)');
        const handler = () => {
            if (theme === 'system') {
                const r = getSystemTheme();
                setResolved(r);
                applyTheme(r);
            }
        };
        mq.addEventListener('change', handler);
        return () => mq.removeEventListener('change', handler);
    }, [theme]);

    const setTheme = useCallback((t: Theme) => {
        setThemeState(t);
        localStorage.setItem('vc-theme', t);
        const r = t === 'system' ? getSystemTheme() : t;
        setResolved(r);
        applyTheme(r);
    }, []);

    const toggle = useCallback(() => {
        setTheme(resolved === 'dark' ? 'light' : 'dark');
    }, [resolved, setTheme]);

    return <Ctx.Provider value={{ theme, resolved, setTheme, toggle }}>{children}</Ctx.Provider>;
}
