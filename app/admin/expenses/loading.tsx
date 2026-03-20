import { PageHeaderSkeleton, StatsGridSkeleton, FilterBarSkeleton, TableSkeleton } from '@/components/ui/skeletons';

export default function ExpensesLoading() {
    return (
        <div>
            <PageHeaderSkeleton />
            <StatsGridSkeleton count={3} />
            <FilterBarSkeleton />
            <TableSkeleton rows={6} cols={5} />
        </div>
    );
}
