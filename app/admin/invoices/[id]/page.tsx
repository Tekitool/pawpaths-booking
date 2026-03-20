import { notFound } from 'next/navigation';
import { getFinanceDocument } from '@/lib/actions/finance-actions';
import InvoiceDetailClient from '@/components/invoices/InvoiceDetailClient';

export default async function InvoiceDetailPage({ params }) {
    const { id } = await params;
    const result = await getFinanceDocument(id);

    if (!result.success || !result.data) {
        notFound();
    }

    return <InvoiceDetailClient doc={result.data} />;
}
