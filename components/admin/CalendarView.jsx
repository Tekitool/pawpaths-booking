'use client';

import React, { useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useRouter } from 'next/navigation';
import {
    ChevronLeft,
    ChevronRight,
    CalendarClock,
    Calendar as CalendarIcon,
    Plane,
    MapPin,
    Dog,
    Cat,
    Bird,
    Rabbit,
    PawPrint
} from 'lucide-react';

const locales = {
    'en-US': enUS,
};

const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales,
});

// CUSTOM TOOLBAR COMPONENT
const CustomToolbar = (props) => {
    const goToBack = () => props.onNavigate('PREV');
    const goToNext = () => props.onNavigate('NEXT');
    const goToToday = () => props.onNavigate('TODAY');
    const goToMonthView = () => props.onView('month');
    const goToWeekView = () => props.onView('week');
    const goToDayView = () => props.onView('day');

    return (
        <div className="flex items-center justify-between mb-2 pb-2 border-b border-brand-text-02/20">
            <div className="flex items-center gap-2">
                <button onClick={goToBack} className="h-8 w-8 rounded-lg border border-brand-text-02/20 hover:bg-accent/15 hover:border-accent/50 flex items-center justify-center transition-all group">
                    <ChevronLeft size={16} className="text-brand-text-02 group-hover:text-accent" />
                </button>
                <button onClick={goToToday} className="h-8 px-3 rounded-lg border border-brand-text-02/20 hover:bg-accent/15 hover:border-accent/50 flex items-center gap-2 transition-all group">
                    <CalendarClock size={14} className="text-brand-text-02 group-hover:text-accent" />
                    <span className="text-xs font-medium text-brand-text-02 group-hover:text-orange-700">Today</span>
                </button>
                <button onClick={goToNext} className="h-8 w-8 rounded-lg border border-brand-text-02/20 hover:bg-accent/15 hover:border-accent/50 flex items-center justify-center transition-all group">
                    <ChevronRight size={16} className="text-brand-text-02 group-hover:text-accent" />
                </button>
            </div>
            <div className="text-center">
                <h2 className="text-brand-text-02">{props.label}</h2>
            </div>
            <div className="flex items-center gap-1 bg-brand-text-02/5 p-1 rounded-lg border border-brand-text-02/20">
                <button onClick={goToMonthView} className={`px-3 h-7 rounded-md text-xs font-medium transition-all ${props.view === 'month' ? 'bg-white text-accent shadow-sm' : 'text-brand-text-02 hover:text-gray-900'}`}>Month</button>
                <button onClick={goToWeekView} className={`px-3 h-7 rounded-md text-xs font-medium transition-all ${props.view === 'week' ? 'bg-white text-accent shadow-sm' : 'text-brand-text-02 hover:text-gray-900'}`}>Week</button>
                <button onClick={goToDayView} className={`px-3 h-7 rounded-md text-xs font-medium transition-all ${props.view === 'day' ? 'bg-white text-accent shadow-sm' : 'text-brand-text-02 hover:text-gray-900'}`}>Day</button>
            </div>
        </div>
    );
};

// PORTAL TOOLTIP COMPONENT
const PortalTooltip = ({ children, position }) => {
    if (typeof document === 'undefined') return null;
    return createPortal(
        <div
            style={{
                position: 'fixed',
                top: position.y,
                left: position.x,
                zIndex: 9999,
                pointerEvents: 'none'
            }}
        >
            {children}
        </div>,
        document.body
    );
};

