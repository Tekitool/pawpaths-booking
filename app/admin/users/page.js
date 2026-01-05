'use client';

import React, { useState, useEffect, Suspense, useMemo } from 'react';
import {
    UserPlus, Search, Edit, Trash2, Loader2,
    Users, UserCheck, Clock
} from 'lucide-react';
import Button from '@/components/ui/Button';
import SearchBar from '@/components/admin/SearchBar';
import Image from 'next/image';
import { getUsers, deleteUser } from '@/lib/actions/user-actions';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import SecurityModal from '@/components/ui/SecurityModal';

export default function UsersPage() {
    const [session, setSession] = useState(null);
    const [userRole, setUserRole] = useState(null);

    useEffect(() => {
        const fetchSessionAndRole = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setSession(session);

            if (session?.user) {
                // Fetch user profile from database to get role
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', session.user.id)
                    .single();

                if (profile) {
                    setUserRole(profile.role);
                }
            }
        };

        fetchSessionAndRole();
    }, []);
    const searchParams = useSearchParams();
    const query = searchParams.get('query') || '';

    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [roleFilter, setRoleFilter] = useState('All');
    const [statusFilter, setStatusFilter] = useState('All');

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [currentUser, setCurrentUser] = useState(null); // For delete
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Get role from user metadata or from a profile query
    const currentUserRole = userRole || session?.user?.user_metadata?.role || session?.user?.role;
    const isAdmin = currentUserRole?.toLowerCase() === 'admin' || currentUserRole?.toLowerCase() === 'super_admin';

    // For debugging - log the session to check structure
    useEffect(() => {
        if (session) {
            console.log('Session:', session);
            console.log('User Role:', currentUserRole);
            console.log('Is Admin:', isAdmin);
        }
    }, [session, currentUserRole, isAdmin]);

    useEffect(() => {
        fetchUsers();
    }, [currentUserRole]);

    // Filter users based on Search, Role, and Status
    const filteredUsers = useMemo(() => {
        return users.filter(user => {
            const matchesSearch =
                user.name.toLowerCase().includes(query.toLowerCase()) ||
                user.email.toLowerCase().includes(query.toLowerCase());

            const matchesRole = roleFilter === 'All' || user.role.toLowerCase() === roleFilter.toLowerCase();

            const matchesStatus = statusFilter === 'All' ||
                (statusFilter === 'Active' && user.status === 'Active') ||
                (statusFilter === 'Inactive' && user.status !== 'Active');

            return matchesSearch && matchesRole && matchesStatus;
        });
    }, [users, query, roleFilter, statusFilter]);

    // Calculate Stats
    const stats = useMemo(() => {
        const total = users.length;
        const active = users.filter(u => u.status === 'Active').length;
        const newThisMonth = users.filter(u => {
            const date = new Date(u.joined);
            const now = new Date();
            return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
        }).length;

        return [
            { label: 'Total Users', value: total, icon: Users, textColor: 'text-blue-700', borderColor: 'border-blue-200', bg: 'bg-surface-cool' },
            { label: 'Active Users', value: active, icon: UserCheck, textColor: 'text-green-700', borderColor: 'border-green-200', bg: 'bg-surface-fresh' },
            { label: 'New This Month', value: newThisMonth, icon: Clock, textColor: 'text-orange-700', borderColor: 'border-orange-200', bg: 'bg-surface-warm' },
        ];
    }, [users]);

    const fetchUsers = async () => {
        try {
            const data = await getUsers();
            setUsers(data);
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteClick = (user) => {
        setCurrentUser(user);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async (reason) => {
        if (!currentUser) return;
        setIsSubmitting(true);
        try {
            const result = await deleteUser(currentUser._id, reason);
            if (result.success) {
                await fetchUsers();
                setIsDeleteModalOpen(false);
                setCurrentUser(null);
                toast.success("User deleted successfully");
            } else {
                toast.error(result.message);
            }
        } catch (error) {
            console.error('Delete failed:', error);
            toast.error('Failed to delete user');
        } finally {
            setIsSubmitting(false);
        }
    };

    const getRoleBadge = (role) => {
        const normalizedRole = role.toLowerCase();
        const styles = {
            admin: 'bg-indigo-50 text-indigo-700',
            staff: 'bg-blue-50 text-blue-700',
            customer: 'bg-gray-100 text-gray-700'
        };
        const style = styles[normalizedRole] || styles.customer;

        return (
            <span className={`px-2.5 py-0.5 rounded-md text-xs font-medium ${style} border border-transparent`}>
                {role.charAt(0).toUpperCase() + role.slice(1)}
            </span>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50/50 p-8 space-y-8 font-sans text-gray-900">

            {/* Component 1: Bento Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {stats.map((stat, index) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`rounded-xl p-5 border shadow-sm flex items-center justify-between group transition-colors ${stat.bg} ${stat.borderColor}`}
                    >
                        <div>
                            <p className={`text-sm font-medium mb-1 ${stat.textColor} opacity-80`}>{stat.label}</p>
                            <h3 className={`text-2xl font-bold tracking-tight ${stat.textColor}`}>{stat.value}</h3>
                        </div>
                        <div className={`p-3 rounded-xl bg-white/50 border ${stat.borderColor} ${stat.textColor} group-hover:scale-110 transition-transform duration-300`}>
                            <stat.icon size={20} />
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Component 2: Control Bar */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="relative w-full md:w-96 group">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-gray-600 transition-colors">
                        <Search size={18} />
                    </div>
                    <Suspense>
                        <SearchBar
                            placeholder="Search users..."
                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-gray-300 transition-all shadow-sm placeholder:text-gray-400"
                        />
                    </Suspense>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                    <div className="flex items-center gap-2 p-1 bg-gray-100/50 rounded-lg border border-gray-200">
                        {['All', 'Admin', 'Staff', 'Customer'].map((role) => (
                            <button
                                key={role}
                                onClick={() => setRoleFilter(role)}
                                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${roleFilter === role
                                    ? 'bg-white text-gray-900 shadow-sm border border-gray-200'
                                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
                                    }`}
                            >
                                {role}
                            </button>
                        ))}
                    </div>

                    {isAdmin && (
                        <Link
                            href="/admin/users/new"
                            className="bg-brand-color-03 hover:brightness-110 text-white px-4 py-2.5 rounded-lg text-sm font-medium shadow-sm flex items-center gap-2 transition-all active:scale-95 hover:shadow-md"
                        >
                            <UserPlus size={16} />
                            Add User
                        </Link>
                    )}
                </div>
            </div>

            {/* Component 3: Data Table */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50/80 backdrop-blur-sm sticky top-0 z-10">
                            <tr>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200">User</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200">Role</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200">Status</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200">Joined</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            <AnimatePresence mode="wait">
                                {loading ? (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                                            <div className="flex justify-center items-center gap-2">
                                                <Loader2 className="animate-spin" size={20} /> Loading users...
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredUsers.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                                            No users found matching your filters.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredUsers.map((user, index) => (
                                        <motion.tr
                                            key={user._id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            className="group hover:bg-gray-50/80 transition-colors cursor-pointer"
                                        >
                                            <td className="px-6 py-4">
                                                <Link href={`/admin/users/${user._id}`} className="group/user flex items-center gap-4">
                                                    <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-100 border border-gray-200">
                                                        <Image
                                                            src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`}
                                                            alt={user.name}
                                                            fill
                                                            sizes="40px"
                                                            className="object-cover"
                                                        />
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-gray-900 text-sm group-hover/user:text-blue-600 transition-colors">{user.name}</p>
                                                        <p className="text-xs text-gray-500 mt-0.5">{user.email}</p>
                                                    </div>
                                                </Link>
                                            </td>
                                            <td className="px-6 py-4">
                                                {getRoleBadge(user.role)}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <span className={`relative flex h-2 w-2`}>
                                                        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${user.status === 'Active' ? 'bg-green-400' : 'bg-gray-400'}`}></span>
                                                        <span className={`relative inline-flex rounded-full h-2 w-2 ${user.status === 'Active' ? 'bg-green-500' : 'bg-gray-500'}`}></span>
                                                    </span>
                                                    <span className={`text-sm font-medium ${user.status === 'Active' ? 'text-gray-700' : 'text-gray-500'}`}>
                                                        {user.status}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500">
                                                {new Date(user.joined).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-2 transition-all duration-300">
                                                    <Link
                                                        href={isAdmin ? `/admin/users/${user._id}` : '#'}
                                                        onClick={(e) => {
                                                            if (!isAdmin) {
                                                                e.preventDefault();
                                                                toast.error('You do not have permission to edit users');
                                                            }
                                                        }}
                                                        className={`p-2 rounded-lg border transition-all ${isAdmin
                                                            ? 'opacity-60 border-transparent hover:opacity-100 hover:bg-white hover:border-brand-color-04/30 hover:shadow-sm text-[color:oklch(var(--brand-color-04))] cursor-pointer'
                                                            : 'opacity-30 border-transparent text-gray-400 cursor-not-allowed'
                                                            }`}
                                                        title={isAdmin ? "Edit" : "No permission"}
                                                    >
                                                        <Edit size={18} />
                                                    </Link>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            if (isAdmin) {
                                                                handleDeleteClick(user);
                                                            } else {
                                                                toast.error('You do not have permission to delete users');
                                                            }
                                                        }}
                                                        disabled={!isAdmin}
                                                        className={`p-2 rounded-lg border transition-all ${isAdmin
                                                            ? 'opacity-60 border-transparent hover:opacity-100 hover:bg-white hover:border-system-color-01/30 hover:shadow-sm text-[color:oklch(var(--system-color-01))] cursor-pointer'
                                                            : 'opacity-30 border-transparent text-gray-400 cursor-not-allowed'
                                                            }`}
                                                        title={isAdmin ? "Delete" : "No permission"}
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))
                                )}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>

                {/* Footer / Pagination */}
                <div className="px-6 py-4 border-t border-gray-200 bg-gray-50/50 flex items-center justify-between">
                    <p className="text-xs text-gray-500">
                        Showing <span className="font-semibold text-gray-900">{filteredUsers.length}</span> of <span className="font-semibold text-gray-900">{users.length}</span> users
                    </p>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" disabled className="h-8 text-xs rounded-lg border-gray-200 text-gray-500">Previous</Button>
                        <Button variant="outline" size="sm" disabled className="h-8 text-xs rounded-lg border-gray-200 text-gray-500">Next</Button>
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            <SecurityModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title={`Delete User: ${currentUser?.name}?`}
                actionType="danger"
                isLoading={isSubmitting}
            />
        </div>
    );
}
