// lib/validations/user-schema.ts
// Shared schema, types, and helpers for user management forms.

import * as z from 'zod';
import { ROLES, type Role } from '@/lib/constants/roles';

export const editUserSchema = z.object({
    firstName: z.string().min(2, 'Minimum 2 characters'),
    lastName: z.string().min(2, 'Minimum 2 characters'),
    email: z.string().email(),
    phone: z.string().optional(),
    role: z.enum(ROLES),
    status: z.boolean(),
});

export type EditUserFormValues = z.infer<typeof editUserSchema>;

export interface EditUserModalUser {
    id: string;
    full_name: string;
    email: string;
    phone?: string | null;
    role: Role;
    is_active: boolean;
    avatar_url?: string | null;
}

export function splitName(fullName: string): [string, string] {
    const parts = fullName.trim().split(' ');
    return [parts[0] ?? '', parts.slice(1).join(' ')];
}

export function inputCls(hasError: boolean): string {
    return [
        'w-full px-3 py-2 bg-white border rounded-lg text-sm text-gray-900 transition-all outline-none placeholder:text-gray-300',
        hasError
            ? 'border-red-300 focus:ring-2 focus:ring-red-100'
            : 'border-gray-200 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300',
    ].join(' ');
}
