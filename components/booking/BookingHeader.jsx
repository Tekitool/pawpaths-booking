'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MessageCircle, Phone, Settings, ArrowLeft } from 'lucide-react';

export default function BookingHeader() {
    const pathname = usePathname();
    const showBackButton = pathname?.startsWith('/tools/');

    return (
        <header className="bg-brand-color-02 backdrop-blur-xl border-b border-white/50 sticky top-0 z-50 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
                {/* Left: Logo & Back Button */}
                <div className="flex items-center gap-4">
                    <div className="relative w-48 h-16 transition-transform duration-300 hover:scale-105">
                        <Image
                            src="/logo.png"
                            alt="Pawpaths Logo"
                            fill
                            className="object-contain object-left"
                            priority
                        />
                    </div>

                    {showBackButton && (
                        <Link
                            href="/tools"
                            className="w-10 h-10 flex items-center justify-center rounded-full bg-surface-warm border border-brand-text-02/10 text-brand-text-02 hover:bg-brand-color-01 hover:text-white hover:border-brand-color-01 transition-all duration-300 shadow-sm group"
                            title="Back to Tools"
                        >
                            <ArrowLeft size={20} className="group-hover:-translate-x-0.5 transition-transform" />
                        </Link>
                    )}
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-4">
                    <a
                        href="https://wa.me/971586947755?text=Hi,%20Pawpaths,%0a%0aI%20want%20to%20know%20more%20about%20the%20pet%20relocation%20services.%0aPlease%20call%20me%20back..."
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 text-brand-color-01 hover:bg-brand-color-01/5 px-4 py-2 rounded-full transition-all duration-300 group border border-transparent hover:border-brand-color-01/10"
                    >
                        <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-system-color-02 group-hover:scale-110 transition-transform duration-300">
                            <MessageCircle size={20} fill="currentColor" className="text-white" />
                        </div>
                        <div className="hidden sm:flex flex-col items-start leading-tight">
                            <span className="text-xs text-brand-text-02/80 font-medium group-hover:text-brand-color-01 transition-colors">Need Help?</span>
                            <span className="text-sm font-bold text-gray-900">+971 58 694 7755</span>
                        </div>
                    </a>

                    <Link
                        href="/admin/dashboard"
                        className="p-2 text-accent hover:text-accent hover:bg-accent/15 rounded-full transition-all duration-300 flex-shrink-0"
                        aria-label="Dashboard"
                    >
                        <Settings size={24} />
                    </Link>
                </div>
            </div>
        </header>
    );
}
