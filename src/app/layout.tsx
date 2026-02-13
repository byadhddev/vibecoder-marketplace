import type { Metadata } from 'next';
import '@/styles/globals.css';
import { SessionProvider } from '@/components/SessionProvider';

export const metadata: Metadata = {
    title: 'VibeCoder Marketplace',
    description: 'Plug-and-play developer showcase marketplace. Show your work from anywhere.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <body>
                <SessionProvider>{children}</SessionProvider>
            </body>
        </html>
    );
}
