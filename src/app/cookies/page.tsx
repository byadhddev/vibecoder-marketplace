import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'Cookie Policy — vibeminis',
    description: 'How vibeminis uses cookies and similar technologies.',
};

export default function CookiesPage() {
    return (
        <div className="min-h-screen bg-vc-bg text-vc-text">
            <div className="mx-auto max-w-[700px] px-5 md:px-12 bg-vc-surface min-h-screen border-x border-vc-border">
                {/* Nav */}
                <nav className="flex items-center justify-between h-12 border-b border-vc-border">
                    <Link href="/" className="group flex items-center gap-2 text-[11px] font-serif tracking-[0.05em] text-vc-text-secondary hover:text-vc-text transition-colors">
                        <span className="group-hover:-translate-x-0.5 transition-transform inline-block">←</span>
                        <span>vibeminis</span>
                    </Link>
                    <div className="flex items-center gap-4 text-[9px] font-sans uppercase tracking-[0.2em] text-vc-text-secondary/40">
                        <Link href="/privacy" className="hover:text-vc-text transition-colors">Privacy</Link>
                        <Link href="/terms" className="hover:text-vc-text transition-colors">Terms</Link>
                    </div>
                </nav>

                {/* Header */}
                <header className="pt-12 pb-8 mb-10 border-b border-vc-border">
                    <h1 className="text-3xl md:text-4xl font-serif tracking-[-0.02em] mb-3">Cookie Policy</h1>
                    <p className="text-[11px] text-vc-text-secondary font-sans">Last updated: February 2026</p>
                </header>

                {/* Content */}
                <main className="pb-16 space-y-10">
                    <section>
                        <h2 className="text-base font-serif mb-2">1. What Are Cookies</h2>
                        <p className="text-[13px] text-vc-text/70 leading-7">
                            Cookies are small text files stored on your device when you visit a website. They help the site remember your preferences and improve your experience. vibeminis uses a minimal set of cookies essential for the service to function.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-base font-serif mb-2">2. Essential Cookies</h2>
                        <p className="text-[13px] text-vc-text/70 leading-7">
                            We use session cookies for GitHub OAuth authentication. These cookies are strictly necessary for the service to work and cannot be disabled. They are automatically deleted when you close your browser or after the session expires.
                        </p>
                        <div className="mt-4 border border-vc-border rounded-lg overflow-hidden">
                            <table className="w-full text-[11px]">
                                <thead>
                                    <tr className="border-b border-vc-border bg-vc-surface-raised">
                                        <th className="text-left px-4 py-2 font-sans uppercase tracking-wider text-vc-text-secondary">Cookie</th>
                                        <th className="text-left px-4 py-2 font-sans uppercase tracking-wider text-vc-text-secondary">Purpose</th>
                                        <th className="text-left px-4 py-2 font-sans uppercase tracking-wider text-vc-text-secondary">Duration</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="border-b border-vc-border">
                                        <td className="px-4 py-2 font-mono text-vc-text/60">next-auth.session-token</td>
                                        <td className="px-4 py-2 text-vc-text/70">Authentication session</td>
                                        <td className="px-4 py-2 text-vc-text/60">Session</td>
                                    </tr>
                                    <tr className="border-b border-vc-border">
                                        <td className="px-4 py-2 font-mono text-vc-text/60">next-auth.csrf-token</td>
                                        <td className="px-4 py-2 text-vc-text/70">CSRF protection</td>
                                        <td className="px-4 py-2 text-vc-text/60">Session</td>
                                    </tr>
                                    <tr>
                                        <td className="px-4 py-2 font-mono text-vc-text/60">vc-theme</td>
                                        <td className="px-4 py-2 text-vc-text/70">Theme preference</td>
                                        <td className="px-4 py-2 text-vc-text/60">Persistent</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-base font-serif mb-2">3. Analytics</h2>
                        <p className="text-[13px] text-vc-text/70 leading-7">
                            We may use Vercel Analytics to collect anonymous, aggregated usage data such as page views and performance metrics. This data does not identify individual users and is used solely to improve the service. No third-party tracking cookies are used.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-base font-serif mb-2">4. Third-Party Cookies</h2>
                        <p className="text-[13px] text-vc-text/70 leading-7">
                            vibeminis does not use any third-party advertising or tracking cookies. We do not share cookie data with external parties. The only external service involved is GitHub for authentication.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-base font-serif mb-2">5. Managing Cookies</h2>
                        <p className="text-[13px] text-vc-text/70 leading-7">
                            You can control cookies through your browser settings. Disabling essential cookies may prevent you from signing in. Theme preferences are stored in localStorage and can be cleared through your browser&apos;s developer tools.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-base font-serif mb-2">6. Contact</h2>
                        <p className="text-[13px] text-vc-text/70 leading-7">
                            For questions about our cookie practices, contact us at <a href="mailto:adhd.paws@gmail.com" className="underline underline-offset-2 hover:text-vc-text transition-colors">adhd.paws@gmail.com</a>.
                        </p>
                    </section>
                </main>

                {/* Footer */}
                <footer className="border-t border-vc-border flex items-center justify-between h-12 text-[10px] text-vc-text/30">
                    <span className="font-serif text-vc-text/60">vibeminis</span>
                    <span className="font-sans uppercase tracking-[0.15em]">© 2026</span>
                </footer>
            </div>
        </div>
    );
}
