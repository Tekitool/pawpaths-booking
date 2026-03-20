import { PageHeaderSkeleton, StatsGridSkeleton, FilterBarSkeleton, TableSkeleton } from '@/components/ui/skeletons';

export default function InvoicesLoading() {
    return (
        <div>
            <PageHeaderSkeleton />
            <StatsGridSkeleton count={4} />
            <FilterBarSkeleton />
            <TableSkeleton rows={6} cols={5} />
        </div>
    );
}
