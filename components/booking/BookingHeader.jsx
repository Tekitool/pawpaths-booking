'use client';

import React from 'react';
import Image from 'next/image';
import { MessageCircle, Phone } from 'lucide-react';

export default function BookingHeader() {
    return (
        <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
                {/* Left: Logo Only (Larger) */}
                <div className="flex items-center">
                    <div className="relative w-48 h-16">
                        <Image
                            src="/logo.png"
                            alt="Pawpaths Logo"
                            fill
                            className="object-contain object-left"
                            priority
                        />
                    </div>
                </div>

                {/* Right: WhatsApp Contact */}
                <a
                    href="https://wa.me/971586947755?text=Hi,%20Pawpaths,%0a%0aI%20want%20to%20know%20more%20about%20the%20pet%20relocation%20services.%0aPlease%20call%20me%20back..."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-pawpaths-brown hover:bg-pawpaths-cream/20 px-3 py-2 rounded-full transition-colors"
                >
                    <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white shadow-sm">
                        <MessageCircle size={20} fill="currentColor" className="text-white" />
                    </div>
                    <div className="hidden sm:flex flex-col items-start leading-tight">
                        <span className="text-xs text-gray-500 font-medium">Need Help?</span>
                        <span className="text-sm font-bold text-gray-900">+971 58 694 7755</span>
                    </div>
                </a>
            </div>
        </header>
    );
}
