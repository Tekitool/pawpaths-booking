'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import {
    createDocumentSchema,
    updateDocumentSchema,
    recordPaymentSchema,
    updateStatusSchema,
} from '@/lib/validations/finance-schemas';

// ── Internal Helpers ───────────────────────────────────────────────────────

function _calculateTotals(items) {
    let subtotal = 0;
    let tax_total = 0;

    for (const item of items) {
        const lineNet = item.quantity * item.unit_price;
        subtotal += lineNet;
        tax_total += lineNet * (item.tax_rate / 100);
    }

    return {
        subtotal: Math.round(subtotal * 100) / 100,
        tax_total: Math.round(tax_total * 100) / 100,
        grand_total: Math.round((subtotal + tax_total) * 100) / 100,
    };
}

function _revalidateFinance() {
    revalidatePath('/admin/quotes');
    revalidatePath('/admin/invoices');
    revalidatePath('/admin/expenses');
    revalidatePath('/admin/summary');
}

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

// ── Read Actions ───────────────────────────────────────────────────────────

/**
 * Paginated list of finance documents with optional filters.
 * @param {Object} filters
 * @param {string|string[]} filters.doc_type - e.g. 'quotation' or ['vendor_bill','expense_claim']
 * @param {number} filters.page
 * @param {number} filters.pageSize
 * @param {string} filters.search - searches doc_number and entity display_name
 * @param {string} filters.status - filter by status
 */
export async function getFinanceDocuments({
    doc_type,
    page = 1,
    pageSize = 15,
    search = '',
    status = '',
} = {}) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { success: false, message: 'Unauthorized' };

        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;

        let query = supabase
            .from('finance_documents')
            .select(`
                *,
                entity:entities!entity_id(id, display_name, contact_info),
                booking:bookings!booking_id(
                    id, booking_number,
                    pets:booking_pets(pet:pets(name, species:species(name), breed:breeds(name))),
                    origin:logistics_nodes!origin_node_id(city, iata_code),
                    destination:logistics_nodes!destination_node_id(city, iata_code)
                )
            `, { count: 'exact' })
            .is('deleted_at', null);

        // Filter by doc_type
        if (Array.isArray(doc_type)) {
            query = query.in('doc_type', doc_type);
        } else if (doc_type) {
            query = query.eq('doc_type', doc_type);
        }

        // Status filter
        if (status) {
            query = query.eq('status', status);
        }

        // Search
        if (search) {
            query = query.or(`doc_number.ilike.%${search}%`);
        }

        query = query.order('created_at', { ascending: false }).range(from, to);

        const { data, count, error } = await query;
        if (error) throw error;

        return {
            success: true,
            data: data || [],
            total: count || 0,
            totalPages: Math.ceil((count || 0) / pageSize),
        };
    } catch (error) {
        console.error('[getFinanceDocuments]', error);
        return { success: false, message: error.message, data: [], total: 0, totalPages: 0 };
    }
}

/**
 * Single finance document with line items and related entity/booking.
 */
export async function getFinanceDocument(id) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { success: false, message: 'Unauthorized' };

        const { data, error } = await supabase
            .from('finance_documents')
            .select(`
                *,
                entity:entities!entity_id(id, display_name, contact_info, billing_address, tax_id),
                booking:bookings!booking_id(
                    id, booking_number,
                    pets:booking_pets(pet:pets(name, species:species(name), breed:breeds(name))),
                    origin:logistics_nodes!origin_node_id(city, iata_code),
                    destination:logistics_nodes!destination_node_id(city, iata_code)
                ),
                items:finance_items(*)
            `)
            .eq('id', id)
            .is('deleted_at', null)
            .single();

        if (error) throw error;

        return { success: true, data };
    } catch (error) {
        console.error('[getFinanceDocument]', error);
        return { success: false, message: error.message };
    }
}

/**
 * Funnel stats for quotes: count & value by status.
 */
