import Link from 'next/link';

interface FooterLink {
    href: string;
    label: string;
}

interface FooterProps {
    links?: FooterLink[];
}

export function Footer({ links }: FooterProps) {
    const defaultLinks: FooterLink[] = [
        { href: '/', label: 'Home' },
        { href: '/manager', label: 'Manager' },
    ];
    const items = links || defaultLinks;

    return (
        <footer className="mt-auto flex items-center justify-between py-4 border-t border-[#ededeb]">
            <div className="flex items-center gap-4">
                {items.map(link => (
                    <Link
                        key={link.href}
                        href={link.href}
                        className="text-[10px] font-mono uppercase tracking-widest text-[#9b9a97] hover:text-[#37352f] transition-colors"
                    >
                        {link.label}
                    </Link>
                ))}
            </div>
            <span className="text-[9px] font-mono text-[#d5d5d3]">VibeCoder</span>
        </footer>
    );
}
