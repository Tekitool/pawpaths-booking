'use client';

import { useState, useEffect } from 'react';
import Sidebar from '../dashboard/Sidebar';
import AdminHeader from '../admin/AdminHeader';
import MobileBottomNav from '../admin/MobileBottomNav';
import MobileDrawer from '../admin/MobileDrawer';
import ElegantFooter from '../ui/ElegantFooter';

export default function AdminLayout({ children, user }) {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    // Persist sidebar collapse state
    useEffect(() => {
        const savedState = localStorage.getItem('adminSidebarCollapsed');
        if (savedState) {
            setTimeout(() => {
                setIsCollapsed(JSON.parse(savedState));
            }, 0);
        }
    }, []);

    const toggleSidebar = () => {
        const newState = !isCollapsed;
        setIsCollapsed(newState);
        localStorage.setItem('adminSidebarCollapsed', JSON.stringify(newState));
    };

    return (
        <div className="flex h-screen bg-surface-ivory">
            {/* Desktop sidebar — hidden on mobile via its own `hidden md:flex` class */}
            <Sidebar isCollapsed={isCollapsed} toggleSidebar={toggleSidebar} userRole={user?.role || 'staff'} />

            {/* Main Content */}
            <div className="flex-1 flex flex-col h-screen overflow-hidden transition-all duration-300">
                <AdminHeader user={user} />
                <main className="flex-1 overflow-y-auto bg-brand-text-02/5/50 md:rounded-tl-[40px] md:border-t md:border-l border-white/60 shadow-[inset_0_4px_20px_rgba(0,0,0,0.02)] flex flex-col">
                    <div className="flex-1 p-4 md:p-8 pb-20 md:pb-8">
                        {children}
                    </div>
                    <div className="mt-auto hidden md:block">
                        <ElegantFooter />
                    </div>
                </main>
            </div>

            {/* Mobile bottom navigation */}
            <MobileBottomNav onMenuOpen={() => setIsDrawerOpen(true)} />

            {/* Mobile full-menu drawer */}
            <MobileDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} userRole={user?.role || 'staff'} />
        </div>
    );
}
