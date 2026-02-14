import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import '@/styles/globals.css';
import { SessionProvider } from '@/components/SessionProvider';

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

export const metadata: Metadata = {
    title: {
        default: 'VibeCoder Marketplace',
        template: '%s | VibeCoder',
    },
    description: 'Plug-and-play developer showcase marketplace. Show your work from anywhere.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={`${inter.variable} ${playfair.variable} antialiased`}>
                <SessionProvider>{children}</SessionProvider>
            </body>
        </html>
    );
}
