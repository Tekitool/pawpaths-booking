'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
    LayoutGrid,
    Calendar,
    Plane,
    ClipboardList,
    Users,
    PawPrint,
    FileText,
    Receipt,
    Tag,
    Settings,
    ChevronLeft,
    ChevronRight,
    PieChart,
    CreditCard,
    BarChart3,
    Palette,
    UserCog,
    Wrench
} from 'lucide-react';

const MENU_ITEMS = [
    {
        group: 'MAIN',
        items: [
            { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutGrid },
            { label: 'Calendar', href: '/admin/calendar', icon: Calendar }
        ]
    },
    {
        group: 'OPERATIONS',
        items: [
            { label: 'Relocations', href: '/admin/relocations', icon: Plane },
            { label: 'Tasks', href: '/admin/tasks', icon: ClipboardList }
        ]
    },
    {
        group: 'CRM & ASSETS',
        items: [
            { label: 'Customers', href: '/admin/customers', icon: Users },
            { label: 'Services', href: '/admin/services', icon: Tag },
            { label: 'Pet Registry', href: '/admin/pets', icon: PawPrint },
            { label: 'Task Templates', href: '/admin/task-templates', icon: ClipboardList }
        ]
    },
    {
        group: 'FINANCE',
        items: [
            { label: 'Summary', href: '/admin/summary', icon: PieChart },
            { label: 'Quotations', href: '/admin/quotes', icon: FileText },
            { label: 'Invoices', href: '/admin/invoices', icon: Receipt },
            { label: 'Expenses', href: '/admin/expenses', icon: CreditCard },
            { label: 'Reports', href: '/admin/reports', icon: BarChart3 }
        ]
    },
    {
        group: 'SYSTEM',
        items: [
            { label: 'Settings', href: '/admin/settings', icon: Settings },
            { label: 'Users', href: '/admin/users', icon: UserCog },
            { label: 'Tools', href: '/tools', icon: Wrench },
            { label: 'Themes', href: '/admin/themes', icon: Palette }
        ]
    }
];

export default function Sidebar({ isCollapsed, toggleSidebar }) {
    const pathname = usePathname();

    return (
        <aside
            className={`${isCollapsed ? 'w-20' : 'w-[11.5rem]'} bg-surface-warm border-r border-accent/20 hidden md:flex flex-col z-50 transition-all duration-300 ease-in-out relative h-screen shadow-xl shadow-accent/5`}
        >
            {/* Toggle Button */}
            <button
                onClick={toggleSidebar}
                className="absolute -right-3 top-8 w-6 h-6 bg-white border border-accent/30 rounded-full flex items-center justify-center shadow-sm hover:bg-accent/10 text-accent z-50 cursor-pointer transition-colors"
            >
                {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
            </button>

            {/* Logo Area */}
            <div className={`h-16 flex items-center ${isCollapsed ? 'justify-center' : 'justify-start px-4'} transition-all duration-300 border-b border-accent/10`}>
                <div className={`relative ${isCollapsed ? 'h-8 w-8' : 'h-10 w-32'} transition-all duration-300`}>
                    {isCollapsed ? (
                        <Image
                            src="/ppicon.svg"
                            alt="PP"
                            fill
                            className="object-contain"
                            priority
                        />
                    ) : (
                        <Image
                            src="/pplogo.svg"
                            alt="Pawpaths Logo"
                            fill
                            className="object-contain"
                            priority
                        />
                    )}
                </div>
            </div>

            {/* Nav */}
            <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-2 scrollbar-hide">
                {MENU_ITEMS.map((group, idx) => (
                    <div key={idx} className="flex flex-col">
                        {/* THE STABILIZER HEADER - Always renders with fixed height */}
                        <div className={`flex items-center shrink-0 h-6 transition-all duration-300 ${isCollapsed ? 'justify-center px-2' : 'px-3'}`}>
                            {!isCollapsed ? (
                                <span className="text-[11px] font-bold text-brand-text-02/60 uppercase tracking-wider">
                                    {group.group}
                                </span>
                            ) : (
                                /* When collapsed, show a subtle divider to maintain identical spacing */
                                <div className="h-[1px] w-4 bg-brand-text-02/20 mx-auto" />
                            )}
                        </div>

                        {/* THE ITEMS - Fixed height navigation links */}
                        <div className="space-y-0">
                            {group.items.map((item) => {
                                const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={`flex items-center h-8 ${isCollapsed ? 'justify-center' : 'gap-2.5 px-3'} rounded-md transition-all duration-200 group
                                            ${isActive
                                                ? 'bg-accent text-white shadow-sm'
                                                : 'text-brand-text-02 hover:bg-accent/10 hover:text-gray-900'
                                            }
                                        `}
                                        title={isCollapsed ? item.label : ''}
                                    >
                                        <item.icon
                                            size={16}
                                            className={`flex-shrink-0 ${isActive ? 'text-white' : 'text-brand-text-02/80 group-hover:text-accent'}`}
                                            strokeWidth={isActive ? 2.5 : 2}
                                        />
                                        <span className={`${isCollapsed ? 'w-0 opacity-0 hidden' : 'w-auto opacity-100 block'} text-[13px] font-medium whitespace-nowrap transition-all duration-300`}>
                                            {item.label}
                                        </span>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </nav>
        </aside>
    );
}
