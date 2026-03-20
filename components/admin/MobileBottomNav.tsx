// components/admin/MobileBottomNav.tsx
// Fixed bottom navigation bar for mobile admin views. Shows 5 priority tabs.

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutGrid,
    Plane,
    ClipboardList,
    Users,
    Menu,
} from 'lucide-react';

const TABS = [
    { label: 'Home', href: '/admin/dashboard', icon: LayoutGrid },
    { label: 'Relocations', href: '/admin/relocations', icon: Plane },
    { label: 'Tasks', href: '/admin/tasks', icon: ClipboardList },
    { label: 'Customers', href: '/admin/customers', icon: Users },
] as const;

interface MobileBottomNavProps {
    onMenuOpen: () => void;
}

export default function MobileBottomNav({ onMenuOpen }: MobileBottomNavProps) {
    const pathname = usePathname();

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white border-t border-gray-200 shadow-[0_-2px_10px_rgba(0,0,0,0.06)] safe-area-bottom">
            <div className="flex items-center justify-around h-16 px-1">
                {TABS.map((tab) => {
                    const isActive = pathname === tab.href || pathname?.startsWith(tab.href + '/');
                    return (
                        <Link
                            key={tab.href}
                            href={tab.href}
                            className={`flex flex-col items-center justify-center gap-0.5 flex-1 h-full rounded-lg transition-colors ${
                                isActive
                                    ? 'text-accent'
                                    : 'text-gray-400 active:text-gray-600'
                            }`}
                        >
                            <tab.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                            <span className={`text-[10px] font-medium ${isActive ? 'font-bold' : ''}`}>
                                {tab.label}
                            </span>
                        </Link>
                    );
                })}

                {/* More button — opens full drawer */}
                <button
                    type="button"
                    onClick={onMenuOpen}
                    className="flex flex-col items-center justify-center gap-0.5 flex-1 h-full rounded-lg text-gray-400 active:text-gray-600 transition-colors"
                >
                    <Menu size={20} strokeWidth={2} />
                    <span className="text-[10px] font-medium">More</span>
                </button>
            </div>
        </nav>
    );
}
