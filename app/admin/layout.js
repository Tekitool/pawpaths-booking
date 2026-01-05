import { createClient } from '@/lib/supabase/server';
import AdminLayout from '../../components/layouts/AdminLayout';

export default async function Layout({ children }) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    return <AdminLayout user={user}>{children}</AdminLayout>;
}
