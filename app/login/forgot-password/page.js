'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { requestPasswordReset } from '../../auth/actions';
import { AlertCircle, ArrowLeft, Mail, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <button
            className="w-full bg-brand-color-01 text-white py-3 rounded-xl font-bold hover:bg-[#3d2815] transition-all transform hover:scale-[1.01] active:scale-[0.99] shadow-lg shadow-brand-color-01/10 disabled:opacity-50"
            disabled={pending}
        >
            {pending ? (
                <div className="flex items-center justify-center gap-2 text-sm">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Sending Reset Link...</span>
                </div>
            ) : 'Send Reset Link'}
        </button>
    );
}

export default function ForgotPasswordPage() {
    const [state, dispatch] = useActionState(requestPasswordReset, undefined);

    const isSuccess = state?.success;
    const sentEmail = state?.email;
    const message = typeof state === 'string' ? state : null;

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#F9FAFB] p-4 font-sans text-gray-900">
            <div className="max-w-md w-full">
                {/* Back button */}
                <Link
                    href="/login"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-brand-text-02/60 hover:text-brand-color-01 mb-8 transition-colors group"
                >
                    <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                    Back to Login
                </Link>

                <div className="bg-white p-8 rounded-[2.5rem] shadow-[0_4px_24px_rgba(0,0,0,0.03)] border border-gray-100">
                    <div className="mb-8">
                        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Forgot Password?</h1>
                        <p className="text-sm text-gray-500 mt-2 font-medium">
                            No worries! Enter your email and we'll send you a link to reset your password.
                        </p>
                    </div>

                    {isSuccess ? (
                        <div className="space-y-6 py-4 animate-in fade-in zoom-in-95 duration-300">
                            <div className="flex flex-col items-center text-center space-y-4">
                                <div className="p-4 bg-system-color-02/10 rounded-full">
                                    <CheckCircle2 size={48} className="text-system-color-02" />
                                </div>
                                <div className="space-y-1">
                                    <h2 className="text-lg font-bold text-gray-900">Email Sent!</h2>
                                    <p className="text-sm text-gray-500 font-medium">
                                        Password reset link sent to{' '}
                                        <span className="font-bold text-brand-color-01">{sentEmail}</span>!
                                        {' '}Check your email.
                                    </p>
                                </div>
                            </div>
                            <Link
                                href="/login"
                                className="block w-full text-center bg-gray-50 text-gray-900 py-3 rounded-xl font-bold border border-gray-100 hover:bg-gray-100 transition-colors"
                            >
                                Return to Login
                            </Link>
                        </div>
                    ) : (
                        <form action={dispatch} className="space-y-6">
                            <div className="space-y-2">
                                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1">Email Address</span>
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-color-01 transition-colors" size={20} />
                                    <input
                                        type="email"
                                        name="email"
                                        required
                                        className="w-full bg-gray-50 border-2 border-transparent focus:border-brand-color-01/10 rounded-2xl pl-12 pr-4 py-4 focus:ring-4 focus:ring-brand-color-01/5 focus:bg-white focus:outline-none transition-all font-medium"
                                        placeholder="admin@pawpathsae.com"
                                    />
                                </div>
                            </div>

                            {message && (
                                <div className="flex items-start gap-3 text-system-color-01 text-sm bg-system-color-01/5 p-4 rounded-xl border border-system-color-01/10 animate-in fade-in slide-in-from-top-2">
                                    <AlertCircle size={20} className="shrink-0 mt-0.5" />
                                    <p className="font-medium text-system-color-01">{message}</p>
                                </div>
                            )}

                            <SubmitButton />
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