export async function getQuoteFunnelStats() {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { success: false, message: 'Unauthorized' };

        const { data, error } = await supabase
            .from('finance_documents')
            .select('status, grand_total')
            .eq('doc_type', 'quotation')
            .is('deleted_at', null);

        if (error) throw error;

        const stats = {};
        for (const row of (data || [])) {
            if (!stats[row.status]) {
                stats[row.status] = { count: 0, value: 0 };
            }
            stats[row.status].count += 1;
            stats[row.status].value += Number(row.grand_total) || 0;
        }

        return { success: true, data: stats };
    } catch (error) {
        console.error('[getQuoteFunnelStats]', error);
        return { success: false, message: error.message, data: {} };
    }
}

/**
 * KPI aggregates for the financial dashboard.
 */
export async function getFinancialKPIs() {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { success: false, message: 'Unauthorized' };

        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
        const startOfYear = new Date(now.getFullYear(), 0, 1).toISOString();

        // Total revenue (invoices) this year
        const { data: yearInvoices } = await supabase
            .from('finance_documents')
            .select('grand_total, paid_amount, balance_amount, payment_status')
            .eq('doc_type', 'invoice')
            .is('deleted_at', null)
            .gte('issue_date', startOfYear);

        // Total expenses this year
        const { data: yearExpenses } = await supabase
            .from('finance_documents')
            .select('grand_total')
            .in('doc_type', ['vendor_bill', 'expense_claim'])
            .is('deleted_at', null)
            .gte('issue_date', startOfYear);

        // Outstanding receivables
        const { data: receivables } = await supabase
            .from('finance_documents')
            .select('balance_amount')
            .eq('doc_type', 'invoice')
            .is('deleted_at', null)
            .neq('payment_status', 'paid');

        // Quotes this month
        const { count: quotesThisMonth } = await supabase
            .from('finance_documents')
            .select('*', { count: 'exact', head: true })
            .eq('doc_type', 'quotation')
            .is('deleted_at', null)
            .gte('created_at', startOfMonth);

        const totalRevenue = (yearInvoices || []).reduce((s, r) => s + Number(r.grand_total || 0), 0);
        const totalReceived = (yearInvoices || []).reduce((s, r) => s + Number(r.paid_amount || 0), 0);
        const totalExpenses = (yearExpenses || []).reduce((s, r) => s + Number(r.grand_total || 0), 0);
        const totalOutstanding = (receivables || []).reduce((s, r) => s + Number(r.balance_amount || 0), 0);

        return {
            success: true,
            data: {
                totalRevenue,
                totalReceived,
                totalExpenses,
                netProfit: totalRevenue - totalExpenses,
                totalOutstanding,
                quotesThisMonth: quotesThisMonth || 0,
            },
        };
    } catch (error) {
        console.error('[getFinancialKPIs]', error);
        return { success: false, message: error.message };
    }
}

/**
 * Monthly revenue/expenses for bar chart (current year).
 */
export async function getMonthlyRevExpData(year) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { success: false, message: 'Unauthorized' };

        const yr = year || new Date().getFullYear();
        const startDate = `${yr}-01-01`;
        const endDate = `${yr}-12-31`;

        // All invoices for the year
        const { data: invoices } = await supabase
            .from('finance_documents')
            .select('issue_date, grand_total, paid_amount')
            .eq('doc_type', 'invoice')
            .is('deleted_at', null)
            .gte('issue_date', startDate)
            .lte('issue_date', endDate);

        // All expenses for the year
        const { data: expenses } = await supabase
            .from('finance_documents')
            .select('issue_date, grand_total')
            .in('doc_type', ['vendor_bill', 'expense_claim'])
            .is('deleted_at', null)
            .gte('issue_date', startDate)
            .lte('issue_date', endDate);

        const months = Array.from({ length: 12 }, (_, i) => ({
            name: new Date(yr, i).toLocaleString('en', { month: 'short' }),
            month: i,
            sales: 0,
            receipts: 0,
            expenses: 0,
        }));

        for (const inv of (invoices || [])) {
            const m = new Date(inv.issue_date).getMonth();
            months[m].sales += Number(inv.grand_total || 0);
            months[m].receipts += Number(inv.paid_amount || 0);
        }

        for (const exp of (expenses || [])) {
            const m = new Date(exp.issue_date).getMonth();
            months[m].expenses += Number(exp.grand_total || 0);
        }

        return { success: true, data: months };
    } catch (error) {
        console.error('[getMonthlyRevExpData]', error);
        return { success: false, message: error.message, data: [] };
    }
}

