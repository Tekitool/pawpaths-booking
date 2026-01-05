import { Suspense } from 'react';
import { getCalendarEvents } from '@/lib/actions/calendar-actions';
import PageShell from '@/components/ui/PageShell';
import CalendarView from '@/components/admin/CalendarView';
import { Plus } from 'lucide-react';

function CalendarSkeleton() {
    return <div className="h-[600px] bg-white/40 rounded-xl animate-pulse" />;
}

async function CalendarContainer() {
    const events = await getCalendarEvents();
    return <CalendarView events={events} />;
}

export default function CalendarPage() {
    return (
        <PageShell
            title="Relocation Calendar"
            actions={
                <button className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent transition-colors shadow-sm font-medium text-sm">
                    <Plus size={16} /> New Booking
                </button>
            }
        >
            <Suspense fallback={<CalendarSkeleton />}>
                <CalendarContainer />
            </Suspense>
        </PageShell>
    );
}
