import { PageHeaderSkeleton, FilterBarSkeleton, TaskListSkeleton } from '@/components/ui/skeletons';

export default function TasksLoading() {
  return (
    <div>
      <PageHeaderSkeleton />
      <FilterBarSkeleton />
      <TaskListSkeleton count={8} />
    </div>
  );
}