// CUSTOM EVENT COMPONENT
const CustomEvent = ({ event }) => {
    const [showTooltip, setShowTooltip] = useState(false);
    const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

    const statusColors = {
        completed: 'bg-success/150',
        cancelled: 'bg-error/100',
        enquiry: 'bg-accent',
        quote_sent: 'bg-accent',
        draft: 'bg-gray-400',
        booking_confirmed: 'bg-info/100',
        in_progress: 'bg-info/100',
    };

    const statusLabels = {
        booking_confirmed: 'Confirmed',
        in_progress: 'In Progress',
        completed: 'Completed',
        cancelled: 'Cancelled',
        enquiry: 'Enquiry',
        quote_sent: 'Quote Sent',
        draft: 'Draft',
    };

    const bgColor = statusColors[event.status?.toLowerCase()] || 'bg-info/100';

    const getPetIcon = (species) => {
        const s = species?.toLowerCase() || '';
        if (s.includes('dog') || s.includes('canine')) return <Dog size={14} className="text-accent" />;
        if (s.includes('cat') || s.includes('feline')) return <Cat size={14} className="text-system-color-03" />;
        if (s.includes('bird') || s.includes('avian')) return <Bird size={14} className="text-system-color-02" />;
        if (s.includes('rabbit')) return <Rabbit size={14} className="text-pink-500" />;
        return <PawPrint size={14} className="text-brand-text-02/60" />;
    };

    const handleMouseEnter = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        let x = rect.left;
        let y = rect.bottom + 5;
        if (x + 320 > window.innerWidth) {
            x = window.innerWidth - 330;
        }
        setTooltipPos({ x, y });
        setShowTooltip(true);
    };

    const handleMouseLeave = () => {
        setShowTooltip(false);
    };

    return (
        <>
            <div className="group relative h-full cursor-pointer">
                <div
                    className={`${bgColor} text-white px-1.5 py-0.5 rounded text-[10px] font-medium truncate h-full flex items-center leading-none`}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                >
                    {event.title}
                </div>
            </div>

            {showTooltip && (
                <PortalTooltip position={tooltipPos}>
                    <div className="w-80 p-0 bg-white/95 backdrop-blur-xl rounded-xl shadow-2xl border border-white/50 ring-1 ring-black/5 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className={`h-1.5 w-full ${bgColor}`} />
                        <div className="p-4 space-y-3">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h4 className="text-brand-text-02 leading-tight">
                                        {event.resource?.customer_name || 'Unknown Customer'}
                                    </h4>
                                    <div className="text-[10px] text-brand-text-02/80 font-mono mt-0.5">
                                        {event.resource?.booking_number || 'N/A'}
                                    </div>
                                </div>
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${bgColor} text-white shadow-sm`}>
                                    {statusLabels[event.status?.toLowerCase()] || event.status}
                                </span>
                            </div>
                            <div className="flex items-center gap-3 bg-brand-text-02/5/80 p-2 rounded-lg border border-brand-text-02/20">
                                <div className="flex flex-col items-center gap-0.5 min-w-[40px]">
                                    <span className="text-xs font-black text-brand-text-02">{event.resource?.origin?.split(' ')[0] || 'ORG'}</span>
                                    <span className="text-[9px] text-brand-text-02/60 font-medium">Origin</span>
                                </div>
                                <div className="flex-1 flex items-center justify-center relative">
                                    <div className="h-[1px] w-full bg-slate-300 absolute" />
                                    <Plane size={12} className="text-accent relative z-10 bg-brand-text-02/5 px-1 rotate-90" />
                                </div>
                                <div className="flex flex-col items-center gap-0.5 min-w-[40px]">
                                    <span className="text-xs font-black text-brand-text-02">{event.resource?.destination?.split(' ')[0] || 'DST'}</span>
                                    <span className="text-[9px] text-brand-text-02/60 font-medium">Dest</span>
                                </div>
                            </div>
                            {event.resource?.pets && event.resource.pets.length > 0 && (
                                <div className="space-y-1.5">
                                    <div className="text-[10px] uppercase tracking-wider font-bold text-brand-text-02/60">Passengers</div>
                                    <div className="flex flex-wrap gap-1.5">
                                        {event.resource.pets.map((pet, idx) => (
                                            <div key={idx} className="flex items-center gap-1.5 bg-white border border-brand-text-02/20 px-2 py-1 rounded-md shadow-sm">
                                                {getPetIcon(pet.species)}
                                                <span className="text-xs font-medium text-brand-text-02">{pet.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {event.start && (
                                <div className="pt-2 border-t border-brand-text-02/20 flex items-center gap-1.5 text-xs text-brand-text-02/80">
                                    <CalendarClock size={12} className="text-brand-text-02/60" />
                                    <span className="font-medium">{format(event.start, 'PPP p')}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </PortalTooltip>
            )}
        </>
    );
};

export default function CalendarView({ events = [] }) {
    const router = useRouter();
    const [view, setView] = useState('month');
    const [date, setDate] = useState(new Date());

    const onNavigate = useCallback((newDate) => setDate(newDate), []);
    const onView = useCallback((newView) => setView(newView), []);

    const processedEvents = React.useMemo(() => {
        return events.map(event => ({
            ...event,
            start: new Date(event.start),
            end: new Date(event.end)
        }));
    }, [events]);

    const eventStyleGetter = (event) => {
        return {
            style: {
                backgroundColor: 'transparent',
                borderRadius: '0px',
                opacity: 1,
                color: 'transparent',
                border: '0px',
                display: 'block',
                outline: 'none',
                boxShadow: 'none',
            },
        };
    };

    const handleSelectEvent = (event) => {
        router.push(`/admin/relocations/${event.resource.booking_number}`);
    };

    return (
        <div className="bg-white/60 backdrop-blur-md border border-white/50 rounded-xl p-4 shadow-sm" style={{ height: 'calc(100vh - 240px)' }}>
            <Calendar
                localizer={localizer}
                events={processedEvents}
                startAccessor="start"
                endAccessor="end"
                style={{ height: '100%' }}
                eventPropGetter={eventStyleGetter}
                onSelectEvent={handleSelectEvent}
                views={['month', 'week', 'day']}
                view={view}
                date={date}
                onNavigate={onNavigate}
                onView={onView}
                components={{
                    toolbar: CustomToolbar,
                    event: CustomEvent,
                }}
            />
            <style jsx global>{`
                .rbc-header {
                    height: 42px !important;
                    background-color: brand-color-03-light !important;
                    color: #334155 !important;
                    font-weight: 800 !important;
                    font-size: 15px !important;
                    border-bottom: 2px solid #fed7aa !important;
                    display: flex !important;
                    align-items: center !important;
                    justify-content: center !important;
                    text-transform: uppercase !important;
                    letter-spacing: 0.05em !important;
                }
                .rbc-month-view {
                    border-radius: 8px;
                    overflow: visible !important;
                }
                .rbc-month-row, .rbc-row, .rbc-row-content {
                    overflow: visible !important;
                    z-index: 10;
                }
                .rbc-event {
                    overflow: visible !important;
                }
                .rbc-date-cell {
                    padding: 4px;
                    font-weight: 700;
                    font-size: 16px;
                    color: #475569;
                }
                .rbc-today {
                    background-color: brand-color-03-light !important;
                }
                .rbc-off-range-bg {
                    background-color: #f8fafc !important;
                }
                .rbc-event {
                    padding: 1px 4px !important;
                    font-size: 10px !important;
                    min-height: 18px !important;
                    pointer-events: auto !important;
                    outline: none !important;
                    background-color: transparent !important;
                }
                .rbc-day-bg + .rbc-day-bg {
                    border-left: 1px solid #e2e8f0 !important;
                }
                .rbc-month-row + .rbc-month-row {
                    border-top: 1px solid #e2e8f0 !important;
                }
            `}</style>
        </div>
    );
}
