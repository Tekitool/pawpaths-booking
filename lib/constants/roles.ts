// lib/constants/roles.ts
// Single source of truth for the role system.
// Authoritative enum lives in supabase/sql/01_enums.sql (user_role_type).
// Keep both in sync if roles are ever added or removed.

import {
    Crown, Shield, Briefcase, Navigation2, DollarSign, Truck, Users, User,
} from 'lucide-react';
import type { ElementType } from 'react';

export const ROLES = [
    'super_admin',
    'admin',
    'ops_manager',
    'relocation_coordinator',
    'finance',
    'driver',
    'staff',
    'customer',
] as const;

export type Role = (typeof ROLES)[number];

export interface RoleMeta {
    label: string;
    description: string;
    Icon: ElementType;
    /** Tailwind classes for the pill/chip badge */
    badgeCls: string;
    /** Tailwind classes for the selected row highlight */
    selectedCls: string;
}

export const ROLE_META: Record<Role, RoleMeta> = {
    super_admin: {
        label: 'Super Admin',
        description: 'Unrestricted system control',
        Icon: Crown,
        badgeCls: 'bg-violet-100 text-violet-700 border-violet-200',
        selectedCls: 'bg-violet-50/70 border-violet-300 ring-1 ring-violet-200',
    },
    admin: {
        label: 'Admin',
        description: 'User & settings management',
        Icon: Shield,
        badgeCls: 'bg-indigo-100 text-indigo-700 border-indigo-200',
        selectedCls: 'bg-indigo-50/70 border-indigo-300 ring-1 ring-indigo-200',
    },
    ops_manager: {
        label: 'Ops Manager',
        description: 'Bookings & logistics oversight',
        Icon: Briefcase,
        badgeCls: 'bg-blue-100 text-blue-700 border-blue-200',
        selectedCls: 'bg-blue-50/50 border-blue-200 ring-1 ring-blue-100',
    },
    relocation_coordinator: {
        label: 'Coordinator',
        description: 'Relocation case management',
        Icon: Navigation2,
        badgeCls: 'bg-cyan-100 text-cyan-700 border-cyan-200',
        selectedCls: 'bg-cyan-50/50 border-cyan-200 ring-1 ring-cyan-100',
    },
    finance: {
        label: 'Finance',
        description: 'Invoices & payment access',
        Icon: DollarSign,
        badgeCls: 'bg-emerald-100 text-emerald-700 border-emerald-200',
        selectedCls: 'bg-emerald-50/50 border-emerald-200 ring-1 ring-emerald-100',
    },
    driver: {
        label: 'Driver',
        description: 'Assigned task access only',
        Icon: Truck,
        badgeCls: 'bg-amber-100 text-amber-700 border-amber-200',
        selectedCls: 'bg-amber-50/50 border-amber-200 ring-1 ring-amber-100',
    },
    staff: {
        label: 'Staff',
        description: 'Standard operations access',
        Icon: Users,
        badgeCls: 'bg-teal-100 text-teal-700 border-teal-200',
        selectedCls: 'bg-teal-50/50 border-teal-200 ring-1 ring-teal-100',
    },
    customer: {
        label: 'Customer',
        description: 'Profile & booking read access',
        Icon: User,
        badgeCls: 'bg-gray-100 text-gray-600 border-gray-200',
        selectedCls: 'bg-gray-50/70 border-gray-300 ring-1 ring-gray-200',
    },
};

/**
 * Client-side privilege gate — which roles a caller may assign.
 * The server action (manageUser.ts → updateUserAction) re-validates
 * this unconditionally; this map is only for UI gating.
 *
 * super_admin → unrestricted
 * admin       → cannot create peer admins or super admins
 */
export const ASSIGNABLE: Partial<Record<string, readonly Role[]>> = {
    super_admin: ROLES,
    admin: ['ops_manager', 'relocation_coordinator', 'finance', 'driver', 'staff', 'customer'],
};
