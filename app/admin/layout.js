import { createClient } from '@/lib/supabase/server';
import AdminLayout from '../../components/layouts/AdminLayout';

export default async function Layout({ children }) {
    const supabase = await createClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();

    let user = null;

    if (authUser) {
        // Fetch complete profile data including avatar_url
        const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', authUser.id)
            .single();

        // Combine auth user with profile data
        user = {
            id: authUser.id,
            email: authUser.email || profile?.email,
            name: profile?.full_name || authUser.user_metadata?.full_name || 'User',
            role: profile?.role || authUser.user_metadata?.role || 'customer',
            avatar: profile?.avatar_url || null
        };
    }

    return <AdminLayout user={user}>{children}</AdminLayout>;
}
