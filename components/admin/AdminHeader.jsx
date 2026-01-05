'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { LogOut, User, ChevronDown } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';

import GlobalSearch from '../dashboard/GlobalSearch';

export default function AdminHeader({ user }) {
    const router = useRouter();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [dropdownRef]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/login');
    };

    // Construct local avatar path if not provided
    // Use UI Avatars as default if no avatar provided
    const avatarSrc = user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=random`;

    return (
        <header className="bg-surface-warm h-20 px-8 flex items-center justify-between shadow-sm border-b border-white/50 sticky top-0 z-40">
            {/* Global Search */}
            <div className="flex-1 max-w-xl mr-4">
                <GlobalSearch />
            </div>

            <div className="relative" ref={dropdownRef}>
                <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center gap-3 focus:outline-none group"
                >
                    {/* Name removed from here as requested */}

                    <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-md group-hover:shadow-lg transition-shadow bg-white">
                        <Image
                            src={avatarSrc}
                            alt="User Avatar"
                            fill
                            sizes="40px"
                            className="object-cover"
                            onError={() => {
                                // Fallback is handled by initial logic or we could use state if needed, 
                                // but for now assuming avatarSrc is valid or we accept broken image if next/image fails.
                                // To truly fallback, we'd need state.
                            }}
                        />
                    </div>
                    <ChevronDown size={16} className={`text-brand-text-02/80 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-brand-text-02/20 overflow-hidden py-2 animate-in fade-in zoom-in duration-200 origin-top-right">
                        {/* User Info in Dropdown */}
                        <div className="px-5 py-4 border-b border-gray-50 bg-brand-text-02/5/50">
                            <p className="text-sm font-bold text-brand-text-02 truncate">
                                {user?.name || 'User'} <span className="text-xs font-normal text-brand-text-02/80">({user?.role || 'Role'})</span>
                            </p>
                            <p className="text-xs text-brand-text-02/60 truncate mt-0.5">{user?.email}</p>
                        </div>

                        <div className="p-2">
                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-error hover:bg-error/10 rounded-xl transition-colors font-medium active:bg-error/10"
                            >
                                <LogOut size={16} />
                                Logout
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
}
