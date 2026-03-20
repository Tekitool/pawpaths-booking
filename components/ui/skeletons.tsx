// components/ui/skeletons.tsx
// Reusable skeleton primitives for loading states across the admin dashboard.

function Shimmer({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-brand-text-02/10 ${className ?? ''}`}
    />
  );
}

export function PageHeaderSkeleton() {
  return (
    <div className="flex items-center justify-between mb-8">
      <Shimmer className="h-8 w-48" />
      <Shimmer className="h-10 w-32 rounded-xl" />
    </div>
  );
}

export function StatsGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white rounded-2xl p-6 shadow-sm">
          <Shimmer className="h-4 w-24 mb-3" />
          <Shimmer className="h-8 w-16" />
        </div>
      ))}
    </div>
  );
}

export function TableSkeleton({
  rows = 5,
  cols = 4,
}: {
  rows?: number;
  cols?: number;
}) {
  const widths = ['w-1/4', 'w-1/3', 'w-1/6', 'w-1/5', 'w-1/4', 'w-1/6'];
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <Shimmer className="h-6 w-32 mb-6" />
      <div className="space-y-4">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="flex gap-4">
            {Array.from({ length: cols }).map((_, c) => (
              <Shimmer
                key={c}
                className={`h-4 ${widths[c % widths.length]}`}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <Shimmer className="h-4 w-32 mb-4" />
      <Shimmer className="h-4 w-full mb-2" />
      <Shimmer className="h-4 w-3/4" />
    </div>
  );
}

export function FormSkeleton({ fields = 4 }: { fields?: number }) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm space-y-6">
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i}>
          <Shimmer className="h-4 w-24 mb-2" />
          <Shimmer className="h-10 w-full rounded-xl" />
        </div>
      ))}
      <div className="flex justify-end gap-3 pt-4">
        <Shimmer className="h-10 w-24 rounded-xl" />
        <Shimmer className="h-10 w-24 rounded-xl" />
      </div>
    </div>
  );
}

export function TaskListSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-xl p-4 shadow-sm flex items-center gap-4"
        >
          <Shimmer className="h-5 w-5 rounded" />
          <div className="flex-1">
            <Shimmer className="h-4 w-2/3 mb-2" />
            <Shimmer className="h-3 w-1/3" />
          </div>
          <Shimmer className="h-6 w-16 rounded-full" />
        </div>
      ))}
    </div>
  );
}

export function CalendarSkeleton() {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <Shimmer className="h-6 w-32" />
        <div className="flex gap-2">
          <Shimmer className="h-8 w-8 rounded-lg" />
          <Shimmer className="h-8 w-8 rounded-lg" />
        </div>
      </div>
      <div className="grid grid-cols-7 gap-2">
        {Array.from({ length: 7 }).map((_, i) => (
          <Shimmer key={`h-${i}`} className="h-4 w-full mb-2" />
        ))}
        {Array.from({ length: 35 }).map((_, i) => (
          <Shimmer key={i} className="h-20 w-full rounded-lg" />
        ))}
      </div>
    </div>
  );
}

export function FilterBarSkeleton() {
  return (
    <div className="flex items-center gap-3 mb-6">
      <Shimmer className="h-10 flex-1 max-w-sm rounded-xl" />
      <Shimmer className="h-10 w-28 rounded-xl" />
      <Shimmer className="h-10 w-28 rounded-xl" />
    </div>
  );
}
