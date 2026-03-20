import { PageHeaderSkeleton, CardSkeleton, TableSkeleton } from '@/components/ui/skeletons';

export default function ExpenseDetailLoading() {
    return (
        <div>
            <PageHeaderSkeleton />
            <CardSkeleton />
            <div className="mt-6">
                <TableSkeleton rows={4} cols={4} />
            </div>
        </div>
    );
}
