import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'Privacy Policy — vibeminis',
    description: 'How vibeminis by Artode handles your data.',
};

export default function PrivacyPage() {
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
                        <Link href="/terms" className="hover:text-vc-text transition-colors">Terms</Link>
                        <Link href="/cookies" className="hover:text-vc-text transition-colors">Cookies</Link>
                    </div>
                </nav>

                {/* Header */}
                <header className="pt-12 pb-8 mb-10 border-b border-vc-border">
                    <h1 className="text-3xl md:text-4xl font-serif tracking-[-0.02em] mb-3">Privacy Policy</h1>
                    <p className="text-[11px] text-vc-text-secondary font-sans">Last updated: February 2026</p>
                </header>

                {/* Content */}
                <main className="pb-16 space-y-10">
                    <section>
                        <h2 className="text-base font-serif mb-2">1. Data We Collect</h2>
                        <p className="text-[13px] text-vc-text/70 leading-7">
                            When you sign in with GitHub, we receive your public profile information including name, username, avatar URL, and email address. This is the minimum data required to create your waitlist profile on vibeminis.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-base font-serif mb-2">2. How We Use Your Data</h2>
                        <p className="text-[13px] text-vc-text/70 leading-7">
                            Your data is used solely to display your profile in the vibeminis builder grid and manage your waitlist position. We do not sell, rent, or share your personal data with third parties. Anonymous, aggregated analytics may be collected to improve the service.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-base font-serif mb-2">3. Storage &amp; Security</h2>
                        <p className="text-[13px] text-vc-text/70 leading-7">
                            All data is stored securely with encryption in transit and at rest. Avatar images are fetched from GitHub and are not stored on our servers. We use industry-standard security practices to protect your information.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-base font-serif mb-2">4. Your Rights</h2>
                        <p className="text-[13px] text-vc-text/70 leading-7">
                            You may request deletion of your account and all associated data at any time by contacting us. Your profile is public by default. You control what information is displayed through your GitHub profile settings.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-base font-serif mb-2">5. Cookies</h2>
                        <p className="text-[13px] text-vc-text/70 leading-7">
                            We use essential session cookies for authentication only. We use Vercel Analytics for anonymous usage metrics. No third-party tracking cookies are used. See our <Link href="/cookies" className="underline underline-offset-2 hover:text-vc-text transition-colors">Cookie Policy</Link> for details.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-base font-serif mb-2">6. Contact</h2>
                        <p className="text-[13px] text-vc-text/70 leading-7">
                            For privacy-related questions, contact us at <a href="mailto:adhd.paws@gmail.com" className="underline underline-offset-2 hover:text-vc-text transition-colors">adhd.paws@gmail.com</a>.
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
