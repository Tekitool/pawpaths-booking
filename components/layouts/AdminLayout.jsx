'use client';

import { useState, useEffect } from 'react';
import Sidebar from '../dashboard/Sidebar';
import AdminHeader from '../admin/AdminHeader';
import ElegantFooter from '../ui/ElegantFooter';

export default function AdminLayout({ children, user }) {
    const [isCollapsed, setIsCollapsed] = useState(false);

    // Persist state
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
            {/* Sidebar */}
            <Sidebar isCollapsed={isCollapsed} toggleSidebar={toggleSidebar} />

            {/* Main Content */}
            <div className="flex-1 flex flex-col h-screen overflow-hidden transition-all duration-300">
                <AdminHeader user={user} />
                <main className="flex-1 overflow-y-auto bg-brand-text-02/5/50 rounded-tl-[40px] border-t border-l border-white/60 shadow-[inset_0_4px_20px_rgba(0,0,0,0.02)] flex flex-col">
                    <div className="flex-1 p-8">
                        {children}
                    </div>
                    <div className="mt-auto">
                        <ElegantFooter />
                    </div>
                </main>
            </div>
        </div>
    );
}
