'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { LogOut, User, ChevronDown } from 'lucide-react';
import { signOut } from 'next-auth/react';

export default function AdminHeader({ user }) {
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
        await signOut({ callbackUrl: '/login' });
    };

    // Construct local avatar path if not provided
    const avatarSrc = user?.avatar || `/users/${user?.name?.split(' ')[0].toLowerCase()}.jpg`;

    return (
        <header className="bg-[#f9f7e5] h-20 px-8 flex items-center justify-end shadow-sm border-b border-white/50 sticky top-0 z-40">
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
                            className="object-cover"
                            onError={(e) => {
                                // Fallback to UI Avatars if local image fails
                                e.target.src = `https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=random`;
                            }}
                        />
                    </div>
                    <ChevronDown size={16} className={`text-gray-500 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden py-2 animate-in fade-in zoom-in duration-200 origin-top-right">
                        {/* User Info in Dropdown */}
                        <div className="px-5 py-4 border-b border-gray-50 bg-gray-50/50">
                            <p className="text-sm font-bold text-gray-800 truncate">
                                {user?.name || 'User'} <span className="text-xs font-normal text-gray-500">({user?.role || 'Role'})</span>
                            </p>
                            <p className="text-xs text-gray-400 truncate mt-0.5">{user?.email}</p>
                        </div>

                        <div className="p-2">
                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-xl transition-colors font-medium active:bg-red-100"
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
