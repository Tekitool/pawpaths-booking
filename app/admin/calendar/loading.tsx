import { PageHeaderSkeleton, CalendarSkeleton } from '@/components/ui/skeletons';

export default function CalendarLoading() {
  return (
    <div>
      <PageHeaderSkeleton />
      <CalendarSkeleton />
    </div>
  );
}
