import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { isAdmin } from '@/lib/admin';
import dynamic from 'next/dynamic';

const AdminDashboard = dynamic(() => import('./AdminDashboard').then(m => m.AdminDashboard), {
    loading: () => (
        <div className="flex items-center justify-center min-h-[400px]">
            <span className="text-sm font-mono text-[#9b9a97]">Loading dashboard...</span>
        </div>
    ),
});

export default async function AdminPage() {
    const { isAdmin: admin } = await isAdmin();
    if (!admin) redirect('/');
    return (
        <Suspense fallback={<div className="flex items-center justify-center min-h-[400px]"><span className="text-sm font-mono text-[#9b9a97]">Loading...</span></div>}>
            <AdminDashboard />
        </Suspense>
    );
}
