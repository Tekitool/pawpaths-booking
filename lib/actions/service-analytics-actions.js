'use server';

import { createClient } from '@/lib/supabase/server';

async function _requireFinanceRole(supabase) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Unauthorized');

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    const allowed = ['admin', 'super_admin', 'finance_manager', 'finance_staff'];
    if (!profile || !allowed.includes(profile.role)) {
        throw new Error('Insufficient permissions');
    }
    return user;
}

/**
 * Revenue breakdown by service — uses finance_items.service_id FK.
 * Returns top 15 services by total invoiced revenue in the date range.
 */
export async function getServiceRevenueBreakdown(dateRange = {}) {
    const supabase = await createClient();
    await _requireFinanceRole(supabase);

    const from = dateRange.from || new Date(new Date().getFullYear(), 0, 1).toISOString();
    const to = dateRange.to || new Date().toISOString();

    const { data, error } = await supabase
        .from('finance_items')
        .select(`
            service_id,
            unit_price,
            quantity,
            service:service_catalog(id, name, code, category:service_categories(name))
        `)
        .not('service_id', 'is', null)
        .gte('created_at', from)
        .lte('created_at', to);

    if (error) {
        console.error('getServiceRevenueBreakdown error:', error);
        return { success: false, data: [] };
    }

    // Aggregate by service
    const map = new Map();
    for (const item of data || []) {
        if (!item.service_id) continue;
        const existing = map.get(item.service_id) || {
            service_id: item.service_id,
            name: item.service?.name || 'Unknown',
            code: item.service?.code || '',
            category: item.service?.category?.name || '',
            total_revenue: 0,
            line_count: 0,
        };
        existing.total_revenue += (item.unit_price || 0) * (item.quantity || 1);
        existing.line_count += 1;
        map.set(item.service_id, existing);
    }

    const result = Array.from(map.values())
        .sort((a, b) => b.total_revenue - a.total_revenue)
        .slice(0, 15);

    return { success: true, data: result };
}

/**
 * Most booked services — uses booking_services table.
 * Returns top 15 services by number of bookings.
 */
export async function getTopServicesByBookings(dateRange = {}) {
    const supabase = await createClient();
    await _requireFinanceRole(supabase);

    const from = dateRange.from || new Date(new Date().getFullYear(), 0, 1).toISOString();
    const to = dateRange.to || new Date().toISOString();

    const { data, error } = await supabase
        .from('booking_services')
        .select(`
            service_id,
            quantity,
            unit_price,
            service:service_catalog(id, name, code)
        `)
        .gte('created_at', from)
        .lte('created_at', to);

    if (error) {
        console.error('getTopServicesByBookings error:', error);
        return { success: false, data: [] };
    }

    const map = new Map();
    for (const row of data || []) {
        if (!row.service_id) continue;
        const existing = map.get(row.service_id) || {
            service_id: row.service_id,
            name: row.service?.name || 'Unknown',
            code: row.service?.code || '',
            booking_count: 0,
            total_revenue: 0,
        };
        existing.booking_count += 1;
        existing.total_revenue += (row.unit_price || 0) * (row.quantity || 1);
        map.set(row.service_id, existing);
    }

    const result = Array.from(map.values())
        .sort((a, b) => b.booking_count - a.booking_count)
        .slice(0, 15);

    return { success: true, data: result };
}

/**
 * Profit margin per service — (unit_price - unit_cost) / unit_price %.
 * Uses booking_services which now stores unit_cost snapshot.
 */
export async function getServiceProfitMargins(dateRange = {}) {
    const supabase = await createClient();
    await _requireFinanceRole(supabase);

    const from = dateRange.from || new Date(new Date().getFullYear(), 0, 1).toISOString();
    const to = dateRange.to || new Date().toISOString();

    const { data, error } = await supabase
        .from('booking_services')
        .select(`
            service_id,
            unit_price,
            unit_cost,
            quantity,
            service:service_catalog(id, name, code)
        `)
        .gte('created_at', from)
        .lte('created_at', to);

    if (error) {
        console.error('getServiceProfitMargins error:', error);
        return { success: false, data: [] };
    }

    const map = new Map();
    for (const row of data || []) {
        if (!row.service_id) continue;
        const qty = row.quantity || 1;
        const revenue = (row.unit_price || 0) * qty;
        const cost = (row.unit_cost || 0) * qty;
        const existing = map.get(row.service_id) || {
            service_id: row.service_id,
            name: row.service?.name || 'Unknown',
            code: row.service?.code || '',
            total_revenue: 0,
            total_cost: 0,
        };
        existing.total_revenue += revenue;
        existing.total_cost += cost;
        map.set(row.service_id, existing);
    }

    const result = Array.from(map.values()).map(s => ({
        ...s,
        gross_profit: s.total_revenue - s.total_cost,
        margin_pct: s.total_revenue > 0
            ? Math.round(((s.total_revenue - s.total_cost) / s.total_revenue) * 10000) / 100
            : 0,
    })).sort((a, b) => b.total_revenue - a.total_revenue);

    return { success: true, data: result };
}
