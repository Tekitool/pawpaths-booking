// lib/actions/report-actions.js
// Date-range-aware financial queries for the Reports module.

'use server';

import { createClient } from '@/lib/supabase/server';

// ── Internal Helpers ───────────────────────────────────────────────────────

const FINANCE_ROLES = ['super_admin', 'admin', 'finance', 'ops_manager'];

async function _requireFinanceRole(supabase) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { authorized: false, message: 'Unauthorized' };

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (!profile || !FINANCE_ROLES.includes(profile.role)) {
        return { authorized: false, message: 'Insufficient permissions' };
    }

    return { authorized: true, user, profile };
}

function _defaultDateRange() {
    const now = new Date();
    return {
        from: `${now.getFullYear()}-01-01`,
        to: `${now.getFullYear()}-12-31`,
    };
}

function _parseDateRange(dateRange) {
    const { from, to } = dateRange || {};
    const defaults = _defaultDateRange();
    return {
        from: from || defaults.from,
        to: to || defaults.to,
    };
}

// ── Report Queries ────────────────────────────────────────────────────────

/**
 * Top 10 customers by invoiced grand_total within date range.
 */
export async function getRevenueByCustomer(dateRange) {
    try {
        const supabase = await createClient();
        const auth = await _requireFinanceRole(supabase);
        if (!auth.authorized) return { success: false, message: auth.message };

        const { from, to } = _parseDateRange(dateRange);

        const { data: invoices } = await supabase
            .from('finance_documents')
            .select('entity_id, grand_total, entities(display_name)')
            .eq('doc_type', 'invoice')
            .is('deleted_at', null)
            .gte('issue_date', from)
            .lte('issue_date', to);

        // Aggregate by entity
        const customerMap = {};
        for (const inv of (invoices || [])) {
            const id = inv.entity_id;
            if (!id) continue;
            if (!customerMap[id]) {
                customerMap[id] = {
                    name: inv.entities?.display_name || 'Unknown',
                    total: 0,
                    count: 0,
                };
            }
            customerMap[id].total += Number(inv.grand_total || 0);
            customerMap[id].count += 1;
        }

        const sorted = Object.values(customerMap)
            .sort((a, b) => b.total - a.total)
            .slice(0, 10);

        return { success: true, data: sorted };
    } catch (error) {
        console.error('[getRevenueByCustomer]', error);
        return { success: false, message: error.message };
    }
}

/**
 * Invoice count and value grouped by status within date range.
 */
export async function getInvoiceStatusBreakdown(dateRange) {
    try {
        const supabase = await createClient();
        const auth = await _requireFinanceRole(supabase);
        if (!auth.authorized) return { success: false, message: auth.message };

        const { from, to } = _parseDateRange(dateRange);

        const { data: invoices } = await supabase
            .from('finance_documents')
            .select('status, grand_total')
            .eq('doc_type', 'invoice')
            .is('deleted_at', null)
            .gte('issue_date', from)
            .lte('issue_date', to);

        const statusMap = {};
        for (const inv of (invoices || [])) {
            const s = inv.status || 'draft';
            if (!statusMap[s]) {
                statusMap[s] = { status: s, count: 0, value: 0 };
            }
            statusMap[s].count += 1;
            statusMap[s].value += Number(inv.grand_total || 0);
        }

        return { success: true, data: Object.values(statusMap) };
    } catch (error) {
        console.error('[getInvoiceStatusBreakdown]', error);
        return { success: false, message: error.message };
    }
}

/**
 * Top 10 vendors by expense total within date range.
 */
export async function getExpensesByVendor(dateRange) {
    try {
        const supabase = await createClient();
        const auth = await _requireFinanceRole(supabase);
        if (!auth.authorized) return { success: false, message: auth.message };

        const { from, to } = _parseDateRange(dateRange);

        const { data: expenses } = await supabase
            .from('finance_documents')
            .select('entity_id, grand_total, entities(display_name)')
            .in('doc_type', ['vendor_bill', 'expense_claim'])
            .is('deleted_at', null)
            .gte('issue_date', from)
            .lte('issue_date', to);

        const vendorMap = {};
        for (const exp of (expenses || [])) {
            const id = exp.entity_id || '_uncategorized';
            if (!vendorMap[id]) {
                vendorMap[id] = {
                    name: exp.entities?.display_name || 'Uncategorized',
                    total: 0,
                    count: 0,
                };
            }
            vendorMap[id].total += Number(exp.grand_total || 0);
            vendorMap[id].count += 1;
        }

        const sorted = Object.values(vendorMap)
            .sort((a, b) => b.total - a.total)
            .slice(0, 10);

        return { success: true, data: sorted };
    } catch (error) {
        console.error('[getExpensesByVendor]', error);
        return { success: false, message: error.message };
    }
}

/**
 * Monthly revenue vs expenses with net profit for date range.
 */
