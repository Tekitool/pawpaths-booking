import Link from 'next/link';
import { AlertTriangle } from 'lucide-react';

export default function AuthCodeErrorPage({ searchParams }) {
    const errorCode = searchParams?.error_code;
    const isExpired = errorCode === 'otp_expired';

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#F9FAFB] p-4 font-sans text-gray-900">
            <div className="max-w-md w-full">
                <div className="bg-white p-8 rounded-[2.5rem] shadow-[0_4px_24px_rgba(0,0,0,0.03)] border border-gray-100">
                    <div className="flex flex-col items-center text-center space-y-4 py-4">
                        <div className="p-4 bg-system-color-01/10 rounded-full">
                            <AlertTriangle size={48} className="text-system-color-01" />
                        </div>
                        <div className="space-y-2">
                            <h1 className="text-xl font-bold text-gray-900">
                                {isExpired ? 'Link Expired' : 'Invalid Link'}
                            </h1>
                            <p className="text-sm text-gray-500 font-medium">
                                {isExpired
                                    ? 'This password reset link has expired. Reset links are only valid for 1 hour.'
                                    : 'This link is invalid or has already been used.'}
                            </p>
                        </div>
                    </div>

                    <div className="mt-6 space-y-3">
                        <Link
                            href="/admin/login/forgot-password"
                            className="block w-full text-center bg-brand-color-01 text-white py-3 rounded-xl font-bold hover:bg-[#3d2815] transition-colors shadow-lg shadow-brand-color-01/10"
                        >
                            Request a New Link
                        </Link>
                        <Link
                            href="/admin/login"
                            className="block w-full text-center bg-gray-50 text-gray-900 py-3 rounded-xl font-bold border border-gray-100 hover:bg-gray-100 transition-colors"
                        >
                            Back to Login
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
