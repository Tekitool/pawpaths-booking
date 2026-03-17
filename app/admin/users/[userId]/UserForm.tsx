'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
    ArrowLeft, Save, Camera, Lock, Mail,
    User, Loader2, Send, AlertTriangle, ChevronDown
} from 'lucide-react';
import Image from 'next/image';
import { toast } from 'sonner';
import { createUserAction, updateUserAction, deleteUserAction, sendPasswordResetAction } from '@/lib/actions/manageUser';
import UnsavedChangesModal from '@/components/admin/UnsavedChangesModal';
import DeleteUserModal from '@/components/admin/DeleteUserModal';
import { ROLES, ROLE_META } from '@/lib/constants/roles';

// ── Zod Schema ────────────────────────────────────────────────────────────────
// 'password' field intentionally removed — new users receive a secure invite email.
// role enum is derived from the shared ROLES constant (mirrors DB user_role_type).
const userSchema = z.object({
    firstName: z.string().min(2, 'First name must be at least 2 characters'),
    lastName: z.string().min(2, 'Last name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    role: z.enum(ROLES),
    status: z.boolean(),
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
    const [isSendingReset, setIsSendingReset] = useState(false);
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(initialData?.avatar_url || null);
    const [showDiscardModal, setShowDiscardModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    // ── Parse stored full_name into first / last ──────────────────────────────
    const [initialFirst, ...initialLastParts] = (initialData?.full_name || '').split(' ');
    const initialLast = initialLastParts.join(' ');

    const form = useForm<UserFormValues>({
        resolver: zodResolver(userSchema),
        defaultValues: {
            firstName: initialFirst || '',
            lastName: initialLast || '',
            email: initialData?.email || '',
            role: initialData?.role || 'customer',
            status: initialData?.status !== 'Suspended' && initialData?.status !== false,
        },
    });

    const { register, handleSubmit, control, formState: { errors, isDirty }, watch, reset } = form;
    const currentRole = watch('role');
    const currentStatus = watch('status');

    // ── Sync initialData into form when it changes (e.g. after server fetch) ──
    useEffect(() => {
        if (!initialData) return;
        const [first, ...lastParts] = (initialData.full_name || '').split(' ');
        reset({
            firstName: first || '',
            lastName: lastParts.join(' ') || '',
            email: initialData.email || '',
            role: initialData.role || 'customer',
            status: initialData.status !== 'Suspended' && initialData.status !== false,
        });
        setAvatarPreview(initialData.avatar_url || null);
    }, [initialData, reset]);

    // ── Warn on tab/window close with unsaved changes ─────────────────────────
    useEffect(() => {
        const fn = (e: BeforeUnloadEvent) => { if (isDirty) { e.preventDefault(); e.returnValue = ''; } };
        window.addEventListener('beforeunload', fn);
        return () => window.removeEventListener('beforeunload', fn);
    }, [isDirty]);

    // ── Handlers ──────────────────────────────────────────────────────────────
    const handleCancel = () => isDirty ? setShowDiscardModal(true) : router.push('/admin/users');

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setAvatarFile(file);
        setAvatarPreview(URL.createObjectURL(file));
    };

    const onSubmit = async (data: UserFormValues) => {
        setIsSubmitting(true);
        try {
            let avatarPath = avatarPreview;

            if (avatarFile) {
                const fd = new FormData();
                fd.append('file', avatarFile);
                const res = await fetch('/api/upload/avatar', { method: 'POST', body: fd });
                const result = await res.json();
                if (result.success) avatarPath = result.path;
                else throw new Error('Avatar upload failed');
            }

            const payload = { ...data, avatar: avatarPath ?? undefined };
            const result = isNew
                ? await createUserAction(payload)
                : await updateUserAction(userId, payload);

            if (result.success) {
                toast.success(isNew ? 'Invite sent — user created successfully' : 'User updated successfully');
                router.push('/admin/users');
            } else {
                toast.error(result.message || 'Operation failed');
            }
        } catch (err) {
            toast.error('An unexpected error occurred');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Called by DeleteUserModal after typed confirmation
    const handleDeleteConfirmed = async () => {
        const result = await deleteUserAction(userId);
        if (result.success) {
            toast.success('User account permanently deleted');
            router.push('/admin/users');
        } else {
            toast.error(result.message || 'Deletion failed');
        }
    };

    const handleSendReset = async () => {
        const email = form.getValues('email');
        if (!email) return;
        setIsSendingReset(true);
        const result = await sendPasswordResetAction(email);
        setIsSendingReset(false);
        result.success
            ? toast.success(`Password reset email sent to ${email}`)
            : toast.error(result.message);
    };

    const displayName = initialData?.full_name || 'this user';

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-[#F9FAFB] pb-20 font-sans text-gray-900">

            {/* ── HEADER ─────────────────────────────────────────────────────── */}
            <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-200 px-6 py-4">
                <div className="max-w-5xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleCancel}
                            className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors"
                            aria-label="Go back"
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <div>
                            <h1 className="text-lg font-bold text-gray-900 leading-tight">
                                {isNew ? 'Invite New User' : 'Edit User'}
                            </h1>
                            {!isNew && initialData?.email && (
                                <p className="text-xs text-gray-500">{initialData.email}</p>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleCancel}
                            className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors px-3 py-2 rounded-lg hover:bg-gray-100"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit(onSubmit)}
                            disabled={isSubmitting}
                            className="px-5 py-2.5 text-sm font-semibold text-white bg-brand-color-03 rounded-lg shadow-sm hover:brightness-110 active:scale-[0.98] transition-all flex items-center gap-2 disabled:opacity-60"
                        >
                            {isSubmitting ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                            {isNew ? 'Send Invite' : 'Save Changes'}
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-5xl mx-auto p-6 space-y-6">

                {/* ── SECTION 1: Identity + Access ───────────────────────────── */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* LEFT: Identity Details */}
                    <section className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-[0_2px_4px_rgba(0,0,0,0.03)] p-6 space-y-6">
                        <div className="flex items-center gap-2 pb-4 border-b border-gray-100">
                            <User size={14} className="text-gray-400" />
                            <h2 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Identity Details</h2>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-6">
                            {/* Avatar upload */}
                            <div className="flex flex-col items-center gap-2 shrink-0">
                                <div className="relative w-20 h-20 rounded-2xl overflow-hidden bg-gray-100 border border-gray-200 group cursor-pointer shadow-sm">
                                    {avatarPreview ? (
                                        <Image
                                            src={avatarPreview}
                                            alt="User avatar"
                                            fill
                                            className="object-cover"
                                            unoptimized={avatarPreview.startsWith('blob:')}
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                                            <User size={32} />
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl">
                                        <Camera className="text-white" size={18} />
                                    </div>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                        onChange={handleFileChange}
                                        aria-label="Upload avatar"
                                    />
                                </div>
                                <span className="text-[10px] text-gray-400 font-medium">Click to upload</span>
                            </div>

                            {/* Name + Email fields */}
                            <div className="flex-1 space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">First Name</label>
                                        <input
                                            {...register('firstName')}
                                            placeholder="Jane"
                                            className="w-full px-3 py-2.5 bg-gray-50 border border-transparent rounded-lg text-sm font-medium text-gray-900 focus:bg-white focus:ring-2 focus:ring-gray-200 outline-none transition-all placeholder:text-gray-300"
                                        />
                                        {errors.firstName && <p className="text-xs text-red-500">{errors.firstName.message}</p>}
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">Last Name</label>
                                        <input
                                            {...register('lastName')}
                                            placeholder="Doe"
                                            className="w-full px-3 py-2.5 bg-gray-50 border border-transparent rounded-lg text-sm font-medium text-gray-900 focus:bg-white focus:ring-2 focus:ring-gray-200 outline-none transition-all placeholder:text-gray-300"
                                        />
                                        {errors.lastName && <p className="text-xs text-red-500">{errors.lastName.message}</p>}
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                                        Email Address
                                        {!isNew && <Lock size={9} className="text-gray-400" />}
                                    </label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                                        <input
                                            {...register('email')}
                                            type="email"
                                            placeholder="jane@example.com"
                                            className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-transparent rounded-lg text-sm font-medium text-gray-900 focus:bg-white focus:ring-2 focus:ring-gray-200 outline-none transition-all placeholder:text-gray-300"
                                        />
                                    </div>
                                    {!isNew && (
                                        <p className="text-[11px] text-gray-400 flex items-center gap-1">
                                            <Lock size={9} /> Changing email triggers a re-verification flow.
                                        </p>
                                    )}
                                    {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* RIGHT: Access Control */}
                    <section className="bg-white rounded-xl border border-gray-200 shadow-[0_2px_4px_rgba(0,0,0,0.03)] p-6 space-y-6">
                        <div className="flex items-center gap-2 pb-4 border-b border-gray-100">
                            <Lock size={14} className="text-gray-400" />
                            <h2 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Access & Security</h2>
                        </div>

                        {/* Role picker */}
                        <div className="space-y-2">
                            <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">Role</label>
                            <div className="relative">
                                <select
                                    {...register('role')}
                                    className="w-full appearance-none px-3 py-2.5 pr-9 bg-gray-50 border border-transparent rounded-lg text-sm font-medium text-gray-900 focus:bg-white focus:ring-2 focus:ring-gray-200 outline-none transition-all cursor-pointer"
                                >
                                    {ROLES.map((role) => (
                                        <option key={role} value={role}>
                                            {ROLE_META[role].label}
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                            </div>
                            {errors.role && <p className="text-xs text-red-500">{errors.role.message}</p>}
                        </div>

                        {/* Status toggle */}
                        <div className="pt-4 border-t border-gray-100">
                            <div className="flex items-center justify-between">
                                <div>
                                    <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest block mb-0.5">Status</label>
                                    <p className={`text-sm font-semibold ${currentStatus ? 'text-gray-900' : 'text-red-600'}`}>
                                        {currentStatus ? 'Active Account' : 'Suspended'}
                                    </p>
                                </div>
                                <Controller
                                    name="status"
                                    control={control}
                                    render={({ field: { value, onChange } }) => (
                                        <button
                                            type="button"
                                            role="switch"
                                            aria-checked={value}
                                            onClick={() => onChange(!value)}
                                            className={`relative w-12 h-6 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 ${value ? 'bg-gray-900 focus:ring-gray-400' : 'bg-red-400 focus:ring-red-300'
                                                }`}
                                        >
                                            <span className={`absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${value ? 'translate-x-6' : 'translate-x-0'}`} />
                                        </button>
                                    )}
                                />
                            </div>
                        </div>
                    </section>
                </div>

                {/* ── SECTION 2: Security Zone ────────────────────────────────── */}
                <section className="bg-white rounded-xl border border-gray-200 shadow-[0_2px_4px_rgba(0,0,0,0.03)] p-6">
                    <div className="flex items-center gap-2 mb-5 pb-4 border-b border-gray-100">
                        <Mail size={14} className="text-gray-400" />
                        <h2 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Security Zone</h2>
                    </div>

                    {isNew ? (
                        /* ── NEW USER: explain invite flow ── */
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                            <div className="flex-1 bg-blue-50 border border-blue-100 rounded-xl p-4">
                                <p className="text-sm font-semibold text-blue-800 mb-1 flex items-center gap-2">
                                    <Send size={14} /> Secure Invite Email
                                </p>
                                <p className="text-xs text-blue-600 leading-relaxed">
                                    Clicking <strong>Send Invite</strong> above will email the user a secure magic link to set their own password.
                                    No passwords are ever set by admins. The link expires in 24 hours.
                                </p>
                            </div>
                        </div>
                    ) : (
                        /* ── EXISTING USER: password reset ── */
                        <div className="flex items-center gap-3">
                            <button
                                onClick={handleSendReset}
                                disabled={isSendingReset}
                                type="button"
                                className="px-4 py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg text-sm font-medium transition-colors border border-gray-200 flex items-center gap-2 disabled:opacity-60"
                            >
                                {isSendingReset ? <Loader2 size={15} className="animate-spin" /> : <Mail size={15} />}
                                {isSendingReset ? 'Sending…' : 'Send Password Reset Email'}
                            </button>
                            <p className="text-xs text-gray-400">
                                User receives a secure link to set a new password. Their current session is not affected.
                            </p>
                        </div>
                    )}
                </section>

                {/* ── SECTION 3: Danger Zone (edit mode only) ─────────────────── */}
                {!isNew && (
                    <section className="bg-white rounded-xl border border-red-200 shadow-[0_2px_4px_rgba(239,68,68,0.06)] p-6">
                        <div className="flex items-center gap-2 mb-4 pb-4 border-b border-red-100">
                            <AlertTriangle size={14} className="text-red-400" />
                            <h2 className="text-[11px] font-bold text-red-400 uppercase tracking-widest">Danger Zone</h2>
                        </div>

                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div>
                                <p className="text-sm font-semibold text-gray-900">Delete this account</p>
                                <p className="text-xs text-gray-500 mt-0.5">
                                    Permanently removes all credentials. Relational data (audit logs, activity) will be orphaned. This cannot be undone.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowDeleteModal(true)}
                                className="shrink-0 px-4 py-2.5 rounded-lg border border-red-200 text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 hover:border-red-300 active:scale-[0.98] transition-all flex items-center gap-2"
                            >
                                <AlertTriangle size={15} />
                                Delete Account
                            </button>
                        </div>
                    </section>
                )}
            </main>

            {/* ── MODALS ──────────────────────────────────────────────────────── */}
            <UnsavedChangesModal
                isOpen={showDiscardModal}
                onClose={() => setShowDiscardModal(false)}
                onConfirm={() => router.push('/admin/users')}
            />

            <DeleteUserModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={handleDeleteConfirmed}
                userName={displayName}
                userEmail={initialData?.email || ''}
            />
        </div>
    );
}
