'use client';

// components/admin/EditUserModal.tsx
// Edit-only modal for existing users.
// Password management: uses sendPasswordResetAction → supabaseAdmin.auth.resetPasswordForEmail()
// Role updates: uses updateUserAction — server-side role escalation guard enforced.

import React, { useState, useEffect, useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import {
    X, User, Mail, Phone, Shield, Lock, AlertTriangle,
    KeyRound, Loader2, Save, ChevronDown,
} from 'lucide-react';
import { toast } from 'sonner';
import {
    updateUserAction,
    deleteUserAction,
    sendPasswordResetAction,
} from '@/lib/actions/manageUser';
import { ROLES, type Role, ROLE_META, ASSIGNABLE } from '@/lib/constants/roles';

// ── Zod Schema ─────────────────────────────────────────────────────────────────

const editSchema = z.object({
    firstName: z.string().min(2, 'Minimum 2 characters'),
    lastName: z.string().min(2, 'Minimum 2 characters'),
    // Email is read-only in this modal; kept in schema so the action receives it.
    email: z.string().email(),
    phone: z.string().optional(),
    role: z.enum(ROLES),
    status: z.boolean(),
});

type FormValues = z.infer<typeof editSchema>;

// ── Props ──────────────────────────────────────────────────────────────────────

export interface EditUserModalUser {
    id: string;
    full_name: string;
    email: string;
    phone?: string | null;
    role: Role;
    is_active: boolean;
    avatar_url?: string | null;
}

interface EditUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: EditUserModalUser;
    /** Role of the admin currently viewing this modal — enforces client-side UI gate. */
    callerRole: Role;
    onSuccess?: () => void;
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function splitName(fullName: string): [string, string] {
    const parts = fullName.trim().split(' ');
    return [parts[0] ?? '', parts.slice(1).join(' ')];
}

// ── Component ──────────────────────────────────────────────────────────────────

export default function EditUserModal({
    isOpen,
    onClose,
    user,
    callerRole,
    onSuccess,
}: EditUserModalProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSendingReset, setIsSendingReset] = useState(false);
    const [dangerOpen, setDangerOpen] = useState(false);
    const [confirmText, setConfirmText] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);

    const confirmInputRef = useRef<HTMLInputElement>(null);
    const confirmTarget = user.full_name || user.email;
    const isDeletionMatch =
        confirmText.trim().toLowerCase() === confirmTarget.trim().toLowerCase();

    const assignable: readonly Role[] = ASSIGNABLE[callerRole] ?? [];

    const [initialFirst, initialLast] = splitName(user.full_name);

    const {
        register,
        handleSubmit,
        control,
        reset,
        formState: { errors, isDirty },
        watch,
    } = useForm<FormValues>({
        resolver: zodResolver(editSchema),
        defaultValues: {
            firstName: initialFirst,
            lastName: initialLast,
            email: user.email,
            phone: user.phone ?? '',
            role: user.role,
            status: user.is_active,
        },
    });

    const currentStatus = watch('status');

    // ── Sync when modal opens / user prop changes ─────────────────────────────

    useEffect(() => {
        if (!isOpen) return;
        const [first, last] = splitName(user.full_name);
        reset({
            firstName: first,
            lastName: last,
            email: user.email,
            phone: user.phone ?? '',
            role: user.role,
            status: user.is_active,
        });
        setConfirmText('');
        setDangerOpen(false);
    }, [isOpen, user, reset]);

    // ── Keyboard: close on Escape ─────────────────────────────────────────────

    useEffect(() => {
        if (!isOpen) return;
        const fn = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', fn);
        return () => document.removeEventListener('keydown', fn);
    }, [isOpen, onClose]);

    // ── Auto-focus confirmation input ─────────────────────────────────────────

    useEffect(() => {
        if (dangerOpen) setTimeout(() => confirmInputRef.current?.focus(), 180);
    }, [dangerOpen]);

    // ── Handlers ──────────────────────────────────────────────────────────────

    const onSubmit = async (data: FormValues) => {
        setIsSubmitting(true);
        try {
            const result = await updateUserAction(user.id, data);
            if (result.success) {
                toast.success('User profile updated');
                onSuccess?.();
                onClose();
            } else {
                toast.error(result.message ?? 'Update failed');
            }
        } catch {
            toast.error('An unexpected error occurred');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handlePasswordReset = async () => {
        setIsSendingReset(true);
        try {
            // Triggers: supabaseAdmin.auth.resetPasswordForEmail(email, { redirectTo: '/settings/security' })
            // The admin never sets or views passwords — the user receives a secure link.
            const result = await sendPasswordResetAction(user.email);
            result.success
                ? toast.success(`Reset link sent to ${user.email}`)
                : toast.error(result.message ?? 'Failed to send reset link');
        } finally {
            setIsSendingReset(false);
        }
    };

    const handleDelete = async () => {
        if (!isDeletionMatch || isDeleting) return;
        setIsDeleting(true);
        try {
            const result = await deleteUserAction(user.id);
            if (result.success) {
                toast.success('User account permanently deleted');
                onSuccess?.();
                onClose();
            } else {
                toast.error(result.message ?? 'Deletion failed');
                setIsDeleting(false);
            }
        } catch {
            toast.error('An unexpected error occurred');
            setIsDeleting(false);
        }
    };

    // ── Render ─────────────────────────────────────────────────────────────────

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        key="backdrop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 z-50 bg-black/55 backdrop-blur-sm"
                        onClick={onClose}
                        aria-hidden="true"
                    />

                    {/* Panel */}
                    <motion.div
                        key="panel"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="edit-user-title"
                        initial={{ opacity: 0, scale: 0.97, y: 14 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.97, y: 14 }}
                        transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
                    >
                        <div
                            className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden pointer-events-auto"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Gradient top accent */}
                            <div className="h-1.5 bg-gradient-to-r from-violet-500 via-indigo-500 to-blue-500 shrink-0" />

                            {/* ── Header ──────────────────────────────────────── */}
                            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
                                <div className="flex items-center gap-3">
                                    <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                                        {user.avatar_url ? (
                                            <Image
                                                src={user.avatar_url}
                                                alt={user.full_name}
                                                fill
                                                className="object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                <User size={18} />
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <h2
                                            id="edit-user-title"
                                            className="text-sm font-bold text-gray-900 leading-tight"
                                        >
                                            Edit User
                                        </h2>
                                        <p className="text-[11px] text-gray-400 mt-0.5 font-mono">
                                            {user.email}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                                    aria-label="Close dialog"
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            {/* ── Body (scrollable) ────────────────────────────── */}
                            <div className="overflow-y-auto flex-1 p-6 space-y-4">

                                {/* ── BENTO ROW: Identity Profile + System Access ── */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                                    {/* Card A · Identity Profile */}
                                    <section className="md:col-span-2 rounded-xl border border-gray-200 bg-gray-50/40 p-5 space-y-4">
                                        <SectionHeader icon={<User size={12} />} label="Identity Profile" />

                                        {/* First / Last */}
                                        <div className="grid grid-cols-2 gap-3">
                                            <Field label="First Name" error={errors.firstName?.message}>
                                                <input
                                                    {...register('firstName')}
                                                    placeholder="Jane"
                                                    className={inputCls(!!errors.firstName)}
                                                />
                                            </Field>
                                            <Field label="Last Name" error={errors.lastName?.message}>
                                                <input
                                                    {...register('lastName')}
                                                    placeholder="Doe"
                                                    className={inputCls(!!errors.lastName)}
                                                />
                                            </Field>
                                        </div>

                                        {/* Email — read-only */}
                                        <Field
                                            label={
                                                <span className="flex items-center gap-1">
                                                    Email Address
                                                    <Lock size={8} className="text-gray-300" />
                                                </span>
                                            }
                                        >
                                            <div className="relative">
                                                <Mail
                                                    size={14}
                                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none"
                                                />
                                                <input
                                                    {...register('email')}
                                                    type="email"
                                                    readOnly
                                                    tabIndex={-1}
                                                    className="w-full pl-8 pr-3 py-2 bg-gray-100 border border-gray-200 rounded-lg text-sm text-gray-400 cursor-not-allowed select-none"
                                                />
                                            </div>
                                            <p className="text-[11px] text-gray-400 mt-1 flex items-center gap-1">
                                                <Lock size={8} />
                                                Email changes require re-verification — contact support.
                                            </p>
                                        </Field>

                                        {/* Phone */}
                                        <Field label="Phone Number">
                                            <div className="relative">
                                                <Phone
                                                    size={14}
                                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                                                />
                                                <input
                                                    {...register('phone')}
                                                    type="tel"
                                                    placeholder="+971 50 000 0000"
                                                    className="w-full pl-8 pr-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 transition-all placeholder:text-gray-300"
                                                />
                                            </div>
                                        </Field>
                                    </section>

                                    {/* Card B · System Access */}
                                    <section className="rounded-xl border border-gray-200 bg-gray-50/40 p-5 space-y-4 flex flex-col">
                                        <SectionHeader icon={<Shield size={12} />} label="System Access" />

                                        {/* Role picker */}
                                        <div className="space-y-2 flex-1">
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                                Role
                                            </p>
                                            <Controller
                                                name="role"
                                                control={control}
                                                render={({ field }) => (
                                                    <div className="relative">
                                                        <select
                                                            {...field}
                                                            className="w-full appearance-none px-3 py-2.5 pr-9 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium text-gray-900 focus:bg-white focus:ring-2 focus:ring-gray-200 outline-none transition-all cursor-pointer"
                                                        >
                                                            {ROLES.map((role) => {
                                                                const isLocked = !assignable.includes(role);
                                                                return (
                                                                    <option
                                                                        key={role}
                                                                        value={role}
                                                                        disabled={isLocked}
                                                                    >
                                                                        {ROLE_META[role].label}{isLocked ? ' (locked)' : ''}
                                                                    </option>
                                                                );
                                                            })}
                                                        </select>
                                                        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                                    </div>
                                                )}
                                            />
                                        </div>

                                        {/* Status toggle */}
                                        <div className="pt-3 border-t border-gray-200 mt-auto">
                                            <Controller
                                                name="status"
                                                control={control}
                                                render={({ field: { value, onChange } }) => (
                                                    <div className="flex items-center justify-between gap-2">
                                                        <div>
                                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">
                                                                Status
                                                            </p>
                                                            <p
                                                                className={`text-xs font-semibold ${value ? 'text-emerald-600' : 'text-red-500'}`}
                                                            >
                                                                {value ? 'Active' : 'Suspended'}
                                                            </p>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            role="switch"
                                                            aria-checked={value}
                                                            onClick={() => onChange(!value)}
                                                            className={[
                                                                'relative w-11 h-6 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 shrink-0',
                                                                value
                                                                    ? 'bg-emerald-500 focus:ring-emerald-300'
                                                                    : 'bg-red-400 focus:ring-red-300',
                                                            ].join(' ')}
                                                        >
                                                            <span
                                                                className={`absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${value ? 'translate-x-5' : 'translate-x-0'}`}
                                                            />
                                                        </button>
                                                    </div>
                                                )}
                                            />
                                        </div>
                                    </section>
                                </div>

                                {/* ── ACCESS MANAGEMENT ──────────────────────────── */}
                                <section className="rounded-xl border border-gray-200 bg-gray-50/40 p-5">
                                    <SectionHeader icon={<KeyRound size={12} />} label="Access Management" />

                                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mt-4">
                                        <div className="flex-1 space-y-1">
                                            <p className="text-sm font-semibold text-gray-800">
                                                Send Password Reset Link
                                            </p>
                                            <p className="text-xs text-gray-500 leading-relaxed">
                                                Emails a secure, time-limited reset link to the user.
                                                Their active session is unaffected until they complete the reset.
                                                {/* Backend: sendPasswordResetAction → supabaseAdmin.auth.resetPasswordForEmail(email)
                                                    Admins never set or view user passwords. */}
                                            </p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={handlePasswordReset}
                                            disabled={isSendingReset}
                                            className="shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-sm font-semibold text-gray-700 transition-all disabled:opacity-50 shadow-sm active:scale-[0.98]"
                                        >
                                            {isSendingReset ? (
                                                <Loader2 size={14} className="animate-spin" />
                                            ) : (
                                                <KeyRound size={14} />
                                            )}
                                            {isSendingReset ? 'Sending…' : 'Send Reset Link'}
                                        </button>
                                    </div>
                                </section>

                                {/* ── DANGER ZONE ────────────────────────────────── */}
                                <section className="rounded-xl border border-red-200 bg-red-50/20 overflow-hidden">
                                    <div className="flex items-center justify-between p-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                                                <AlertTriangle size={14} className="text-red-500" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest mb-0.5">
                                                    Danger Zone
                                                </p>
                                                <p className="text-sm font-semibold text-gray-800">
                                                    Delete this account
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    Permanent — credentials destroyed, data orphaned.
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setDangerOpen((v) => !v)}
                                            className="shrink-0 flex items-center gap-2 px-3.5 py-2 rounded-lg border border-red-200 bg-white text-sm font-semibold text-red-600 hover:bg-red-50 hover:border-red-300 transition-all active:scale-[0.98]"
                                        >
                                            {dangerOpen ? 'Cancel' : 'Delete User'}
                                            <ChevronDown
                                                size={14}
                                                className={`transition-transform duration-200 ${dangerOpen ? 'rotate-180' : ''}`}
                                            />
                                        </button>
                                    </div>

                                    {/* Inline confirmation panel */}
                                    <AnimatePresence>
                                        {dangerOpen && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                                                className="overflow-hidden"
                                            >
                                                <div className="px-5 pb-5 border-t border-red-100 pt-4 space-y-4">
                                                    {/* Consequence list */}
                                                    <div className="bg-red-100/60 border border-red-200 rounded-xl p-4 space-y-2">
                                                        <p className="text-xs font-bold text-red-700">
                                                            This action cannot be undone:
                                                        </p>
                                                        <ul className="text-xs text-red-600 space-y-1.5 list-disc list-inside">
                                                            <li>User immediately loses all system access</li>
                                                            <li>Auth credentials and active sessions are permanently destroyed</li>
                                                            <li>Activity logs and booking history will be orphaned</li>
                                                            <li>This email address cannot be reused without admin action</li>
                                                        </ul>
                                                    </div>

                                                    {/* Typed confirmation */}
                                                    <div className="space-y-2">
                                                        <label
                                                            htmlFor="delete-confirm-input"
                                                            className="text-xs font-semibold text-gray-600 block"
                                                        >
                                                            Type{' '}
                                                            <span className="font-mono font-bold text-gray-900 bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200">
                                                                {confirmTarget}
                                                            </span>{' '}
                                                            to enable deletion
                                                        </label>
                                                        <input
                                                            id="delete-confirm-input"
                                                            ref={confirmInputRef}
                                                            type="text"
                                                            value={confirmText}
                                                            onChange={(e) => setConfirmText(e.target.value)}
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter') handleDelete();
                                                            }}
                                                            disabled={isDeleting}
                                                            autoComplete="off"
                                                            spellCheck={false}
                                                            placeholder={confirmTarget}
                                                            className={[
                                                                'w-full px-3 py-2.5 rounded-lg border text-sm font-medium outline-none transition-all',
                                                                isDeletionMatch
                                                                    ? 'border-red-300 bg-red-50 text-gray-900 ring-2 ring-red-200'
                                                                    : 'border-gray-200 bg-white text-gray-900 focus:ring-2 focus:ring-gray-100',
                                                            ].join(' ')}
                                                        />
                                                    </div>

                                                    <div className="flex items-center gap-3">
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setDangerOpen(false);
                                                                setConfirmText('');
                                                            }}
                                                            disabled={isDeleting}
                                                            className="flex-1 px-4 py-2.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                                                        >
                                                            Cancel
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={handleDelete}
                                                            disabled={!isDeletionMatch || isDeleting}
                                                            className="flex-1 px-4 py-2.5 rounded-lg text-sm font-bold text-white transition-all flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100"
                                                        >
                                                            {isDeleting ? (
                                                                <>
                                                                    <Loader2 size={14} className="animate-spin" />
                                                                    Deleting…
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <AlertTriangle size={14} />
                                                                    Confirm Deletion
                                                                </>
                                                            )}
                                                        </button>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </section>
                            </div>

                            {/* ── Footer ───────────────────────────────────────── */}
                            <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-gray-100 shrink-0 bg-gray-50/60">
                                <div className="text-[11px] font-medium text-amber-500 h-4">
                                    {isDirty && 'Unsaved changes'}
                                </div>
                                <div className="flex items-center gap-3">
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        disabled={isSubmitting}
                                        className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleSubmit(onSubmit)}
                                        disabled={isSubmitting || !isDirty}
                                        className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] rounded-lg transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isSubmitting ? (
                                            <Loader2 size={14} className="animate-spin" />
                                        ) : (
                                            <Save size={14} />
                                        )}
                                        {isSubmitting ? 'Saving…' : 'Save Changes'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function SectionHeader({
    icon,
    label,
}: {
    icon: React.ReactNode;
    label: string;
}) {
    return (
        <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-white border border-gray-200 flex items-center justify-center text-gray-500 shadow-sm">
                {icon}
            </div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                {label}
            </span>
        </div>
    );
}

function Field({
    label,
    error,
    children,
}: {
    label: React.ReactNode;
    error?: string;
    children: React.ReactNode;
}) {
    return (
        <div className="space-y-1">
            <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest block">
                {label}
            </label>
            {children}
            {error && <p className="text-[11px] text-red-500">{error}</p>}
        </div>
    );
}

function inputCls(hasError: boolean) {
    return [
        'w-full px-3 py-2 bg-white border rounded-lg text-sm text-gray-900 transition-all outline-none placeholder:text-gray-300',
        hasError
            ? 'border-red-300 focus:ring-2 focus:ring-red-100'
            : 'border-gray-200 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300',
    ].join(' ');
}
