import React from 'react';
import BookingHeader from '@/components/booking/BookingHeader';
import ElegantFooter from '@/components/ui/ElegantFooter';

export default function ToolsLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex flex-col">
            <BookingHeader />
            <main className="flex-grow">
                {children}
            </main>
            <ElegantFooter />
        </div>
    );
}
