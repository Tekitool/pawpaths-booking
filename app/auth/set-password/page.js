'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { updatePassword } from '../actions';
import { AlertCircle, Lock, ShieldCheck } from 'lucide-react';

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <button
            className="w-full bg-brand-color-01 text-white py-3 rounded-xl font-bold hover:bg-[#3d2815] transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-brand-color-01/20 disabled:opacity-50"
            disabled={pending}
        >
            {pending ? (
                <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Setting Password...</span>
                </div>
            ) : 'Set New Password'}
        </button>
    );
}

export default function SetPasswordPage() {
    const [errorMessage, dispatch] = useActionState(updatePassword, undefined);

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#FDFCFB] p-4">
            <div className="max-w-md w-full">
                {/* Visual Header */}
                <div className="text-center mb-8 space-y-2">
                    <div className="inline-flex p-4 bg-brand-color-02/10 rounded-2xl mb-4">
                        <ShieldCheck className="text-brand-color-01" size={40} />
                    </div>
                    <h1 className="text-3xl font-bold text-brand-color-01 tracking-tight">Secure Your Account</h1>
                    <p className="text-brand-text-02/60 font-medium">Please set your access password to continue</p>
                </div>

                <div className="bg-white p-8 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-brand-text-02/5 relative">
                    <form action={dispatch} className="space-y-6">
                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-brand-text-02 ml-1">New Password</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-text-02/40 group-focus-within:text-brand-color-01 transition-colors" size={20} />
                                <input
                                    type="password"
                                    name="password"
                                    required
                                    minLength={8}
                                    className="w-full border-2 border-brand-text-02/5 bg-gray-50/50 rounded-2xl pl-12 pr-4 py-4 focus:ring-4 focus:ring-brand-color-01/5 focus:border-brand-color-01/20 focus:bg-white focus:outline-none transition-all text-lg tracking-wider"
                                    placeholder="••••••••"
                                />
                            </div>
                            <p className="text-[10px] text-brand-text-02/40 ml-1">Minimum 8 characters with numbers and symbols</p>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-brand-text-02 ml-1">Confirm Password</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-text-02/40 group-focus-within:text-brand-color-01 transition-colors" size={20} />
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    required
                                    className="w-full border-2 border-brand-text-02/5 bg-gray-50/50 rounded-2xl pl-12 pr-4 py-4 focus:ring-4 focus:ring-brand-color-01/5 focus:border-brand-color-01/20 focus:bg-white focus:outline-none transition-all text-lg tracking-wider"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        {errorMessage && (
                            <div className="flex items-start gap-3 text-system-color-01 text-sm bg-system-color-01/5 p-4 rounded-2xl border border-system-color-01/10 animate-in fade-in slide-in-from-top-2">
                                <AlertCircle size={20} className="shrink-0 mt-0.5" />
                                <p className="font-medium">{errorMessage}</p>
                            </div>
                        )}

                        <div className="pt-2">
                            <SubmitButton />
                        </div>
                    </form>
                </div>

                <p className="text-center mt-8 text-sm text-brand-text-02/40 font-medium">
                    This link will expire for security reasons.
                </p>
            </div>
        </div>
    );
}
