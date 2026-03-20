import { getFinanceDocuments } from '@/lib/actions/finance-actions';
import InvoicesListClient from '@/components/invoices/InvoicesListClient';

export default async function InvoicesPage({ searchParams }) {
    const params = await searchParams;
    const page = Math.max(1, Number(params?.page) || 1);

    const result = await getFinanceDocuments({ doc_type: 'invoice', page, pageSize: 15 });

    return (
        <InvoicesListClient
            invoices={result.data || []}
            currentPage={page}
            totalPages={result.totalPages || 0}
            totalItems={result.total || 0}
        />
    );
}
