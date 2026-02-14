import Link from 'next/link';

interface FooterLink {
    href: string;
    label: string;
}

const DEFAULT_LINKS: FooterLink[] = [
    { href: '/', label: 'Home' },
    { href: '/explore', label: 'Explore' },
    { href: '/manager', label: 'Manager' },
];

interface FooterProps {
    links?: FooterLink[];
}

export function Footer({ links = DEFAULT_LINKS }: FooterProps) {
    return (
        <footer className="mt-20 pt-8 border-t border-[#ebebeb] text-[#9b9a97] text-sm flex flex-col md:flex-row justify-between items-center gap-6 md:gap-0">
            <div className="italic text-[#37352f] font-serif flex items-center gap-2 shrink-0 whitespace-nowrap">
                <div className="w-2 h-2 bg-brand-red" />
                VibeCoder Marketplace
            </div>
            <div className="flex flex-wrap items-center justify-center md:justify-end gap-x-6 gap-y-3">
                {links.map(link => (
                    <Link
                        key={link.href}
                        href={link.href}
                        className="hover:text-[#37352f] transition-colors hover:underline decoration-dotted underline-offset-4"
                    >
                        {link.label}
                    </Link>
                ))}
                <span className="shrink-0 whitespace-nowrap">© 2026</span>
            </div>
        </footer>
    );
}
