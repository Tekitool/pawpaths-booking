'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
    ArrowLeft, Save, Camera, Lock, Trash2, Mail, Shield,
    User, Check, AlertTriangle, Loader2
} from 'lucide-react';
import Image from 'next/image';
import { toast } from 'sonner';
import { createUserAction, updateUserAction, deleteUserAction, sendPasswordResetAction } from '@/lib/actions/manageUser';
import UnsavedChangesModal from '@/components/admin/UnsavedChangesModal';

// --- Zod Schema ---
const userSchema = z.object({
    firstName: z.string().min(2, 'First name is required'),
    lastName: z.string().min(2, 'Last name is required'),
    email: z.string().email('Invalid email address'),
    role: z.enum(['admin', 'staff', 'customer']),
    status: z.boolean(), // true = Active, false = Suspended
    password: z.string().optional(),
});

type UserFormValues = z.infer<typeof userSchema>;

interface UserFormProps {
    userId: string;
    initialData?: any;
    isNew: boolean;
}

export default function UserForm({ userId, initialData, isNew }: UserFormProps) {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(initialData?.avatar_url || null);
    const [showDiscardModal, setShowDiscardModal] = useState(false);

    // Log initial data on mount
    useEffect(() => {
        console.log('[UserForm] Component mounted');
        console.log('[UserForm] userId:', userId);
        console.log('[UserForm] isNew:', isNew);
        console.log('[UserForm] initialData:', JSON.stringify(initialData, null, 2));
    }, []);

    // Parse initial name
    const [initialFirst, ...initialLastParts] = (initialData?.full_name || '').split(' ');
    const initialLast = initialLastParts.join(' ');

    console.log('[UserForm] Parsed name - First:', initialFirst, 'Last:', initialLast);

    const form = useForm<UserFormValues>({
        resolver: zodResolver(userSchema),
        defaultValues: {
            firstName: initialFirst || '',
            lastName: initialLast || '',
            email: initialData?.email || '',
            role: initialData?.role || 'customer',
            status: initialData?.status !== 'Suspended' && initialData?.status !== false, // Default to true (Active)
            password: '',
        }
    });

    const { register, handleSubmit, control, formState: { errors, isDirty }, watch, reset } = form;
    const currentRole = watch('role');
    const currentStatus = watch('status');

    // --- Sync Initial Data ---
    useEffect(() => {
        if (initialData) {
            console.log('[UserForm] useEffect - Syncing initialData:', initialData);
            const [first, ...lastParts] = (initialData.full_name || '').split(' ');
            const last = lastParts.join(' ');

            const formValues = {
                firstName: first || '',
                lastName: last || '',
                email: initialData.email || '',
                role: initialData.role || 'customer',
                status: initialData.status !== 'Suspended' && initialData.status !== false,
                password: '',
            };

            console.log('[UserForm] Resetting form with values:', formValues);
            reset(formValues);
            setAvatarPreview(initialData.avatar_url || null);
        }
    }, [initialData, reset]);

    // --- Unsaved Changes Protection ---
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (isDirty) {
                e.preventDefault();
                e.returnValue = '';
            }
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [isDirty]);

    const handleCancel = () => {
        if (isDirty) {
            setShowDiscardModal(true);
        } else {
            router.push('/admin/users');
        }
    };

    // --- Actions ---
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setAvatarFile(file);
            setAvatarPreview(URL.createObjectURL(file));
            // Mark form as dirty manually if needed, or rely on other fields. 
            // Since file input isn't registered, we might need to set a hidden field or just accept it.
        }
    };

    const onSubmit = async (data: UserFormValues) => {
        setIsSubmitting(true);
        try {
            let avatarPath = avatarPreview;

            // Upload Avatar if changed
            if (avatarFile) {
                const uploadData = new FormData();
                uploadData.append('file', avatarFile);
                const uploadRes = await fetch('/api/upload/avatar', { method: 'POST', body: uploadData });
                const uploadResult = await uploadRes.json();
                if (uploadResult.success) {
                    avatarPath = uploadResult.path;
                } else {
                    throw new Error('Avatar upload failed');
                }
            }

            const payload = { ...data, avatar: avatarPath };

            let result;
            if (isNew) {
                if (!data.password) {
                    toast.error('Password is required for new users');
                    setIsSubmitting(false);
                    return;
                }
                result = await createUserAction(payload);
            } else {
                result = await updateUserAction(userId, payload);
            }

            if (result.success) {
                toast.success(isNew ? 'User created successfully' : 'User updated successfully');
                router.push('/admin/users');
            } else {
                toast.error(result.message || 'Operation failed');
            }
        } catch (error) {
            console.error('Submit Error:', error);
            toast.error('An unexpected error occurred');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
            const result = await deleteUserAction(userId);
            if (result.success) {
                toast.success('User deleted');
                router.push('/admin/users');
            } else {
                toast.error(result.message);
            }
        }
    };

    const handleResetPassword = async () => {
        const email = form.getValues('email');
        if (!email) return;
        const result = await sendPasswordResetAction(email);
        if (result.success) {
            toast.success(`Password reset email sent to ${email}`);
        } else {
            toast.error(result.message);
        }
    };

    return (
        <div className="min-h-screen bg-[#F9FAFB] pb-20 font-sans text-gray-900">
            {/* Zone A: Header */}
            <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-200 px-6 py-4">
                <div className="max-w-6xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={handleCancel}
                            className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors"
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <h1 className="text-xl font-bold text-gray-900 tracking-tight">
                            {isNew ? 'Create New User' : 'Edit User'}
                        </h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={handleCancel}
                            className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit(onSubmit)}
                            disabled={isSubmitting}
                            className="px-5 py-2.5 text-sm font-medium text-white bg-brand-color-03 rounded-lg shadow-sm hover:brightness-110 active:scale-[0.98] transition-all flex items-center gap-2 disabled:opacity-70 disabled:hover:brightness-100"
                        >
                            {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                            {isNew ? 'Create User' : 'Save Changes'}
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-6xl mx-auto p-6 space-y-8">
                {/* Zone B: Identity Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Left Panel: Profile Details */}
                    <section className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-[0px_2px_4px_rgba(0,0,0,0.02)] p-8">
                        <div className="flex flex-col md:flex-row gap-8">
                            {/* Avatar */}
                            <div className="flex flex-col items-center space-y-4">
                                <div className="relative w-20 h-20 rounded-[20px] overflow-hidden bg-gray-100 border border-gray-200 group cursor-pointer">
                                    {avatarPreview ? (
                                        <Image
                                            src={avatarPreview}
                                            alt="Avatar"
                                            fill
                                            className="object-cover"
                                            unoptimized={avatarPreview.startsWith('blob:')}
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                                            <User size={32} />
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Camera className="text-white" size={20} />
                                    </div>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                        onChange={handleFileChange}
                                    />
                                </div>
                            </div>

                            {/* Fields */}
                            <div className="flex-1 space-y-6">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-1.5">
                                        <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">First Name</label>
                                        <input
                                            {...register('firstName')}
                                            className="w-full px-3 py-2.5 bg-gray-50 border border-transparent rounded-lg text-[14px] font-medium text-gray-900 focus:bg-white focus:ring-2 focus:ring-gray-100 outline-none transition-all placeholder:text-gray-400"
                                            placeholder="Jane"
                                        />
                                        {errors.firstName && <p className="text-xs text-red-500">{errors.firstName.message}</p>}
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">Last Name</label>
                                        <input
                                            {...register('lastName')}
                                            className="w-full px-3 py-2.5 bg-gray-50 border border-transparent rounded-lg text-[14px] font-medium text-gray-900 focus:bg-white focus:ring-2 focus:ring-gray-100 outline-none transition-all placeholder:text-gray-400"
                                            placeholder="Doe"
                                        />
                                        {errors.lastName && <p className="text-xs text-red-500">{errors.lastName.message}</p>}
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                        Email Address
                                        {!isNew && <Lock size={10} className="text-gray-400" />}
                                    </label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                        <input
                                            {...register('email')}
                                            type="email"
                                            className="w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-transparent rounded-lg text-[14px] font-medium text-gray-900 focus:bg-white focus:ring-2 focus:ring-gray-100 outline-none transition-all placeholder:text-gray-400"
                                            placeholder="jane@example.com"
                                        />
                                    </div>
                                    {!isNew && <p className="text-xs text-gray-400 flex items-center gap-1"><Lock size={10} /> Changing email requires re-verification.</p>}
                                    {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Right Panel: Access Control */}
                    <section className="bg-white rounded-xl border border-gray-200 shadow-[0px_2px_4px_rgba(0,0,0,0.02)] p-8 space-y-8">

                        {/* Role Selector */}
                        <div className="space-y-3">
                            <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">Role</label>
                            <div className="space-y-2">
                                {['admin', 'staff', 'customer'].map((role) => (
                                    <label
                                        key={role}
                                        className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${currentRole === role
                                            ? 'bg-blue-50 border-blue-200 shadow-sm'
                                            : 'bg-white border-gray-200 hover:bg-gray-50'
                                            }`}
                                    >
                                        <input
                                            type="radio"
                                            value={role}
                                            {...register('role')}
                                            className="hidden"
                                        />
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${role === 'admin' ? 'bg-purple-100 text-purple-600' :
                                            role === 'staff' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'
                                            }`}>
                                            <Shield size={16} />
                                        </div>
                                        <span className="text-sm font-medium capitalize text-gray-900">{role}</span>
                                        {currentRole === role && <Check size={16} className="ml-auto text-blue-600" />}
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Status Toggle */}
                        <div className="pt-6 border-t border-gray-100">
                            <div className="flex items-center justify-between">
                                <div>
                                    <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest block mb-1">Status</label>
                                    <p className="text-sm font-medium text-gray-900">{currentStatus ? 'Active Account' : 'Suspended'}</p>
                                </div>
                                <Controller
                                    name="status"
                                    control={control}
                                    render={({ field: { value, onChange } }) => (
                                        <button
                                            type="button"
                                            onClick={() => onChange(!value)}
                                            className={`relative w-12 h-7 rounded-full transition-colors ${value ? 'bg-gray-900' : 'bg-gray-200'}`}
                                        >
                                            <span className={`absolute left-1 top-1 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${value ? 'translate-x-5' : 'translate-x-0'}`} />
                                        </button>
                                    )}
                                />
                            </div>
                        </div>
                    </section>
                </div>

                {/* Zone C: Security Footer */}
                <section className="bg-white rounded-xl border border-gray-200 shadow-[0px_2px_4px_rgba(0,0,0,0.02)] p-8">
                    <h3 className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                        <Shield size={12} /> Security Zone
                    </h3>

                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="w-full md:w-auto">
                            {isNew ? (
                                <div className="space-y-1.5 w-full md:w-80">
                                    <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">Temporary Password</label>
                                    <input
                                        {...register('password')}
                                        type="password"
                                        className="w-full px-3 py-2.5 bg-gray-50 border border-transparent rounded-lg text-[14px] font-medium text-gray-900 focus:bg-white focus:ring-2 focus:ring-gray-100 outline-none transition-all placeholder:text-gray-400"
                                        placeholder="••••••••"
                                    />
                                    {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
                                </div>
                            ) : (
                                <button
                                    onClick={handleResetPassword}
                                    type="button"
                                    className="px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg text-sm font-medium transition-colors border border-gray-200 flex items-center gap-2"
                                >
                                    <Mail size={16} />
                                    Send Password Reset Email
                                </button>
                            )}
                        </div>

                        {!isNew && (
                            <button
                                onClick={handleDelete}
                                type="button"
                                className="text-red-500 hover:text-red-700 text-sm font-medium transition-colors flex items-center gap-2 px-4 py-2 hover:bg-red-50 rounded-lg"
                            >
                                <Trash2 size={16} />
                                Delete User
                            </button>
                        )}
                    </div>
                </section>
            </main>

            <UnsavedChangesModal
                isOpen={showDiscardModal}
                onClose={() => setShowDiscardModal(false)}
                onConfirm={() => router.push('/admin/users')}
            />
        </div>
    );
}