/**
 * Receivables aging buckets.
 */
export async function getReceivablesAging() {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { success: false, message: 'Unauthorized' };

        const { data, error } = await supabase
            .from('finance_documents')
            .select('due_date, balance_amount')
            .eq('doc_type', 'invoice')
            .is('deleted_at', null)
            .neq('payment_status', 'paid')
            .gt('balance_amount', 0);

        if (error) throw error;

        const today = new Date();
        const buckets = { current: 0, days_1_15: 0, days_16_30: 0, days_31_45: 0, days_45_plus: 0, total: 0 };

        for (const row of (data || [])) {
            const balance = Number(row.balance_amount || 0);
            buckets.total += balance;

            if (!row.due_date) {
                buckets.current += balance;
                continue;
            }

            const due = new Date(row.due_date);
            const daysOverdue = Math.floor((today - due) / (1000 * 60 * 60 * 24));

            if (daysOverdue <= 0) buckets.current += balance;
            else if (daysOverdue <= 15) buckets.days_1_15 += balance;
            else if (daysOverdue <= 30) buckets.days_16_30 += balance;
            else if (daysOverdue <= 45) buckets.days_31_45 += balance;
            else buckets.days_45_plus += balance;
        }

        return { success: true, data: buckets };
    } catch (error) {
        console.error('[getReceivablesAging]', error);
        return { success: false, message: error.message };
    }
}

/**
 * Top expense categories for donut chart.
 */
export async function getExpensesByCategory() {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { success: false, message: 'Unauthorized' };

        const startOfYear = new Date(new Date().getFullYear(), 0, 1).toISOString();

        const { data, error } = await supabase
            .from('finance_documents')
            .select('grand_total, entity:entities!entity_id(display_name)')
            .in('doc_type', ['vendor_bill', 'expense_claim'])
            .is('deleted_at', null)
            .gte('issue_date', startOfYear);

        if (error) throw error;

        // Group by vendor
        const grouped = {};
        for (const row of (data || [])) {
            const name = row.entity?.display_name || 'Uncategorized';
            grouped[name] = (grouped[name] || 0) + Number(row.grand_total || 0);
        }

        // Sort descending, top 6
        const sorted = Object.entries(grouped)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 6);

        return { success: true, data: sorted };
    } catch (error) {
        console.error('[getExpensesByCategory]', error);
        return { success: false, message: error.message, data: [] };
    }
}

/**
 * Fetch client entities for dropdowns.
 */
export async function getClientEntities() {
    try {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from('entities')
            .select('id, display_name, contact_info')
            .eq('is_client', true)
            .order('display_name');

        if (error) throw error;
        return { success: true, data: data || [] };
    } catch (error) {
        console.error('[getClientEntities]', error);
        return { success: false, message: error.message, data: [] };
    }
}

/**
 * Fetch vendor entities for dropdowns.
 */
export async function getVendorEntities() {
    try {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from('entities')
            .select('id, display_name, contact_info')
            .eq('is_vendor', true)
            .order('display_name');

        if (error) throw error;
        return { success: true, data: data || [] };
    } catch (error) {
        console.error('[getVendorEntities]', error);
        return { success: false, message: error.message, data: [] };
    }
}

// ── Mutation Actions ───────────────────────────────────────────────────────

/**
 * Create a new finance document with line items.
 */
