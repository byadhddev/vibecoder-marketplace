import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'Terms of Service — vibeminis',
    description: 'Terms and conditions for using vibeminis by Artode.',
};

export default function TermsPage() {
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
                        <Link href="/cookies" className="hover:text-vc-text transition-colors">Cookies</Link>
                    </div>
                </nav>

                {/* Header */}
                <header className="pt-12 pb-8 mb-10 border-b border-vc-border">
                    <h1 className="text-3xl md:text-4xl font-serif tracking-[-0.02em] mb-3">Terms of Service</h1>
                    <p className="text-[11px] text-vc-text-secondary font-sans">Last updated: February 2026</p>
                </header>

                {/* Content */}
                <main className="pb-16 space-y-10">
                    <section>
                        <h2 className="text-base font-serif mb-2">1. Service</h2>
                        <p className="text-[13px] text-vc-text/70 leading-7">
                            vibeminis is a waitlist and builder discovery platform provided by Artode. By using the service, you agree to these terms. The service allows AI-native builders to create profiles, showcase their work, and get discovered by potential clients.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-base font-serif mb-2">2. Accounts</h2>
                        <p className="text-[13px] text-vc-text/70 leading-7">
                            Authentication is handled through GitHub OAuth. You are responsible for your account and the content associated with your profile. We reserve the right to remove accounts or content that violates these terms.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-base font-serif mb-2">3. Content</h2>
                        <p className="text-[13px] text-vc-text/70 leading-7">
                            You retain ownership of all content associated with your profile, including your name, avatar, bio, and showcase projects. By joining vibeminis, you grant Artode a non-exclusive license to display your public profile information on the platform.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-base font-serif mb-2">4. Acceptable Use</h2>
                        <p className="text-[13px] text-vc-text/70 leading-7">
                            You agree not to use the service for any unlawful purpose, to impersonate others, or to submit false or misleading information. We reserve the right to suspend or terminate accounts that violate these guidelines.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-base font-serif mb-2">5. Liability</h2>
                        <p className="text-[13px] text-vc-text/70 leading-7">
                            The service is provided &ldquo;as is&rdquo; without warranties of any kind, express or implied. Artode is not liable for any damages arising from your use of the service. We may modify or discontinue the service at any time with reasonable notice.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-base font-serif mb-2">6. Changes</h2>
                        <p className="text-[13px] text-vc-text/70 leading-7">
                            We may update these terms from time to time. Continued use of vibeminis after changes constitutes acceptance of the updated terms. Material changes will be communicated through the platform.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-base font-serif mb-2">7. Contact</h2>
                        <p className="text-[13px] text-vc-text/70 leading-7">
                            For questions about these terms, contact us at <a href="mailto:adhd.paws@gmail.com" className="underline underline-offset-2 hover:text-vc-text transition-colors">adhd.paws@gmail.com</a>.
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
