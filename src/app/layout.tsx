import { Suspense } from 'react';
import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
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
const themeScript = `(function(){try{var t=localStorage.getItem('vc-theme');var d=t==='light'?false:(t==='dark'||true);if(d)document.documentElement.classList.add('dark')}catch(e){document.documentElement.classList.add('dark')}})()`;

export const metadata: Metadata = {
    metadataBase: new URL('https://vibeminis.byadhd.dev'),
    title: {
        default: 'vibeminis — Where Vibe Coders Meet Their Next Build',
        template: '%s | vibeminis',
    },
    description: 'The waitlist for AI-native builders. Showcase real projects, get discovered, earn what you deserve.',
    keywords: ['vibe coding', 'AI developer', 'freelance', 'marketplace', 'hire developer', 'showcase', 'portfolio'],
    openGraph: {
        title: 'vibeminis',
        description: 'The waitlist for AI-native builders. Get discovered. Land real projects.',
        type: 'website',
        siteName: 'vibeminis',
        url: 'https://vibeminis.byadhd.dev',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'vibeminis',
        description: 'Get discovered. Land real projects. Earn what you deserve.',
    },
    robots: { index: true, follow: true },
    alternates: { canonical: 'https://vibeminis.byadhd.dev' },
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
                <Analytics />
                <SpeedInsights />
            </body>
        </html>
    );
}
