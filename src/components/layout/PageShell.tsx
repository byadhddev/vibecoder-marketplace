import type { ReactNode } from 'react';

interface PageShellProps {
    children: ReactNode;
    variant?: 'default' | 'narrow';
    className?: string;
    backgroundStyle?: 'grid' | 'none';
    theme?: 'paper' | 'transparent';
}

export function PageShell({
    children,
    variant = 'narrow',
    className = '',
    backgroundStyle = 'grid',
    theme = 'paper',
}: PageShellProps) {
    const maxWidthClass = variant === 'narrow' ? 'max-w-[900px]' : 'max-w-[1100px]';

    const containerClasses = theme === 'paper'
        ? 'bg-white min-h-screen shadow-[0_0_50px_-12px_rgba(0,0,0,0.08)] border-x border-[#ededeb]'
        : 'min-h-screen';

    return (
        <div className="min-h-screen w-full bg-[#fbfbfa] text-[#37352f] relative">
            {backgroundStyle === 'grid' && (
                <div
                    className="fixed inset-0 pointer-events-none opacity-[0.4]"
                    style={{
                        backgroundImage: 'linear-gradient(#e5e5e5 1px, transparent 1px), linear-gradient(90deg, #e5e5e5 1px, transparent 1px)',
                        backgroundSize: '24px 24px',
                    }}
                />
            )}
            <div className={`relative mx-auto px-6 py-8 md:px-20 md:py-20 flex flex-col ${containerClasses} ${maxWidthClass} ${className}`}>
                {children}
            </div>
        </div>
    );
}
