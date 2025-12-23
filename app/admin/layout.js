import Link from 'next/link';
import Image from 'next/image';
import { LayoutDashboard, FileText, Users, Settings, Box } from 'lucide-react';
import { auth } from '@/auth';
import AdminHeader from '@/components/admin/AdminHeader';

export default async function AdminLayout({ children }) {
    const session = await auth();

    return (
        <div className="flex h-screen bg-[#f9f7e5]">
            {/* Sidebar */}
            <aside className="w-72 bg-[#f9f7e5] border-r border-white/50 hidden md:flex flex-col shadow-2xl shadow-pawpaths-brown/5 z-50">
                <div className="p-8 flex justify-start pl-8">
                    <div className="relative h-12 w-40">
                        <Image
                            src="/pplogo.svg"
                            alt="Pawpaths Logo"
                            fill
                            className="object-contain"
                            priority
                        />
                    </div>
                </div>

                <nav className="flex-1 px-6 space-y-3">
                    {[
                        { href: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
                        { href: '/admin/bookings', icon: FileText, label: 'Bookings' },
                        { href: '/admin/services', icon: Box, label: 'Services' },
                        { href: '/admin/users', icon: Users, label: 'Users' },
                        { href: '/admin/settings', icon: Settings, label: 'Settings' },
                    ].map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="flex items-center gap-4 px-6 py-4 rounded-2xl bg-white text-pawpaths-brown hover:shadow-[5px_5px_10px_#d9bf8c,-5px_-5px_10px_#ffffbe] transition-all duration-300 group font-bold"
                        >
                            <item.icon size={22} className="group-hover:scale-110 transition-transform text-pawpaths-brown" />
                            <span>{item.label}</span>
                        </Link>
                    ))}
                </nav>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col h-screen overflow-hidden">
                <AdminHeader user={session?.user} />
                <main className="flex-1 overflow-y-auto p-8 bg-gray-50/50 rounded-tl-[40px] border-t border-l border-white/60 shadow-[inset_0_4px_20px_rgba(0,0,0,0.02)]">
                    {children}
                </main>
            </div>
        </div>
    );
}
