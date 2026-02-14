import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { connection } from 'next/server';
import { isAdmin } from '@/lib/admin';
import { Skeleton } from '@/components/ui/Skeleton';
import { GRID_CLASSES } from '@/lib/vibe';
import dynamic from 'next/dynamic';

function AdminSkeleton() {
    return (
        <div className="max-w-[900px] mx-auto px-6 py-8 md:px-20 md:py-20">
            <div className={GRID_CLASSES}>
                <Skeleton.ArtodeTile />
                <Skeleton.TitleTile />
                <Skeleton.CounterTile />
                <Skeleton.Tile span={4} minH="60px" lines={1} />
                {Array.from({ length: 6 }).map((_, i) => (
                    <Skeleton.Tile key={i} span={2} minH="70px" lines={2} />
                ))}
            </div>
        </div>
    );
}

const AdminDashboard = dynamic(() => import('./AdminDashboard').then(m => m.AdminDashboard), {
    loading: () => <AdminSkeleton />,
});

export default async function AdminPage() {
    await connection();
    const { isAdmin: admin } = await isAdmin();
    if (!admin) redirect('/');
    return (
        <Suspense fallback={<AdminSkeleton />}>
            <AdminDashboard />
        </Suspense>
    );
}
