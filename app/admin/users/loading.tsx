import { PageHeaderSkeleton, StatsGridSkeleton, FilterBarSkeleton, TableSkeleton } from '@/components/ui/skeletons';

export default function UsersLoading() {
  return (
    <div>
      <PageHeaderSkeleton />
      <StatsGridSkeleton count={3} />
      <FilterBarSkeleton />
      <TableSkeleton rows={8} cols={5} />
    </div>
  );
}
