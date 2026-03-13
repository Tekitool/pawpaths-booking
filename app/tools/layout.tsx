import React from 'react';
import NavBar from '@/components/layouts/NavBar';
import Footer from '@/components/layouts/Footer';

export default function ToolsLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-surface-ivory flex flex-col">
            <NavBar />
            <main className="flex-grow">
                {children}
            </main>
            <Footer />
        </div>
    );
}
