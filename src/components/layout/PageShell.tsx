import type { ReactNode } from 'react';

interface PageShellProps {
    children: ReactNode;
}

export function PageShell({ children }: PageShellProps) {
    return (
        <div className="min-h-screen flex flex-col max-w-3xl mx-auto px-4 md:px-8 py-6 gap-6">
            {children}
        </div>
    );
}
