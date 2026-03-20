// components/admin/services/ServiceFinancialsSection.tsx
// Right sidebar: Marketing badge, financial engine (pricing, cost, profit calculator), and control center.

'use client';

import { UseFormReturn, Controller } from 'react-hook-form';
import { Tag, DollarSign, Settings, Check, AlertTriangle, Info } from 'lucide-react';
import { PRICING_MODELS, PROMO_BADGES } from '@/lib/constants/service-constants';
import type { ServiceFormValues } from '@/lib/validations/service-schema';

interface Props {
    form: UseFormReturn<ServiceFormValues>;
}

export default function ServiceFinancialsSection({ form }: Props) {
    const promoBadge = form.watch('promoBadge');
    const basePrice = form.watch('basePrice') || 0;
    const baseCost = form.watch('baseCost') || 0;
    const profit = basePrice - baseCost;
    const margin = basePrice > 0 ? (profit / basePrice) * 100 : 0;
    const isLowMargin = margin < 15;

    return (
        <div className="sticky top-24 space-y-8">
            {/* Marketing */}
            <section className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                    <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <Tag className="text-brand-color-01" size={20} />
                        Marketing
                    </h2>
                </div>
                <div className="p-6 space-y-6">
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-700 uppercase">Promo Badge</label>
                        <select
                            {...form.register('promoBadge')}
                            className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-color-01/20 focus:border-brand-color-01 outline-none"
                        >
                            {PROMO_BADGES.map(badge => (
                                <option key={badge.value} value={badge.value}>{badge.label}</option>
                            ))}
                        </select>
                    </div>

                    {promoBadge === 'complimentary' && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2 text-green-700 text-sm font-medium">
                            <Check size={16} />
                            <span>Price set to 0 (Complimentary)</span>
                        </div>
                    )}
                </div>
            </section>

            {/* Financial Engine */}
            <section className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                    <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <DollarSign className="text-brand-color-01" size={20} />
                        Financial Engine
                    </h2>
                </div>

                <div className="p-6 space-y-6">
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-700 uppercase">Pricing Model</label>
                        <select
                            {...form.register('pricingModel')}
                            className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-color-01/20 focus:border-brand-color-01 outline-none"
                        >
                            {PRICING_MODELS.map(model => (
                                <option key={model.value} value={model.value}>{model.label}</option>
                            ))}
                        </select>
                    </div>

                    {/* Revenue */}
                    <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100 space-y-4">
                        <h3 className="text-xs font-bold text-emerald-800 uppercase flex items-center gap-2">
                            Revenue (Price)
                        </h3>
                        <div className="space-y-1.5">
                            <label className="text-xs text-emerald-700">Base Price (AED)</label>
                            <input
                                type="number"
                                {...form.register('basePrice', { valueAsNumber: true })}
                                disabled={promoBadge === 'complimentary'}
                                className={`w-full px-3 py-2 bg-white border border-emerald-200 rounded-lg text-lg font-bold text-gray-900 tabular-nums focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none ${promoBadge === 'complimentary' ? 'opacity-50 cursor-not-allowed bg-gray-100' : ''}`}
                                min="0"
                                step="0.01"
                            />
                            {promoBadge === 'complimentary' && (
                                <p className="text-xs text-gray-400 flex items-center gap-1">
                                    <span>🔒</span>
                                    Price is locked at 0 for complimentary services. Change the Promo Badge above to enable pricing.
                                </p>
                            )}
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs text-emerald-700">Tax Rate (%)</label>
                            <input
                                type="number"
                                {...form.register('taxRate', { valueAsNumber: true })}
                                className="w-full px-3 py-2 bg-white border border-emerald-200 rounded-lg text-sm font-medium text-gray-900 tabular-nums focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                                min="0"
                                step="0.1"
                            />
                        </div>
                    </div>

                    {/* Cost */}
                    <div className="bg-orange-50/50 p-4 rounded-xl border border-orange-100 space-y-4">
                        <h3 className="text-xs font-bold text-orange-800 uppercase flex items-center gap-2">
                            Cost (Expense)
                        </h3>
                        <div className="space-y-1.5">
                            <label className="text-xs text-orange-700">Base Cost (AED)</label>
                            <input
                                type="number"
                                {...form.register('baseCost', { valueAsNumber: true })}
                                className="w-full px-3 py-2 bg-white border border-orange-200 rounded-lg text-lg font-bold text-gray-900 tabular-nums focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none"
                                min="0"
                                step="0.01"
                            />
                        </div>
                    </div>

                    {/* Profit Calculator */}
                    <div className="pt-4 border-t border-gray-100">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-xs text-gray-500">Net Profit</span>
                            <span className={`text-sm font-bold tabular-nums ${profit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                AED {profit.toFixed(2)}
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-xs text-gray-500">Margin</span>
                            <div className="flex items-center gap-2">
                                <span className={`text-sm font-bold tabular-nums ${isLowMargin ? 'text-red-600' : 'text-emerald-600'}`}>
                                    {margin.toFixed(1)}%
                                </span>
                                {isLowMargin && <AlertTriangle size={12} className="text-red-500" />}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Control Center */}
            <section className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <Settings className="text-brand-color-01" size={20} />
                    Control Center
                </h2>

                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h4 className="text-sm font-bold text-gray-900">Visibility</h4>
                            <p className="text-xs text-gray-500">Show in catalog</p>
                        </div>
                        <Controller
                            control={form.control}
                            name="isActive"
                            render={({ field }) => (
                                <button
                                    type="button"
                                    onClick={() => field.onChange(!field.value)}
                                    className={`
                                        relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none
                                        ${field.value ? 'bg-green-500' : 'bg-gray-200'}
                                    `}
                                >
                                    <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${field.value ? 'translate-x-5' : 'translate-x-0'}`} />
                                </button>
                            )}
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="group relative cursor-help">
                            <h4 className="text-sm font-bold text-gray-900 flex items-center gap-1">
                                Policy <Info size={12} className="text-gray-400" />
                            </h4>
                            <p className="text-xs text-gray-500">Mandatory service</p>
                            <div className="absolute bottom-full left-0 mb-2 w-48 p-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                                This forces the service onto every quote automatically.
                            </div>
                        </div>
                        <Controller
                            control={form.control}
                            name="isMandatory"
                            render={({ field }) => (
                                <button
                                    type="button"
                                    onClick={() => field.onChange(!field.value)}
                                    className={`
                                        relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none
                                        ${field.value ? 'bg-brand-color-01' : 'bg-gray-200'}
                                    `}
                                >
                                    <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${field.value ? 'translate-x-5' : 'translate-x-0'}`} />
                                </button>
                            )}
                        />
                    </div>
                </div>
            </section>
        </div>
    );
}
