import { redirect } from 'next/navigation';
import { isAdmin } from '@/lib/admin';
import { AdminDashboard } from './AdminDashboard';

export default async function AdminPage() {
    const { isAdmin: admin } = await isAdmin();
    if (!admin) redirect('/');
    return <AdminDashboard />;
}
