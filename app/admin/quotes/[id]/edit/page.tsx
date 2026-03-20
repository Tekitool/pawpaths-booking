import { notFound } from 'next/navigation';
import { getFinanceDocument, getClientEntities } from '@/lib/actions/finance-actions';
import QuoteEditClient from '@/components/quotes/QuoteEditClient';

export default async function QuoteEditPage({ params }) {
    const { id } = await params;
    const [docResult, entitiesResult] = await Promise.all([
        getFinanceDocument(id),
        getClientEntities(),
    ]);

    if (!docResult.success || !docResult.data) {
        notFound();
    }

    if (docResult.data.status !== 'draft') {
        notFound();
    }

    return (
        <QuoteEditClient
            doc={docResult.data}
            entities={entitiesResult.data || []}
        />
    );
}
