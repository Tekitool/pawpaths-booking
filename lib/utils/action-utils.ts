// lib/utils/action-utils.ts
// Shared type and utilities for server actions.

import { z } from 'zod';

/**
 * Standard return type for all mutation server actions.
 * Every action should return this shape — never throw.
 */
export type ActionResult<T = void> = {
    success: true;
    message?: string;
    data?: T;
} | {
    success: false;
    message: string;
    fieldErrors?: Record<string, string[]>;
};

/**
 * Validate input with a Zod schema and return a standardised ActionResult on failure.
 * On success, returns the parsed data.
 */
export function validateInput<T extends z.ZodTypeAny>(
    schema: T,
    data: unknown,
): { ok: true; data: z.infer<T> } | { ok: false; result: ActionResult } {
    const parsed = schema.safeParse(data);
    if (!parsed.success) {
        return {
            ok: false,
            result: {
                success: false,
                message: 'Validation failed',
                fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
            },
        };
    }
    return { ok: true, data: parsed.data };
}

/**
 * Wrap an async action body so unhandled errors become ActionResult instead of thrown.
 */
export async function safeAction<T>(
    fn: () => Promise<ActionResult<T>>,
): Promise<ActionResult<T>> {
    try {
        return await fn();
    } catch (err) {
        console.error('[safeAction]', err);
        return {
            success: false,
            message: err instanceof Error ? err.message : 'An unexpected error occurred',
        };
    }
}
