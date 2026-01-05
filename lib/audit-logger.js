import { createClient } from '@/lib/supabase/server';

/**
 * Logs a system audit action.
 * @param {Object} supabase - The Supabase client instance.
 * @param {string} table - The table name of the entity.
 * @param {string} id - The ID of the entity.
 * @param {string} action - 'UPDATE' | 'DELETE' | 'CREATE'
 * @param {string} reason - The mandatory reason note.
 * @param {Object} [metadata] - Optional metadata (e.g., old values).
 */
export async function logAuditAction(supabase, table, id, action, reason, metadata = {}) {
    try {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            console.warn('Audit Log Warning: No authenticated user found.');
            return;
        }

        // Check if user is admin (Optional: Enforce strict RBAC here if needed)
        // For now, we assume the calling server action has already checked permissions.

        const { error } = await supabase.from('system_audit_logs').insert({
            actor_id: user.id,
            action_type: action,
            entity_table: table,
            entity_id: id,
            reason_note: reason,
            metadata: metadata
        });

        if (error) {
            console.error('FAILED TO LOG AUDIT:', error);
            throw new Error(`Audit Log Failed: ${error.message}`);
        }

    } catch (err) {
        console.error('Audit Log System Error:', err);
    }
}
