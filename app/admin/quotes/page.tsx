import { getFinanceDocuments, getQuoteFunnelStats } from '@/lib/actions/finance-actions';
import QuotesListClient from '@/components/quotes/QuotesListClient';

export default async function QuotesPage({ searchParams }) {
    const params = await searchParams;
    const page = Math.max(1, Number(params?.page) || 1);
    const status = params?.status || '';

    const [docsResult, statsResult] = await Promise.all([
        getFinanceDocuments({ doc_type: 'quotation', page, pageSize: 15, search: '', status }),
        getQuoteFunnelStats(),
    ]);

    return (
        <QuotesListClient
            quotes={docsResult.data || []}
            funnelStats={(statsResult.data || {}) as Record<string, { count: number; value: number }>}
            currentPage={page}
            totalPages={docsResult.totalPages || 0}
            totalItems={docsResult.total || 0}
        />
    );
}