export async function createFinanceDocument(input) {
    const supabase = await createClient();
    const roleCheck = await _requireFinanceRole(supabase);
    if (!roleCheck.authorized) return { success: false, message: roleCheck.message };

    const parsed = createDocumentSchema.safeParse(input);
    if (!parsed.success) {
        return {
            success: false,
            message: 'Validation failed',
            fieldErrors: parsed.error.flatten().fieldErrors,
        };
    }

    try {
        const { items, ...docFields } = parsed.data;
        const totals = _calculateTotals(items);

        // Insert document
        const { data: doc, error: docError } = await supabase
            .from('finance_documents')
            .insert({
                ...docFields,
                ...totals,
                balance_amount: totals.grand_total,
                payment_status: 'unpaid',
            })
            .select('id, doc_number')
            .single();

        if (docError) throw docError;

        // Insert line items
        const lineItems = items.map((item) => ({
            doc_id: doc.id,
            description: item.description,
            quantity: item.quantity,
            unit_price: item.unit_price,
            tax_rate: item.tax_rate,
        }));

        const { error: itemsError } = await supabase
            .from('finance_items')
            .insert(lineItems);

        if (itemsError) throw itemsError;

        _revalidateFinance();
        return { success: true, data: { id: doc.id, doc_number: doc.doc_number } };
    } catch (error) {
        console.error('[createFinanceDocument]', error);
        return { success: false, message: error.message };
    }
}

/**
 * Update an existing finance document (draft only).
 */
export async function updateFinanceDocument(id, input) {
    const supabase = await createClient();
    const roleCheck = await _requireFinanceRole(supabase);
    if (!roleCheck.authorized) return { success: false, message: roleCheck.message };

    const parsed = updateDocumentSchema.safeParse(input);
    if (!parsed.success) {
        return {
            success: false,
            message: 'Validation failed',
            fieldErrors: parsed.error.flatten().fieldErrors,
        };
    }

    try {

        const { items, ...docFields } = parsed.data;

        // Build update payload
        const updatePayload = { ...docFields };
        if (items) {
            const totals = _calculateTotals(items);
            Object.assign(updatePayload, totals);
            updatePayload.balance_amount = totals.grand_total - 0; // reset for drafts
        }

        const { error: docError } = await supabase
            .from('finance_documents')
            .update(updatePayload)
            .eq('id', id);

        if (docError) throw docError;

        // Re-insert items if provided
        if (items) {
            // Delete old items (CASCADE won't apply on update)
            await supabase.from('finance_items').delete().eq('doc_id', id);

            const lineItems = items.map((item) => ({
                doc_id: id,
                description: item.description,
                quantity: item.quantity,
                unit_price: item.unit_price,
                tax_rate: item.tax_rate,
            }));

            const { error: itemsError } = await supabase
                .from('finance_items')
                .insert(lineItems);

            if (itemsError) throw itemsError;
        }

        _revalidateFinance();
        return { success: true };
    } catch (error) {
        console.error('[updateFinanceDocument]', error);
        return { success: false, message: error.message };
    }
}

/**
 * Update document status.
 */
export async function updateDocumentStatus(id, newStatus) {
    const supabase = await createClient();
    const roleCheck = await _requireFinanceRole(supabase);
    if (!roleCheck.authorized) return { success: false, message: roleCheck.message };

    const parsed = updateStatusSchema.safeParse({ status: newStatus });
    if (!parsed.success) {
        return { success: false, message: 'Invalid status' };
    }

    try {

        const { error } = await supabase
            .from('finance_documents')
            .update({ status: parsed.data.status })
            .eq('id', id);

        if (error) throw error;

        _revalidateFinance();
        return { success: true };
    } catch (error) {
        console.error('[updateDocumentStatus]', error);
        return { success: false, message: error.message };
    }
}

/**
 * Convert an accepted quote to an invoice.
 */