export async function getProfitLossData(dateRange) {
    try {
        const supabase = await createClient();
        const auth = await _requireFinanceRole(supabase);
        if (!auth.authorized) return { success: false, message: auth.message };

        const { from, to } = _parseDateRange(dateRange);

        const [{ data: invoices }, { data: expenses }] = await Promise.all([
            supabase
                .from('finance_documents')
                .select('issue_date, grand_total')
                .eq('doc_type', 'invoice')
                .is('deleted_at', null)
                .gte('issue_date', from)
                .lte('issue_date', to),
            supabase
                .from('finance_documents')
                .select('issue_date, grand_total')
                .in('doc_type', ['vendor_bill', 'expense_claim'])
                .is('deleted_at', null)
                .gte('issue_date', from)
                .lte('issue_date', to),
        ]);

        // Build monthly buckets from the date range
        const startDate = new Date(from);
        const endDate = new Date(to);
        const months = [];
        const d = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
        while (d <= endDate) {
            months.push({
                name: d.toLocaleString('en', { month: 'short' }),
                year: d.getFullYear(),
                month: d.getMonth(),
                revenue: 0,
                expenses: 0,
                netProfit: 0,
            });
            d.setMonth(d.getMonth() + 1);
        }

        // Map month index for quick lookup
        const monthIndex = {};
        months.forEach((m, i) => {
            monthIndex[`${m.year}-${m.month}`] = i;
        });

        for (const inv of (invoices || [])) {
            const dt = new Date(inv.issue_date);
            const key = `${dt.getFullYear()}-${dt.getMonth()}`;
            if (monthIndex[key] !== undefined) {
                months[monthIndex[key]].revenue += Number(inv.grand_total || 0);
            }
        }

        for (const exp of (expenses || [])) {
            const dt = new Date(exp.issue_date);
            const key = `${dt.getFullYear()}-${dt.getMonth()}`;
            if (monthIndex[key] !== undefined) {
                months[monthIndex[key]].expenses += Number(exp.grand_total || 0);
            }
        }

        // Calculate net profit and totals
        let totalRevenue = 0;
        let totalExpenses = 0;
        for (const m of months) {
            m.netProfit = m.revenue - m.expenses;
            totalRevenue += m.revenue;
            totalExpenses += m.expenses;
        }

        return {
            success: true,
            data: {
                months,
                totals: {
                    revenue: totalRevenue,
                    expenses: totalExpenses,
                    netProfit: totalRevenue - totalExpenses,
                },
            },
        };
    } catch (error) {
        console.error('[getProfitLossData]', error);
        return { success: false, message: error.message };
    }
}

/**
 * Vendor bill vs expense claim totals within date range.
 */
export async function getExpenseTypeSplit(dateRange) {
    try {
        const supabase = await createClient();
        const auth = await _requireFinanceRole(supabase);
        if (!auth.authorized) return { success: false, message: auth.message };

        const { from, to } = _parseDateRange(dateRange);

        const { data: expenses } = await supabase
            .from('finance_documents')
            .select('doc_type, grand_total')
            .in('doc_type', ['vendor_bill', 'expense_claim'])
            .is('deleted_at', null)
            .gte('issue_date', from)
            .lte('issue_date', to);

        let vendorBillTotal = 0;
        let expenseClaimTotal = 0;
        let vendorBillCount = 0;
        let expenseClaimCount = 0;

        for (const exp of (expenses || [])) {
            if (exp.doc_type === 'vendor_bill') {
                vendorBillTotal += Number(exp.grand_total || 0);
                vendorBillCount += 1;
            } else {
                expenseClaimTotal += Number(exp.grand_total || 0);
                expenseClaimCount += 1;
            }
        }

        return {
            success: true,
            data: [
                { type: 'Vendor Bills', total: vendorBillTotal, count: vendorBillCount },
                { type: 'Expense Claims', total: expenseClaimTotal, count: expenseClaimCount },
            ],
        };
    } catch (error) {
        console.error('[getExpenseTypeSplit]', error);
        return { success: false, message: error.message };
    }
}

/**
 * Composite: fetches all report data in parallel for the reports page.
 */
export async function getReportData(dateRange) {
    try {
        const supabase = await createClient();
        const auth = await _requireFinanceRole(supabase);
        if (!auth.authorized) return { success: false, message: auth.message };

        const range = _parseDateRange(dateRange);

        const [
            revenueByCustomer,
            invoiceStatus,
            expensesByVendor,
            profitLoss,
            expenseTypeSplit,
        ] = await Promise.all([
            getRevenueByCustomer(range),
            getInvoiceStatusBreakdown(range),
            getExpensesByVendor(range),
            getProfitLossData(range),
            getExpenseTypeSplit(range),
        ]);

        return {
            success: true,
            data: {
                revenueByCustomer: revenueByCustomer.data || [],
                invoiceStatus: invoiceStatus.data || [],
                expensesByVendor: expensesByVendor.data || [],
                profitLoss: profitLoss.data || { months: [], totals: { revenue: 0, expenses: 0, netProfit: 0 } },
                expenseTypeSplit: expenseTypeSplit.data || [],
            },
        };
    } catch (error) {
        console.error('[getReportData]', error);
        return { success: false, message: error.message };
    }
}
