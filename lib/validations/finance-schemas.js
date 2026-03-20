import { z } from 'zod';

// ── Enums ──────────────────────────────────────────────────────────────────

export const FINANCE_DOC_TYPES = [
    'quotation', 'proforma_invoice', 'invoice', 'receipt',
    'credit_note', 'debit_note', 'vendor_bill', 'expense_claim',
];

export const PAYMENT_STATUSES = ['unpaid', 'partial', 'paid', 'overpaid', 'refunded'];

export const QUOTE_STATUSES = ['draft', 'sent', 'needs_action', 'accepted', 'invoiced'];
export const INVOICE_STATUSES = ['draft', 'sent', 'overdue', 'cancelled'];
export const EXPENSE_STATUSES = ['draft', 'submitted', 'approved', 'paid'];

// ── Schemas ────────────────────────────────────────────────────────────────

export const financeItemSchema = z.object({
    description: z.string().min(1, 'Description is required'),
    quantity: z.coerce.number().min(0.01, 'Quantity must be positive'),
    unit_price: z.coerce.number().min(0, 'Price cannot be negative'),
    tax_rate: z.coerce.number().min(0).max(100).default(5),
});

export const createDocumentSchema = z.object({
    doc_type: z.enum(['quotation', 'proforma_invoice', 'invoice', 'receipt',
        'credit_note', 'debit_note', 'vendor_bill', 'expense_claim']),
    entity_id: z.string().uuid('Valid customer/vendor is required'),
    booking_id: z.string().uuid().optional().nullable(),
    issue_date: z.string().min(1, 'Issue date is required'),
    due_date: z.string().optional().nullable(),
    currency: z.string().length(3).default('AED'),
    notes: z.string().optional().nullable(),
    status: z.string().default('draft'),
    items: z.array(financeItemSchema).min(1, 'At least one line item is required'),
});

export const updateDocumentSchema = z.object({
    entity_id: z.string().uuid().optional(),
    booking_id: z.string().uuid().optional().nullable(),
    issue_date: z.string().optional(),
    due_date: z.string().optional().nullable(),
    currency: z.string().length(3).optional(),
    notes: z.string().optional().nullable(),
    status: z.string().optional(),
    items: z.array(financeItemSchema).min(1).optional(),
});

export const recordPaymentSchema = z.object({
    amount: z.coerce.number().positive('Payment amount must be positive'),
    payment_date: z.string().optional(),
    payment_method: z.string().optional(),
    reference: z.string().optional(),
});

export const updateStatusSchema = z.object({
    status: z.string().min(1, 'Status is required'),
});
