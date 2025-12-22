'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { UserPlus, Search, Edit, Trash2, Shield, User, Mail, Calendar, CheckCircle, XCircle, X, Loader2 } from 'lucide-react';
import Button from '@/components/ui/Button';
import SearchBar from '@/components/admin/SearchBar';
import Image from 'next/image';
import { getUsers, createUser, updateUser, deleteUser } from '@/lib/actions/user-actions';
import { useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';

export default function UsersPage() {
    const { data: session } = useSession();
    const searchParams = useSearchParams();
    const query = searchParams.get('query') || '';

    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [roleFilter, setRoleFilter] = useState('All Roles');
    const [statusFilter, setStatusFilter] = useState('All Status');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [currentUser, setCurrentUser] = useState(null); // For edit/delete
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'Customer',
        status: 'Active',
        avatar: ''
    });
    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const currentUserRole = session?.user?.role;
    const isAdmin = currentUserRole?.toLowerCase() === 'admin';

    useEffect(() => {
        console.log('Current User Role:', currentUserRole);
        fetchUsers();
    }, [currentUserRole]);

    // Filter users based on Search, Role, and Status
    const filteredUsers = users.filter(user => {
        const matchesSearch =
            user.name.toLowerCase().includes(query.toLowerCase()) ||
            user.email.toLowerCase().includes(query.toLowerCase());

        const matchesRole = roleFilter === 'All Roles' || user.role.toLowerCase() === roleFilter.toLowerCase();

        const matchesStatus = statusFilter === 'All Status' ||
            (statusFilter === 'Active' && user.status === 'Active') ||
            (statusFilter === 'Inactive' && user.status !== 'Active');

        return matchesSearch && matchesRole && matchesStatus;
    });

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

    const handleOpenModal = (user = null) => {
        if (user) {
            setCurrentUser(user);
            setFormData({
                name: user.name,
                email: user.email,
                password: '', // Don't show password
                role: user.role.charAt(0).toUpperCase() + user.role.slice(1),
                status: user.status,
                avatar: user.avatar || ''
            });
            setAvatarPreview(user.avatar || null);
        } else {
            setCurrentUser(null);
            setFormData({
                name: '',
                email: '',
                password: '',
                role: 'Customer',
                status: 'Active',
                avatar: ''
            });
            setAvatarPreview(null);
        }
        setAvatarFile(null);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCurrentUser(null);
        setAvatarFile(null);
        setAvatarPreview(null);
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAvatarFile(file);
            setAvatarPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            let avatarPath = formData.avatar;

            // Upload avatar if selected
            if (avatarFile) {
                const uploadData = new FormData();
                uploadData.append('file', avatarFile);

                const uploadRes = await fetch('/api/upload/avatar', {
                    method: 'POST',
                    body: uploadData,
                });

                const uploadResult = await uploadRes.json();
                if (uploadResult.success) {
                    avatarPath = uploadResult.path;
                } else {
                    alert('Failed to upload avatar: ' + uploadResult.error);
                    setIsSubmitting(false);
                    return;
                }
            }

            const dataToSubmit = { ...formData, avatar: avatarPath };

            let result;
            if (currentUser) {
                result = await updateUser(currentUser._id, dataToSubmit);
            } else {
                result = await createUser(dataToSubmit);
            }

            if (result.success) {
                await fetchUsers();
                handleCloseModal();
            } else {
                alert(result.message);
            }
        } catch (error) {
            console.error('Operation failed:', error);
            alert('Something went wrong');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteClick = (user) => {
        setCurrentUser(user);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!currentUser) return;
        setIsSubmitting(true);
        try {
            const result = await deleteUser(currentUser._id);
            if (result.success) {
                await fetchUsers();
                setIsDeleteModalOpen(false);
                setCurrentUser(null);
            } else {
                alert(result.message);
            }
        } catch (error) {
            console.error('Delete failed:', error);
            alert('Failed to delete user');
        } finally {
            setIsSubmitting(false);
        }
    };

    const getRoleBadge = (role) => {
        const normalizedRole = role.toLowerCase();
        switch (normalizedRole) {
            case 'admin':
                return <span className="px-2 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-700 flex items-center gap-1 w-fit"><Shield size={12} /> Admin</span>;
            case 'staff':
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
        <div className="min-h-screen bg-gray-50/50 p-8 space-y-8">
            {/* ... Header ... */}

            {/* Filters & Search - Bento Style */}
            <div className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100 flex flex-col md:flex-row items-center gap-4">
                <div className="flex-1 w-full">
                    <Suspense fallback={<div>Loading...</div>}>
                        <SearchBar placeholder="Search by name or email..." />
                    </Suspense>
                </div>
                <div className="flex gap-3 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                    <div className="relative group">
                        <select
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value)}
                            className="appearance-none bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-pawpaths-brown/20 focus:border-pawpaths-brown cursor-pointer hover:bg-gray-100 transition-colors font-medium text-gray-700 min-w-[140px]"
                        >
                            <option>All Roles</option>
                            <option>Admin</option>
                            <option>Staff</option>
                            <option>Customer</option>
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 group-hover:text-pawpaths-brown transition-colors">
                            <Shield size={16} />
                        </div>
                    </div>
                    <div className="relative group">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="appearance-none bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-pawpaths-brown/20 focus:border-pawpaths-brown cursor-pointer hover:bg-gray-100 transition-colors font-medium text-gray-700 min-w-[140px]"
                        >
                            <option>All Status</option>
                            <option>Active</option>
                            <option>Inactive</option>
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 group-hover:text-pawpaths-brown transition-colors">
                            <CheckCircle size={16} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Users Table */}
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        {/* ... thead ... */}
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="px-8 py-10 text-center text-gray-500">
                                        <div className="flex justify-center items-center gap-2">
                                            <Loader2 className="animate-spin" /> Loading users...
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-8 py-10 text-center text-gray-500">
                                        No users found matching your filters.
                                    </td>
                                </tr>
                            ) : filteredUsers.map((user) => (
                                // ... row content ...

                                <tr key={user._id} className="hover:bg-pawpaths-cream/30 transition-all duration-200 group">
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-4">
                                            <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-lg shadow-pawpaths-brown/20 group-hover:scale-110 transition-transform duration-300">
                                                <Image
                                                    src={user.avatar}
                                                    alt={user.name}
                                                    fill
                                                    className="object-cover"
                                                    onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${user.name}&background=random` }} // Fallback
                                                />
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900 text-base group-hover:text-pawpaths-brown transition-colors">{user.name}</p>
                                                <p className="text-sm text-gray-500 flex items-center gap-1.5 mt-0.5"><Mail size={14} className="text-gray-400" /> {user.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        {getRoleBadge(user.role)}
                                    </td>
                                    <td className="px-8 py-5">
                                        {getStatusBadge(user.status)}
                                    </td>
                                    <td className="px-8 py-5 text-sm text-gray-600">
                                        <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg w-fit border border-gray-100">
                                            <Calendar size={14} className="text-gray-400" />
                                            {new Date(user.joined).toLocaleDateString()}
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        <div className={`flex justify-end gap-2 transition-all duration-300 ${isAdmin ? 'opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0' : 'opacity-50 cursor-not-allowed'}`}>
                                            <button
                                                onClick={() => isAdmin && handleOpenModal(user)}
                                                disabled={!isAdmin}
                                                className={`p-2.5 bg-white border border-gray-100 rounded-xl transition-all shadow-sm ${isAdmin ? 'text-gray-400 hover:text-pawpaths-brown hover:border-pawpaths-brown/30 hover:shadow-md' : 'text-gray-300 cursor-not-allowed'}`}
                                                title="Edit User"
                                            >
                                                <Edit size={18} />
                                            </button>
                                            <button
                                                onClick={() => isAdmin && handleDeleteClick(user)}
                                                disabled={!isAdmin}
                                                className={`p-2.5 bg-white border border-gray-100 rounded-xl transition-all shadow-sm ${isAdmin ? 'text-gray-400 hover:text-red-600 hover:border-red-200 hover:shadow-md' : 'text-gray-300 cursor-not-allowed'}`}
                                                title="Delete User"
                                            >
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
                <div className="px-8 py-5 border-t border-gray-100 flex items-center justify-between bg-gray-50/30">
                    <p className="text-sm text-gray-500 font-medium">Showing <span className="text-gray-900 font-bold">{users.length}</span> users</p>
                    <div className="flex gap-3">
                        <Button variant="outline" size="sm" disabled className="rounded-xl border-gray-200 hover:bg-white hover:text-pawpaths-brown hover:border-pawpaths-brown/30 transition-all">Previous</Button>
                        <Button variant="outline" size="sm" disabled className="rounded-xl border-gray-200 hover:bg-white hover:text-pawpaths-brown hover:border-pawpaths-brown/30 transition-all">Next</Button>
                    </div>
                </div>
            </div>

            {/* Add/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <h2 className="text-xl font-bold text-gray-800">{currentUser ? 'Edit User' : 'Add New User'}</h2>
                            <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600 transition-colors">
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="flex justify-center mb-4">
                                <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-gray-100 shadow-md group cursor-pointer">
                                    {avatarPreview ? (
                                        <Image
                                            src={avatarPreview}
                                            alt="Preview"
                                            fill
                                            className="object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400">
                                            <User size={40} />
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <span className="text-white text-xs font-medium">Change</span>
                                    </div>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                        onChange={handleFileChange}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-pawpaths-brown/20 focus:border-pawpaths-brown transition-all"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                                <input
                                    type="email"
                                    required
                                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-pawpaths-brown/20 focus:border-pawpaths-brown transition-all"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Password {currentUser && <span className="text-xs text-gray-400 font-normal">(Leave blank to keep current)</span>}</label>
                                <input
                                    type="password"
                                    required={!currentUser}
                                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-pawpaths-brown/20 focus:border-pawpaths-brown transition-all"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                                    <select
                                        className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-pawpaths-brown/20 focus:border-pawpaths-brown transition-all"
                                        value={formData.role}
                                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                    >
                                        <option value="Admin">Admin</option>
                                        <option value="Staff">Staff</option>
                                        <option value="Customer">Customer</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                    <select
                                        className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-pawpaths-brown/20 focus:border-pawpaths-brown transition-all"
                                        value={formData.status}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                    >
                                        <option value="Active">Active</option>
                                        <option value="Inactive">Inactive</option>
                                    </select>
                                </div>
                            </div>
                            <div className="pt-4 flex gap-3">
                                <Button type="button" variant="outline" onClick={handleCloseModal} className="flex-1 rounded-xl">Cancel</Button>
                                <Button type="submit" disabled={isSubmitting} className="flex-1 bg-pawpaths-brown text-white rounded-xl hover:bg-[#3d2815]">
                                    {isSubmitting ? 'Saving...' : 'Save User'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {isDeleteModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-6 text-center space-y-4">
                            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
                                <Trash2 size={32} />
                            </div>
                            <h2 className="text-xl font-bold text-gray-800">Delete User?</h2>
                            <p className="text-gray-500">Are you sure you want to delete <span className="font-bold text-gray-800">{currentUser?.name}</span>? This action cannot be undone.</p>
                            <div className="flex gap-3 pt-2">
                                <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)} className="flex-1 rounded-xl">Cancel</Button>
                                <Button onClick={confirmDelete} disabled={isSubmitting} className="flex-1 bg-red-600 text-white rounded-xl hover:bg-red-700">
                                    {isSubmitting ? 'Deleting...' : 'Delete'}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
