export default function AdminLoading() {
    return (
        <div className="flex-1 p-8 animate-pulse">
            {/* Header skeleton */}
            <div className="h-8 w-48 bg-brand-text-02/10 rounded-lg mb-8" />

            {/* Stats row skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="bg-white rounded-2xl p-6 shadow-sm">
                        <div className="h-4 w-24 bg-brand-text-02/10 rounded mb-3" />
                        <div className="h-8 w-16 bg-brand-text-02/10 rounded" />
                    </div>
                ))}
            </div>

            {/* Table skeleton */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="h-6 w-32 bg-brand-text-02/10 rounded mb-6" />
                <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="flex gap-4">
                            <div className="h-4 w-1/4 bg-brand-text-02/10 rounded" />
                            <div className="h-4 w-1/3 bg-brand-text-02/10 rounded" />
                            <div className="h-4 w-1/6 bg-brand-text-02/10 rounded" />
                            <div className="h-4 w-1/6 bg-brand-text-02/10 rounded" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
