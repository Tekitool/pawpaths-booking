// components/admin/MobileDrawer.tsx
// Full-screen drawer for mobile admin navigation. Shows all menu groups.

'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { X } from 'lucide-react';
import {
    LayoutGrid,
    Calendar,
    Plane,
    ClipboardList,
    Users,
    PawPrint,
    Tag,
    PieChart,
    FileText,
    Receipt,
    CreditCard,
    BarChart3,
    Settings,
    UserCog,
    Wrench,
    Palette,
} from 'lucide-react';
import { canAccessMenuGroup, canAccessRoute } from '@/lib/constants/permissions';
import type { Role } from '@/lib/constants/roles';

const MENU_ITEMS = [
    {
        group: 'MAIN',
        items: [
            { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutGrid },
            { label: 'Calendar', href: '/admin/calendar', icon: Calendar },
        ],
    },
    {
        group: 'OPERATIONS',
        items: [
            { label: 'Relocations', href: '/admin/relocations', icon: Plane },
            { label: 'Tasks', href: '/admin/tasks', icon: ClipboardList },
        ],
    },
    {
        group: 'CRM & ASSETS',
        items: [
            { label: 'Customers', href: '/admin/customers', icon: Users },
            { label: 'Services', href: '/admin/services', icon: Tag },
            { label: 'Pet Registry', href: '/admin/pets', icon: PawPrint },
            { label: 'Task Templates', href: '/admin/task-templates', icon: ClipboardList },
        ],
    },
    {
        group: 'FINANCE',
        items: [
            { label: 'Summary', href: '/admin/summary', icon: PieChart },
            { label: 'Quotations', href: '/admin/quotes', icon: FileText },
            { label: 'Invoices', href: '/admin/invoices', icon: Receipt },
            { label: 'Expenses', href: '/admin/expenses', icon: CreditCard },
            { label: 'Reports', href: '/admin/reports', icon: BarChart3 },
        ],
    },
    {
        group: 'SYSTEM',
        items: [
            { label: 'Settings', href: '/admin/settings', icon: Settings },
            { label: 'Users', href: '/admin/users', icon: UserCog },
            { label: 'Tools', href: '/tools', icon: Wrench, external: true },
            { label: 'Themes', href: '/admin/themes', icon: Palette },
        ],
    },
];

interface MobileDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    userRole?: Role;
}

export default function MobileDrawer({ isOpen, onClose, userRole = 'staff' }: MobileDrawerProps) {
    const pathname = usePathname();

    const filteredMenu = MENU_ITEMS
        .filter(group => canAccessMenuGroup(userRole, group.group))
        .map(group => ({
            ...group,
            items: group.items.filter(item => canAccessRoute(userRole, item.href)),
        }))
        .filter(group => group.items.length > 0);
    const overlayRef = useRef<HTMLDivElement>(null);

    // Close on Escape
    useEffect(() => {
        if (!isOpen) return;
        const fn = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', fn);
        return () => document.removeEventListener('keydown', fn);
    }, [isOpen, onClose]);

    // Lock body scroll when open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] md:hidden">
            {/* Backdrop */}
            <div
                ref={overlayRef}
                className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
                onClick={onClose}
            />

            {/* Drawer panel — slides in from left */}
            <div className="absolute inset-y-0 left-0 w-72 bg-white shadow-2xl animate-in slide-in-from-left duration-300 flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between h-16 px-5 border-b border-gray-100 shrink-0">
                    <div className="relative h-8 w-28">
                        <Image
                            src="/pplogo.svg"
                            alt="Pawpaths Logo"
                            fill
                            className="object-contain"
                            priority
                        />
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                        aria-label="Close menu"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-3">
                    {filteredMenu.map((group, idx) => (
                        <div key={idx}>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-3 mb-1">
                                {group.group}
                            </p>
                            <div className="space-y-0.5">
                                {group.items.map((item) => {
                                    const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            onClick={item.external ? undefined : onClose}
                                            target={item.external ? "_blank" : undefined}
                                            rel={item.external ? "noopener noreferrer" : undefined}
                                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${isActive
                                                    ? 'bg-accent text-white shadow-sm'
                                                    : 'text-gray-600 hover:bg-gray-50 active:bg-gray-100'
                                                }`}
                                        >
                                            <item.icon
                                                size={18}
                                                className={isActive ? 'text-white' : 'text-gray-400'}
                                                strokeWidth={isActive ? 2.5 : 2}
                                            />
                                            {item.label}
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </nav>
            </div>
        </div>
    );
}