export async function convertQuoteToInvoice(quoteId) {
    const supabase = await createClient();
    const roleCheck = await _requireFinanceRole(supabase);
    if (!roleCheck.authorized) return { success: false, message: roleCheck.message };

    try {

        // Fetch quote with items
        const { data: quote, error: fetchErr } = await supabase
            .from('finance_documents')
            .select('*, items:finance_items(*)')
            .eq('id', quoteId)
            .single();

        if (fetchErr || !quote) return { success: false, message: 'Quote not found' };

        if (quote.status === 'invoiced') {
            return { success: false, message: 'This quote has already been invoiced' };
        }

        // Create invoice document
        const { data: invoice, error: invErr } = await supabase
            .from('finance_documents')
            .insert({
                doc_type: 'invoice',
                entity_id: quote.entity_id,
                booking_id: quote.booking_id,
                issue_date: new Date().toISOString().split('T')[0],
                due_date: null,
                currency: quote.currency,
                subtotal: quote.subtotal,
                tax_total: quote.tax_total,
                grand_total: quote.grand_total,
                balance_amount: quote.grand_total,
                payment_status: 'unpaid',
                status: 'draft',
            })
            .select('id, doc_number')
            .single();

        if (invErr) throw invErr;

        // Copy line items
        if (quote.items && quote.items.length > 0) {
            const newItems = quote.items.map((item) => ({
                doc_id: invoice.id,
                description: item.description,
                quantity: Number(item.quantity),
                unit_price: Number(item.unit_price),
                tax_rate: Number(item.tax_rate),
            }));

            const { error: itemsErr } = await supabase
                .from('finance_items')
                .insert(newItems);

            if (itemsErr) throw itemsErr;
        }

        // Mark quote as invoiced
        await supabase
            .from('finance_documents')
            .update({ status: 'invoiced' })
            .eq('id', quoteId);

        _revalidateFinance();
        return { success: true, data: { id: invoice.id, doc_number: invoice.doc_number } };
    } catch (error) {
        console.error('[convertQuoteToInvoice]', error);
        return { success: false, message: error.message };
    }
}

/**
 * Record a payment against a finance document.
 */
export async function recordPayment(docId, input) {
    const supabase = await createClient();
    const roleCheck = await _requireFinanceRole(supabase);
    if (!roleCheck.authorized) return { success: false, message: roleCheck.message };

    const parsed = recordPaymentSchema.safeParse(input);
    if (!parsed.success) {
        return {
            success: false,
            message: 'Validation failed',
            fieldErrors: parsed.error.flatten().fieldErrors,
        };
    }

    try {

        // Get current amounts
        const { data: doc, error: fetchErr } = await supabase
            .from('finance_documents')
            .select('paid_amount, grand_total')
            .eq('id', docId)
            .single();

        if (fetchErr || !doc) return { success: false, message: 'Document not found' };

        const newPaid = Number(doc.paid_amount || 0) + parsed.data.amount;
        const grandTotal = Number(doc.grand_total || 0);
        const newBalance = grandTotal - newPaid;

        let paymentStatus = 'unpaid';
        if (newPaid >= grandTotal) paymentStatus = 'paid';
        else if (newPaid > grandTotal) paymentStatus = 'overpaid';
        else if (newPaid > 0) paymentStatus = 'partial';

        const { error: updateErr } = await supabase
            .from('finance_documents')
            .update({
                paid_amount: newPaid,
                balance_amount: Math.max(0, newBalance),
                payment_status: paymentStatus,
            })
            .eq('id', docId);

        if (updateErr) throw updateErr;

        _revalidateFinance();
        return { success: true };
    } catch (error) {
        console.error('[recordPayment]', error);
        return { success: false, message: error.message };
    }
}

/**
 * Soft-delete a finance document.
 */
export async function deleteFinanceDocument(id) {
    const supabase = await createClient();
    const roleCheck = await _requireFinanceRole(supabase);
    if (!roleCheck.authorized) return { success: false, message: roleCheck.message };

    try {

        const { error } = await supabase
            .from('finance_documents')
            .update({ deleted_at: new Date().toISOString() })
            .eq('id', id);

        if (error) throw error;

        _revalidateFinance();
        return { success: true };
    } catch (error) {
        console.error('[deleteFinanceDocument]', error);
        return { success: false, message: error.message };
    }
}
