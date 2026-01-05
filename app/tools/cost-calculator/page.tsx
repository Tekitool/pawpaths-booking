import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Construction } from 'lucide-react';
import WhatsAppShareBtn from '@/components/WhatsAppShareBtn';

export const metadata: Metadata = {
    title: 'Cost Calculator - Tekitool Solutions',
    description: 'Estimate your pet relocation costs with our easy-to-use calculator.',
    openGraph: {
        title: 'Cost Calculator - Tekitool Solutions',
        description: 'Estimate your pet relocation costs with our easy-to-use calculator.',
        type: 'website',
    },
};

export default function CostCalculatorPage() {
    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <div className="mb-8">
                    <Link
                        href="/tools"
                        className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
                    >
                        <ArrowLeft size={20} className="mr-2" />
                        Back to Tools
                    </Link>
                </div>

                <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-8 text-center">
                    <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Construction size={40} className="text-blue-500" />
                    </div>

                    <h1 className="text-3xl font-bold text-gray-900 mb-4">
                        Cost Calculator
                    </h1>

                    <p className="text-xl text-gray-600 mb-8 max-w-lg mx-auto">
                        We are currently building this tool to help you estimate relocation costs accurately. Check back soon!
                    </p>

                    <div className="flex justify-center">
                        <WhatsAppShareBtn
                            title="Cost Calculator - Tekitool Solutions"
                            text="Check out this upcoming tool for estimating pet relocation costs!"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
