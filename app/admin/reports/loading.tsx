import { PageHeaderSkeleton, StatsGridSkeleton, CardSkeleton } from '@/components/ui/skeletons';

export default function ReportsLoading() {
    return (
        <div className="max-w-[1600px] mx-auto p-6 space-y-6">
            <PageHeaderSkeleton />
            <CardSkeleton />
            <StatsGridSkeleton count={4} />
            <CardSkeleton />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <CardSkeleton />
                </div>
                <CardSkeleton />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <CardSkeleton />
                <CardSkeleton />
            </div>
        </div>
    );
}
