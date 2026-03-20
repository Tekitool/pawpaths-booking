import { PageHeaderSkeleton, StatsGridSkeleton, FilterBarSkeleton, TableSkeleton } from '@/components/ui/skeletons';

export default function QuotesLoading() {
  return (
    <div>
      <PageHeaderSkeleton />
      <StatsGridSkeleton count={5} />
      <FilterBarSkeleton />
      <TableSkeleton rows={6} cols={5} />
    </div>
  );
}
