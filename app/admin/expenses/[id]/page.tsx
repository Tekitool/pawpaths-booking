import { notFound } from 'next/navigation';
import { getFinanceDocument } from '@/lib/actions/finance-actions';
import ExpenseDetailClient from '@/components/expenses/ExpenseDetailClient';

export default async function ExpenseDetailPage({ params }) {
    const { id } = await params;
    const result = await getFinanceDocument(id);

    if (!result.success || !result.data) {
        notFound();
    }

    return <ExpenseDetailClient doc={result.data} />;
}
