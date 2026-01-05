'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { LogOut, User, ChevronDown, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'sonner';

import GlobalSearch from '../dashboard/GlobalSearch';

export default function AdminHeader({ user }) {
    const router = useRouter();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
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
        setIsLoggingOut(true);
        try {
            // Sign out from Supabase
            const { error } = await supabase.auth.signOut();

            if (error) {
                console.error('Logout error:', error);
                toast.error('Failed to logout. Please try again.');
                setIsLoggingOut(false);
                return;
            }

            // Clear any local storage items
            localStorage.removeItem('adminSidebarCollapsed');

            // Show success message
            toast.success('Logged out successfully');

            // Redirect to login page
            router.push('/login');
            router.refresh();
        } catch (error) {
            console.error('Unexpected logout error:', error);
            toast.error('An unexpected error occurred');
            setIsLoggingOut(false);
        }
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
                    disabled={isLoggingOut}
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
                                disabled={isLoggingOut}
                                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 bg-red-50 border border-red-200 hover:bg-red-100 hover:border-red-300 rounded-xl transition-all duration-200 font-medium active:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoggingOut ? (
                                    <>
                                        <Loader2 size={16} className="animate-spin" />
                                        Logging out...
                                    </>
                                ) : (
                                    <>
                                        <LogOut size={16} />
                                        Logout
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
}
