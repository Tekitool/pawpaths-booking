'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { STORAGE_BUCKETS } from '@/lib/services/storage';

/**
 * Generates a signed URL for a secure document using Admin privileges.
 * 
 * SECURITY WARNING: 
 * In a production app, you MUST verify that the current user (from cookies)
 * actually owns this file or has permission to view it before generating this URL.
 * 
 * For this demo/test, we are bypassing RLS to allow the download.
 */
export async function generateSignedUrl(path) {
    if (!path) return null;

    try {
        const supabaseAdmin = createAdminClient();

        const { data, error } = await supabaseAdmin.storage
            .from(STORAGE_BUCKETS.DOCUMENTS)
            .createSignedUrl(path, 60); // Valid for 60 seconds

        if (error) {
            console.error('Admin Signed URL Error:', error);
            return null;
        }

        return data.signedUrl;
    } catch (error) {
        console.error('Server Action Error:', error);
        return null;
    }
}
