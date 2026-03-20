import { PageHeaderSkeleton, FilterBarSkeleton, TableSkeleton } from '@/components/ui/skeletons';

export default function PetsLoading() {
  return (
    <div>
      <PageHeaderSkeleton />
      <FilterBarSkeleton />
      <TableSkeleton rows={8} cols={5} />
    </div>
  );
}
