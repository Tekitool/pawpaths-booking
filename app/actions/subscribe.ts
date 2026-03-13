'use server';

import { createClient } from '@/lib/supabase/server';

/**
 * Server Action to handle newsletter subscriptions.
 * Validates the email and inserts it into the 'subscribers' table.
 */
export async function subscribeToNewsletter(email: string) {
    if (!email || !email.includes('@')) {
        return {
            success: false,
            message: 'Please provide a valid email address.',
        };
    }

    try {
        const supabase = await createClient();

        const { error } = await supabase
            .from('subscribers')
            .insert({ email: email.toLowerCase().trim() });

        if (error) {
            // Check for unique constraint violation (code 23505 or common message strings)
            const isDuplicate =
                error.code === '23505' ||
                error.message?.toLowerCase().includes('already exists') ||
                error.message?.toLowerCase().includes('unique');

            if (isDuplicate) {
                return {
                    success: false,
                    message: 'You are already subscribed to our newsletter!',
                };
            }

            console.error('Subscription error:', error);
            return {
                success: false,
                message: error.message || 'Something went wrong. Please try again later.',
            };
        }

        return {
            success: true,
            message: 'Thank you for subscribing to Pawpaths!',
        };
    } catch (err) {
        console.error('Unexpected subscription error:', err);
        return {
            success: false,
            message: 'An unexpected error occurred. Please try again.',
        };
    }
}
