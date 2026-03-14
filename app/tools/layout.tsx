import React from 'react';
import NavBar from '@/components/layouts/NavBar';
import Footer from '@/components/layouts/Footer';

export default function ToolsLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-surface-ivory">
            {/* Fixed overlay — navbar floats above page content, zero layout impact */}
            <div className="fixed top-0 left-0 right-0 z-50">
                <NavBar />
            </div>
            <main>
                {children}
            </main>
            <Footer />
        </div>
    );
}
