import React from 'react';
import { supabaseAdmin } from '@/lib/supabase/admin';
import UserForm from './UserForm';
import { redirect } from 'next/navigation';

interface PageProps {
    params: Promise<{ userId: string }> | { userId: string };
}

export default async function UserPage({ params }: PageProps) {
    // Await params if it's a promise (Next.js 15+)
    const resolvedParams = await Promise.resolve(params);
    const { userId } = resolvedParams;
    const isNew = userId === 'new';

    let initialData = null;

    if (!isNew) {
        console.log('[UserPage] Fetching user with ID:', userId);

        const { data, error } = await supabaseAdmin
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

        if (error) {
            console.error('[UserPage] Error fetching user:', error);
            console.error('[UserPage] Error details:', JSON.stringify(error, null, 2));
            // redirect to users page on error
            redirect('/admin/users');
        }

        if (data) {
            console.log('[UserPage] User data fetched:', JSON.stringify(data, null, 2));
            initialData = data;
        } else {
            console.log('[UserPage] No user data found for ID:', userId);
            redirect('/admin/users');
        }
    }

    console.log('[UserPage] Rendering UserForm with initialData:', initialData ? 'Yes' : 'No');
    return <UserForm userId={userId} initialData={initialData} isNew={isNew} />;
}
