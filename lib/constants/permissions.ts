// lib/constants/permissions.ts
// Role-based access control for sidebar menu groups and admin routes.
// Keep in sync with middleware.ts and lib/constants/roles.ts.

import type { Role } from './roles';

/** Which sidebar menu groups each role can see */
export const MENU_ACCESS: Record<string, readonly Role[]> = {
    MAIN: ['super_admin', 'admin', 'ops_manager', 'relocation_coordinator', 'finance', 'driver', 'staff'],
    OPERATIONS: ['super_admin', 'admin', 'ops_manager', 'relocation_coordinator', 'driver', 'staff'],
    'CRM & ASSETS': ['super_admin', 'admin', 'ops_manager', 'relocation_coordinator', 'staff'],
    FINANCE: ['super_admin', 'admin', 'finance'],
    SYSTEM: ['super_admin', 'admin'],
};

/** Route-level overrides for specific paths */
export const ROUTE_ACCESS: Record<string, readonly Role[]> = {
    '/admin/users': ['super_admin', 'admin'],
    '/admin/settings': ['super_admin', 'admin'],
    '/admin/themes': ['super_admin', 'admin'],
    '/admin/summary': ['super_admin', 'admin', 'finance'],
    '/admin/quotes': ['super_admin', 'admin', 'finance', 'ops_manager'],
    '/admin/invoices': ['super_admin', 'admin', 'finance'],
    '/admin/expenses': ['super_admin', 'admin', 'finance'],
    '/admin/reports': ['super_admin', 'admin', 'finance'],
};

/** Check if a role can access a specific route */
export function canAccessRoute(role: Role, route: string): boolean {
    const specificAccess = ROUTE_ACCESS[route];
    if (specificAccess) return specificAccess.includes(role);
    // Default: any non-customer role can access admin routes
    return role !== 'customer';
}

/** Check if a role can see a sidebar menu group */
export function canAccessMenuGroup(role: Role, group: string): boolean {
    const access = MENU_ACCESS[group];
    if (!access) return false;
    return access.includes(role);
}
