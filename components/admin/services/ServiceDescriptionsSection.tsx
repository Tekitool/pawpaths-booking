// components/admin/services/ServiceDescriptionsSection.tsx
// Card B: Short brief and detailed description.

'use client';

import { UseFormReturn } from 'react-hook-form';
import { FileText } from 'lucide-react';
import type { ServiceFormValues } from '@/lib/validations/service-schema';

interface Props {
    form: UseFormReturn<ServiceFormValues>;
}

export default function ServiceDescriptionsSection({ form }: Props) {
    return (
        <section className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                <FileText className="text-brand-color-01" size={20} />
                Descriptions
            </h2>

            <div className="space-y-6">
                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700 uppercase">
                        Short Brief <span className="text-gray-400 font-normal normal-case">(Max 140 chars)</span>
                    </label>
                    <input
                        {...form.register('shortDescription')}
                        maxLength={140}
                        className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-color-01/20 focus:border-brand-color-01 outline-none"
                        placeholder="Brief summary for lists..."
                    />
                    <p className="text-xs text-right text-gray-400">
                        {(form.watch('shortDescription') || '').length}/140
                    </p>
                </div>

                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700 uppercase">Detailed Description</label>
                    <textarea
                        {...form.register('longDescription')}
                        className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-color-01/20 focus:border-brand-color-01 outline-none min-h-[160px]"
                        placeholder="Full scope of service..."
                    />
                </div>
            </div>
        </section>
    );
}
