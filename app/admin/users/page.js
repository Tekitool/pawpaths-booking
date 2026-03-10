import { createClient } from '@/lib/supabase/server';
import { getUsers } from '@/lib/actions/user-actions';
import UsersClient from './UsersClient';

export default async function UsersPage(props) {
    const searchParams = await props.searchParams;
    const query = searchParams?.query || '';

    // Server-side auth check
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    let isAdmin = false;
    if (user) {
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        const role = profile?.role?.toLowerCase();
        isAdmin = role === 'admin' || role === 'super_admin';
    }

    // Fetch users server-side
    const users = await getUsers();

    return (
        <UsersClient
            initialUsers={users}
            isAdmin={isAdmin}
            initialQuery={query}
        />
    );
}
