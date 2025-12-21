'use client';

import React, { useState, Suspense } from 'react';
import { UserPlus, Search, MoreVertical, Edit, Trash2, Shield, User, Mail, Calendar, CheckCircle, XCircle } from 'lucide-react';
import Button from '@/components/ui/Button';
import SearchBar from '@/components/admin/SearchBar';

const MOCK_USERS = [
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin', status: 'Active', joined: '2025-01-15' },
    { id: 2, name: 'Sarah Smith', email: 'sarah@example.com', role: 'Staff', status: 'Active', joined: '2025-02-10' },
    { id: 3, name: 'Michael Brown', email: 'michael@example.com', role: 'Customer', status: 'Inactive', joined: '2025-03-05' },
    { id: 4, name: 'Emily Wilson', email: 'emily@example.com', role: 'Staff', status: 'Active', joined: '2025-03-20' },
    { id: 5, name: 'David Lee', email: 'david@example.com', role: 'Customer', status: 'Active', joined: '2025-04-12' },
];

export default function UsersPage() {
    const [users, setUsers] = useState(MOCK_USERS);

    const getRoleBadge = (role) => {
        switch (role) {
            case 'Admin':
                return <span className="px-2 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-700 flex items-center gap-1 w-fit"><Shield size={12} /> Admin</span>;
            case 'Staff':
                return <span className="px-2 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700 flex items-center gap-1 w-fit"><User size={12} /> Staff</span>;
            default:
                return <span className="px-2 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-700 flex items-center gap-1 w-fit"><User size={12} /> Customer</span>;
        }
    };

    const getStatusBadge = (status) => {
        return status === 'Active'
            ? <span className="px-2 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 flex items-center gap-1 w-fit"><CheckCircle size={12} /> Active</span>
            : <span className="px-2 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 flex items-center gap-1 w-fit"><XCircle size={12} /> Inactive</span>;
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">User Management</h1>
                    <p className="text-gray-500 mt-1">Manage staff accounts and customer profiles</p>
                </div>
                <Button className="flex items-center gap-2 shadow-level-2 hover:shadow-level-3">
                    <UserPlus size={18} />
                    Add New User
                </Button>
            </div>

            {/* Filters & Search */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-center">
                <div className="w-full md:w-96">
                    <Suspense fallback={
                        <div className="block w-full rounded-lg border border-gray-200 py-[9px] pl-10 text-sm bg-gray-50 animate-pulse">
                            <span className="text-gray-400">Loading search...</span>
                        </div>
                    }>
                        <SearchBar placeholder="Search by name or email..." />
                    </Suspense>
                </div>
                <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                    <select className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pawpaths-brown">
                        <option>All Roles</option>
                        <option>Admin</option>
                        <option>Staff</option>
                        <option>Customer</option>
                    </select>
                    <select className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pawpaths-brown">
                        <option>All Status</option>
                        <option>Active</option>
                        <option>Inactive</option>
                    </select>
                </div>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">User</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Role</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Joined</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {users.map((user) => (
                                <tr key={user.id} className="hover:bg-gray-50/50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-pawpaths-brown/10 text-pawpaths-brown flex items-center justify-center font-bold">
                                                {user.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900">{user.name}</p>
                                                <p className="text-sm text-gray-500 flex items-center gap-1"><Mail size={12} /> {user.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {getRoleBadge(user.role)}
                                    </td>
                                    <td className="px-6 py-4">
                                        {getStatusBadge(user.status)}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        <div className="flex items-center gap-2">
                                            <Calendar size={14} className="text-gray-400" />
                                            {user.joined}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button className="p-2 text-gray-400 hover:text-pawpaths-brown hover:bg-pawpaths-brown/5 rounded-lg transition-colors" title="Edit User">
                                                <Edit size={18} />
                                            </button>
                                            <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete User">
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Placeholder */}
                <div className="px-6 py-4 border-t border-gray-50 flex items-center justify-between bg-gray-50/30">
                    <p className="text-sm text-gray-500">Showing <span className="font-medium">5</span> of <span className="font-medium">5</span> users</p>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" disabled>Previous</Button>
                        <Button variant="outline" size="sm" disabled>Next</Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
