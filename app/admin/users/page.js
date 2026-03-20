import { createClient } from '@/lib/supabase/server';
import { getUsers } from '@/lib/actions/user-actions';
import UsersClient from './UsersClient';

const PAGE_SIZE = 15;

export default async function UsersPage(props) {
    const searchParams = await props.searchParams;
    const query = searchParams?.query || '';
    const page = Math.max(1, Number(searchParams?.page) || 1);

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

    // Fetch users with pagination
    const { data: users, total, totalPages } = await getUsers({ page, pageSize: PAGE_SIZE, query });

    return (
        <UsersClient
            initialUsers={users}
            isAdmin={isAdmin}
            initialQuery={query}
            currentPage={page}
            totalPages={totalPages}
            totalItems={total}
            pageSize={PAGE_SIZE}
        />
    );
}
