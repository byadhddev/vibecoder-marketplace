import { Suspense } from 'react';
import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import '@/styles/globals.css';
import { SessionProvider } from '@/components/SessionProvider';
import { ThemeProvider } from '@/lib/theme';

const inter = Inter({
    variable: '--font-inter',
    subsets: ['latin'],
    display: 'swap',
});

const playfair = Playfair_Display({
    variable: '--font-playfair',
    subsets: ['latin'],
    display: 'swap',
    weight: ['400', '500', '600', '700', '800', '900'],
    style: ['normal', 'italic'],
});

// Inline script to prevent flash of wrong theme
const themeScript = `(function(){try{var t=localStorage.getItem('vc-theme');var d=t==='dark'||(t!=='light'&&window.matchMedia('(prefers-color-scheme:dark)').matches);if(d)document.documentElement.classList.add('dark')}catch(e){}})()`;

export const metadata: Metadata = {
    title: {
        default: 'VibeCoder — Where Vibe Coders Meet Their Next Build',
        template: '%s | VibeCoder',
    },
    description: 'The transparent marketplace for AI-native builders and the founders who need them. Showcase real projects, get hired through GitHub Issues, earn transparently.',
    keywords: ['vibe coding', 'AI developer', 'freelance', 'marketplace', 'hire developer', 'showcase', 'portfolio'],
    openGraph: {
        title: 'VibeCoder Marketplace',
        description: 'The marketplace for vibe coders who build with AI and founders who need it done yesterday.',
        type: 'website',
        siteName: 'VibeCoder',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'VibeCoder Marketplace',
        description: 'Ship Fast. Get Found. Get Paid.',
    },
    robots: { index: true, follow: true },
    alternates: { canonical: '/' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en" suppressHydrationWarning>
            <head>
                <script dangerouslySetInnerHTML={{ __html: themeScript }} />
            </head>
            <body className={`${inter.variable} ${playfair.variable} antialiased bg-vc-bg text-vc-text transition-colors duration-200`}>
                <Suspense>
                    <SessionProvider>
                        <ThemeProvider>{children}</ThemeProvider>
                    </SessionProvider>
                </Suspense>
            </body>
        </html>
    );
}
