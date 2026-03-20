// components/admin/services/ServiceIdentitySection.tsx
// Card A: Service name, SKU, category, icon picker.

'use client';

import { UseFormReturn, Controller } from 'react-hook-form';
import { Box, RefreshCw } from 'lucide-react';
import { ICONS } from '@/lib/constants/service-constants';
import type { ServiceFormValues } from '@/lib/validations/service-schema';

interface Props {
    form: UseFormReturn<ServiceFormValues>;
    categories: { id: number | string; name: string }[];
    onGenerateSKU: () => void;
}

export default function ServiceIdentitySection({ form, categories, onGenerateSKU }: Props) {
    return (
        <section className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Box className="text-brand-color-01" size={20} />
                Service Identity
            </h2>

            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-700 uppercase">Service Name</label>
                        <input
                            {...form.register('name')}
                            className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-color-01/20 focus:border-brand-color-01 outline-none"
                            placeholder="e.g. Premium Pet Taxi"
                        />
                        {form.formState.errors.name && <p className="text-xs text-red-500">{form.formState.errors.name.message}</p>}
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-700 uppercase">SKU / Code</label>
                        <div className="flex gap-2">
                            <input
                                {...form.register('code')}
                                className="flex-1 px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-mono focus:ring-2 focus:ring-brand-color-01/20 focus:border-brand-color-01 outline-none"
                                placeholder="SVC-0000"
                            />
                            <button
                                type="button"
                                onClick={onGenerateSKU}
                                className="p-2.5 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-lg border border-gray-200 transition-colors"
                                title="Generate SKU"
                            >
                                <RefreshCw size={18} />
                            </button>
                        </div>
                        {form.formState.errors.code && <p className="text-xs text-red-500">{form.formState.errors.code.message}</p>}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-700 uppercase">Category</label>
                        <select
                            {...form.register('categoryId')}
                            className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-color-01/20 focus:border-brand-color-01 outline-none"
                        >
                            <option value="">Select Category...</option>
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>
                        {form.formState.errors.categoryId && <p className="text-xs text-red-500">{form.formState.errors.categoryId.message}</p>}
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-700 uppercase">Icon</label>
                        <Controller
                            control={form.control}
                            name="icon"
                            render={({ field }) => (
                                <div className="flex gap-2">
                                    {ICONS.map(item => {
                                        const Icon = item.icon;
                                        const isSelected = field.value === item.value;
                                        return (
                                            <button
                                                key={item.value}
                                                type="button"
                                                onClick={() => field.onChange(item.value)}
                                                className={`
                                                    p-2.5 rounded-lg border transition-all
                                                    ${isSelected
                                                        ? 'bg-brand-color-01 text-white border-brand-color-01 shadow-md'
                                                        : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'}
                                                `}
                                                title={item.value}
                                            >
                                                <Icon size={18} />
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        />
                    </div>
                </div>
            </div>
        </section>
    );
}
