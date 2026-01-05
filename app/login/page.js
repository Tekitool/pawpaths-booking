'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { login } from '../auth/actions';
import { AlertCircle } from 'lucide-react';

function LoginButton() {
    const { pending } = useFormStatus();
    return (
        <button
            className="w-full bg-brand-color-01 text-white py-3 rounded-lg font-bold hover:bg-[#3d2815] transition-colors disabled:opacity-50"
            disabled={pending}
        >
            {pending ? 'Logging in...' : 'Log in'}
        </button>
    );
}

export default function LoginPage() {
    const [errorMessage, dispatch, isPending] = useActionState(login, undefined);

    return (
        <div className="min-h-screen flex items-center justify-center bg-brand-text-02/5">
            <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg">
                <div className="text-center mb-8">
                    <h1 className="text-brand-color-01">Pawpaths Admin</h1>
                    <p className="text-brand-text-02/80">Sign in to access the dashboard</p>
                </div>

                <form action={dispatch} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-brand-text-02 mb-1">Email</label>
                        <input
                            type="email"
                            name="email"
                            required
                            className="w-full border border-brand-text-02/20 rounded-lg px-4 py-2 focus:ring-2 focus:ring-brand-color-01 focus:outline-none"
                            placeholder="admin@pawpathsae.com"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-brand-text-02 mb-1">Password</label>
                        <input
                            type="password"
                            name="password"
                            required
                            className="w-full border border-brand-text-02/20 rounded-lg px-4 py-2 focus:ring-2 focus:ring-brand-color-01 focus:outline-none"
                            placeholder="••••••••"
                        />
                    </div>

                    {errorMessage && (
                        <div className="flex items-center gap-2 text-system-color-01 text-sm bg-error/10 p-3 rounded-lg">
                            <AlertCircle size={16} />
                            <p>{errorMessage}</p>
                        </div>
                    )}

                    <LoginButton />
                </form>
            </div>
        </div>
    );
}
