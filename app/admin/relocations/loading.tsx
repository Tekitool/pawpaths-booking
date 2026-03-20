import { PageHeaderSkeleton, FilterBarSkeleton, TableSkeleton } from '@/components/ui/skeletons';

export default function RelocationsLoading() {
  return (
    <div>
      <PageHeaderSkeleton />
      <FilterBarSkeleton />
      <TableSkeleton rows={8} cols={6} />
    </div>
  );
}
