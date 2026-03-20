import { PageHeaderSkeleton, FilterBarSkeleton, TableSkeleton } from '@/components/ui/skeletons';

export default function ServicesLoading() {
  return (
    <div>
      <PageHeaderSkeleton />
      <FilterBarSkeleton />
      <TableSkeleton rows={8} cols={7} />
    </div>
  );
}
