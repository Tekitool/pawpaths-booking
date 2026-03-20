import { PageHeaderSkeleton, StatsGridSkeleton, CardSkeleton } from '@/components/ui/skeletons';

export default function SummaryLoading() {
    return (
        <div>
            <PageHeaderSkeleton />
            <StatsGridSkeleton count={4} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-6">
                <CardSkeleton />
                <CardSkeleton />
            </div>
        </div>
    );
}
