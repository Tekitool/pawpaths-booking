import { notFound } from 'next/navigation';
import { getFinanceDocument } from '@/lib/actions/finance-actions';
import QuoteDetailClient from '@/components/quotes/QuoteDetailClient';

export default async function QuoteDetailPage({ params }) {
    const { id } = await params;
    const result = await getFinanceDocument(id);

    if (!result.success || !result.data) {
        notFound();
    }

    return <QuoteDetailClient doc={result.data} />;
}
