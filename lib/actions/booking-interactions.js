'use server';

import { createClient } from '@/lib/supabase/server';
import { logAuditAction } from '@/lib/audit-logger';

// Helper to fetch current user profile (agent)
async function getCurrentAgent() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Unauthenticated');

    const { data: profile } = await supabase
        .from('profiles')
        .select('id, display_name')
        .eq('auth_id', user.id)
        .single();

    return profile || { id: user.id, display_name: user.email };
}

// ---- Insert a new interaction ----
export async function addBookingInteraction({
    bookingId,
    action_type,
    note_content,
    is_internal = true,
}) {
    const supabase = await createClient();
    const agent = await getCurrentAgent();

    const { data, error } = await supabase
        .from('booking_interactions')
        .insert({
            booking_id: bookingId,
            author_id: agent.id,
            action_type,
            note_content,
            is_internal,
        })
        .select()
        .single();

    if (error) throw error;

    // Optional: also log to the global audit log for full traceability
    try {
        await logAuditAction({
            entity: 'booking_interactions',
            entity_id: data.id,
            action: 'add_note',
            payload: { action_type, note_content, is_internal },
            user_id: agent.id,
        });
    } catch (auditError) {
        console.error('Audit log failed but interaction saved:', auditError);
    }

    // Return a shape the UI expects
    return {
        id: data.id,
        author_name: agent.display_name,
        action_type,
        note_content,
        is_internal,
        created_at: data.created_at,
    };
}

// ---- Fetch interactions for a booking (newest first) ----
export async function getBookingInteractions(bookingId) {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('booking_interactions')
        .select('id, author_id, action_type, note_content, is_internal, created_at')
        .eq('booking_id', bookingId)
        .order('created_at', { ascending: false });

    if (error) throw error;

    // Resolve author names in a single batch request
    const authorIds = [...new Set(data.map((i) => i.author_id).filter(Boolean))];

    if (authorIds.length === 0) return data.map(i => ({ ...i, author_name: 'System' }));

    const { data: authors } = await supabase
        .from('profiles')
        .select('id, display_name')
        .in('id', authorIds);

    const authorMap = Object.fromEntries(
        (authors || []).map((a) => [a.id, a.display_name])
    );

    return data.map((i) => ({
        ...i,
        author_name: authorMap[i.author_id] || 'Unknown',
    }));
}
