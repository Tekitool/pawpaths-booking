import { getFinanceDocuments } from '@/lib/actions/finance-actions';
import ExpensesListClient from '@/components/expenses/ExpensesListClient';

export default async function ExpensesPage({ searchParams }) {
    const params = await searchParams;
    const page = Math.max(1, Number(params?.page) || 1);

    const result = await getFinanceDocuments({
        doc_type: ['vendor_bill', 'expense_claim'],
        page,
        pageSize: 15,
    });

    return (
        <ExpensesListClient
            expenses={result.data || []}
            currentPage={page}
            totalPages={result.totalPages || 0}
            totalItems={result.total || 0}
        />
    );
}
