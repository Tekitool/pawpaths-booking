'use client';

import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
    X, Save, DollarSign, Tag, Truck,
    Globe, Shield, Activity, Calculator,
    Briefcase, FileText, Stethoscope, Box,
    ListChecks, Image as ImageIcon,
    Plane, Ship, MapPin, Clock, Calendar,
    Package, Container, Anchor, Warehouse,
    User, Users, Clipboard, CheckCircle, AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import SecurityModal from '@/components/ui/SecurityModal';
import { upsertService, getCategories } from '@/lib/actions/service-actions';

const ICON_MAP = {
    Truck, Plane, Ship, FileText, Stethoscope, Box,
    Globe, Shield, Activity, Calculator, Briefcase,
    ListChecks, Package, Container, Anchor, Warehouse,
    User, Users, Clipboard, CheckCircle, AlertCircle,
    MapPin, Clock, Calendar, Tag, DollarSign
};

const PRICING_MODELS = [
    { value: 'fixed', label: 'Fixed Price' },
    { value: 'per_kg', label: 'Per Kg' },
    { value: 'per_km', label: 'Per Km' },
    { value: 'percentage', label: 'Percentage' }
];

const APPLICABILITY_OPTIONS = [
    { value: 'dog', label: 'Dogs', icon: <span className="text-lg">🐕</span> },
    { value: 'cat', label: 'Cats', icon: <span className="text-lg">🐈</span> },
    { value: 'bird', label: 'Birds', icon: <span className="text-lg">🦜</span> },
    { value: 'other', label: 'Others', icon: <span className="text-lg">🐾</span> }
];

export default function ServiceModal({ service, isOpen, onClose, onSuccess }) {
    const [categories, setCategories] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSecurityCheck, setShowSecurityCheck] = useState(false);
    const [pendingData, setPendingData] = useState(null);

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        control,
        formState: { errors }
    } = useForm({
        resolver: zodResolver(z.object({
            name: z.string().min(1, "Service name is required"),
            category_id: z.coerce.number().min(1, "Category is required"),
            short_description: z.string().optional(),
            long_description: z.string().optional(),
            requirements: z.string().optional(),
            icon: z.string().optional(),
            base_price: z.coerce.number().min(0, "Price must be positive"),
            base_cost: z.coerce.number().min(0, "Cost must be positive"),
            tax_rate: z.coerce.number().default(5.0),
            pricing_model: z.enum(['fixed', 'per_kg', 'per_km', 'percentage']),
            applicability: z.array(z.string()).default([]),
            is_mandatory: z.boolean().default(false),
            is_active: z.boolean().default(true),
        })),
        defaultValues: {
            name: service?.name || '',
            category_id: service?.category_id || '',
            short_description: service?.short_description || '',
            long_description: service?.long_description || '',
            requirements: service?.requirements || '',
            icon: service?.icon || '',
            base_price: service?.base_price || 0,
            base_cost: service?.base_cost || 0,
            tax_rate: service?.tax_rate || 5.0,
            pricing_model: service?.pricing_model || 'fixed',
            applicability: service?.applicability || [],
            is_mandatory: service?.is_mandatory || false,
            is_active: service?.is_active !== undefined ? service.is_active : true,
        }
    });

    const selectedIconName = watch('icon');
    const basePrice = watch('base_price') || 0;
    const baseCost = watch('base_cost') || 0;
    const estimatedProfit = basePrice - baseCost;
    const profitMargin = basePrice > 0 ? ((estimatedProfit / basePrice) * 100).toFixed(1) : 0;

    useEffect(() => {
        if (isOpen) {
            fetchCategories();
        }
    }, [isOpen]);

    const fetchCategories = async () => {
        const cats = await getCategories();
        setCategories(cats);
    };

    const onSubmit = async (data) => {
        if (service) {
            // If editing, require security check
            setPendingData(data);
            setShowSecurityCheck(true);
        } else {
            // If creating, proceed directly (or add security check if required)
            await executeSubmit(data);
        }
    };

    const executeSubmit = async (data, reason = null) => {
        setIsSubmitting(true);
        try {
            const payload = { ...data, id: service?.id, audit_reason: reason };
            const result = await upsertService(payload);
            if (result.success) {
                toast.success(service ? 'Service updated successfully' : 'Service created successfully');
                onSuccess?.();
                onClose();
                setShowSecurityCheck(false);
            } else {
                toast.error('Failed to save service', { description: result.message || 'Unknown error' });
                console.error(result.error);
                setShowSecurityCheck(false);
            }
        } catch (error) {
            toast.error('An unexpected error occurred');
            console.error(error);
            setShowSecurityCheck(false);
        } finally {
            setIsSubmitting(false);
        }
    };

    const toggleApplicability = (value) => {
        const current = watch('applicability');
        if (current.includes(value)) {
            setValue('applicability', current.filter(v => v !== value));
        } else {
            setValue('applicability', [...current, value]);
        }
    };

    if (!isOpen) return null;

    return (
        <>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                {/* Modal Container */}
                <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">

                    {/* Header */}
                    <div className="px-8 py-6 border-b border-brand-text-02/20 flex justify-between items-center bg-white">
                        <div>
                            <h2 className="text-gray-900 flex items-center gap-3">
                                {service ? <Briefcase className="text-brand-color-01" /> : <PlusIcon className="text-brand-color-01" />}
                                {service ? 'Edit Service' : 'New Service'}
                            </h2>
                            <p className="text-brand-text-02/80 text-sm mt-1">Configure service details, pricing, and rules.</p>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-brand-text-02/10 rounded-full transition-colors text-brand-text-02/60 hover:text-brand-text-02">
                            <X size={24} />
                        </button>
                    </div>

                    {/* Scrollable Content */}
                    <div className="flex-1 overflow-y-auto p-8 bg-brand-text-02/5">
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">

                            {/* Section A: Identity */}
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-brand-text-02/20">
                                <h3 className="text-brand-text-02/60 mb-4 flex items-center gap-2">
                                    <FileText size={16} /> Service Identity
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {/* Service Name - Full Width */}
                                    <div className="md:col-span-3">
                                        <label className="block text-sm font-semibold text-brand-text-02 mb-2">Service Name</label>
                                        <input
                                            {...register('name')}
                                            className="w-full px-4 py-3 rounded-xl border border-brand-text-02/20 focus:ring-2 focus:ring-brand-color-01/20 focus:border-brand-color-01 transition-all font-medium text-lg"
                                            placeholder="e.g. Export Health Certificate"
                                        />
                                        {errors.name && <p className="text-system-color-01 text-xs mt-1">{errors.name.message}</p>}
                                    </div>

                                    {/* Category - 2 Columns */}
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-semibold text-brand-text-02 mb-2">Category</label>
                                        <div className="relative">
                                            <select
                                                {...register('category_id')}
                                                className="w-full px-4 py-3 rounded-xl border border-brand-text-02/20 focus:ring-2 focus:ring-brand-color-01/20 focus:border-brand-color-01 transition-all appearance-none bg-white"
                                            >
                                                <option value="">Select Category</option>
                                                {categories.map(cat => (
                                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                                ))}
                                            </select>
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-brand-text-02/60">
                                                <svg width="12" height="8" viewBox="0 0 12 8" fill="none"><path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
                                            </div>
                                        </div>
                                        {errors.category_id && <p className="text-system-color-01 text-xs mt-1">{errors.category_id.message}</p>}
                                    </div>

                                    {/* Icon - 1 Column */}
                                    <div className="md:col-span-1">
                                        <label className="block text-sm font-semibold text-brand-text-02 mb-2">Icon</label>
                                        <div className="relative">
                                            <select
                                                {...register('icon')}
                                                className="w-full pl-10 pr-8 py-3 rounded-xl border border-brand-text-02/20 focus:ring-2 focus:ring-brand-color-01/20 focus:border-brand-color-01 transition-all appearance-none bg-white"
                                            >
                                                <option value="">Select Icon</option>
                                                {Object.keys(ICON_MAP).sort().map(iconName => (
                                                    <option key={iconName} value={iconName}>{iconName}</option>
                                                ))}
                                            </select>

                                            {/* Icon Preview */}
                                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-text-02/80 pointer-events-none">
                                                {selectedIconName && ICON_MAP[selectedIconName] ? (
                                                    React.createElement(ICON_MAP[selectedIconName], { size: 18 })
                                                ) : (
                                                    <ImageIcon size={18} />
                                                )}
                                            </div>

                                            {/* Chevron */}
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-brand-text-02/60">
                                                <svg width="12" height="8" viewBox="0 0 12 8" fill="none"><path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="md:col-span-3">
                                        <label className="block text-sm font-semibold text-brand-text-02 mb-2">Short Description</label>
                                        <textarea
                                            {...register('short_description')}
                                            className="w-full px-4 py-3 rounded-xl border border-brand-text-02/20 focus:ring-2 focus:ring-brand-color-01/20 focus:border-brand-color-01 transition-all h-20 resize-none"
                                            placeholder="Brief summary for lists and invoices..."
                                        />
                                    </div>
                                    <div className="md:col-span-3">
                                        <label className="block text-sm font-semibold text-brand-text-02 mb-2">Long Description</label>
                                        <textarea
                                            {...register('long_description')}
                                            className="w-full px-4 py-3 rounded-xl border border-brand-text-02/20 focus:ring-2 focus:ring-brand-color-01/20 focus:border-brand-color-01 transition-all h-32 resize-none"
                                            placeholder="Detailed description of the service..."
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Section B: Financial Engine */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Revenue (Green) */}
                                <div className="bg-system-color-02/5 p-6 rounded-2xl shadow-sm border border-system-color-02/20">
                                    <h3 className="text-system-color-02 mb-4 flex items-center gap-2">
                                        <DollarSign size={16} /> Revenue (Money In)
                                    </h3>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-system-color-02 mb-1">Base Price (AED)</label>
                                            <div className="relative">
                                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-system-color-02 font-bold">AED</span>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    {...register('base_price')}
                                                    className="w-full pl-14 pr-4 py-3 rounded-xl border border-system-color-02/20 focus:ring-2 focus:ring-system-color-02/20 focus:border-system-color-02 transition-all font-bold text-system-color-02 bg-white"
                                                />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-semibold text-system-color-02 mb-1">Pricing Model</label>
                                                <select
                                                    {...register('pricing_model')}
                                                    className="w-full px-3 py-3 rounded-xl border border-system-color-02/20 focus:ring-2 focus:ring-system-color-02/20 focus:border-system-color-02 bg-white text-sm"
                                                >
                                                    {PRICING_MODELS.map(m => (
                                                        <option key={m.value} value={m.value}>{m.label}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-system-color-02 mb-1">Tax Rate %</label>
                                                <input
                                                    type="number"
                                                    step="0.1"
                                                    {...register('tax_rate')}
                                                    className="w-full px-3 py-3 rounded-xl border border-system-color-02/20 focus:ring-2 focus:ring-system-color-02/20 focus:border-system-color-02 bg-white text-sm"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Cost (Orange) */}
                                <div className="bg-accent/10 p-6 rounded-2xl shadow-sm border border-accent/15 flex flex-col">
                                    <h3 className="text-accent mb-4 flex items-center gap-2">
                                        <Activity size={16} /> Cost & Margin
                                    </h3>
                                    <div className="space-y-4 flex-1">
                                        <div>
                                            <label className="block text-sm font-semibold text-accent mb-1">Base Cost (AED)</label>
                                            <div className="relative">
                                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-accent font-bold">AED</span>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    {...register('base_cost')}
                                                    className="w-full pl-14 pr-4 py-3 rounded-xl border border-accent/50 focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all font-bold text-accent bg-white"
                                                />
                                            </div>
                                        </div>

                                        {/* Live Margin Indicator */}
                                        <div className={`mt-auto p-4 rounded-xl border ${estimatedProfit >= 0 ? 'bg-white border-accent/15' : 'bg-system-color-01/10 border-system-color-01'}`}>
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="text-xs font-bold text-brand-text-02/80 uppercase">Est. Profit</span>
                                                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${estimatedProfit >= 0 ? 'bg-system-color-02/15 text-system-color-02' : 'bg-system-color-01/10 text-system-color-01'}`}>
                                                    {profitMargin}% Margin
                                                </span>
                                            </div>
                                            <div className={`text-2xl font-black ${estimatedProfit >= 0 ? 'text-gray-900' : 'text-system-color-01'}`}>
                                                AED {estimatedProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Section C: Operational Rules */}
                            <div className="bg-info/10 p-6 rounded-2xl shadow-sm border border-system-color-03">
                                <h3 className="text-info mb-4 flex items-center gap-2">
                                    <Shield size={16} /> Operational Rules
                                </h3>

                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-brand-text-02 mb-3">Applicability (Select all that apply)</label>
                                        <div className="flex flex-wrap gap-3">
                                            {APPLICABILITY_OPTIONS.map(option => {
                                                const isSelected = watch('applicability').includes(option.value);
                                                return (
                                                    <button
                                                        key={option.value}
                                                        type="button"
                                                        onClick={() => toggleApplicability(option.value)}
                                                        className={`
                                                            px-4 py-2 rounded-lg text-sm font-bold border transition-all flex items-center gap-2
                                                            ${isSelected
                                                                ? 'bg-info text-white border-system-color-03 shadow-md shadow-system-color-03'
                                                                : 'bg-white text-brand-text-02 border-brand-text-02/20 hover:border-info/30 hover:bg-info/10'}
                                                        `}
                                                    >
                                                        <span>{option.icon}</span>
                                                        {option.label}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-brand-text-02 mb-2">Requirements / Prerequisites</label>
                                        <textarea
                                            {...register('requirements')}
                                            className="w-full px-4 py-3 rounded-xl border border-brand-text-02/20 focus:ring-2 focus:ring-blue-500/20 focus:border-system-color-03 transition-all h-24 resize-none"
                                            placeholder="List any documents or conditions required for this service..."
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-system-color-03">
                                        <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-brand-text-02/20">
                                            <div>
                                                <div className="font-bold text-gray-900">Mandatory Service</div>
                                                <div className="text-xs text-brand-text-02/80">Required for all bookings?</div>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input type="checkbox" {...register('is_mandatory')} className="sr-only peer" />
                                                <div className="w-11 h-6 bg-brand-text-02/20 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-brand-text-02/20 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-system-color-01"></div>
                                            </label>
                                        </div>

                                        <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-brand-text-02/20">
                                            <div>
                                                <div className="font-bold text-gray-900">Active Status</div>
                                                <div className="text-xs text-brand-text-02/80">Visible in catalog?</div>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input type="checkbox" {...register('is_active')} className="sr-only peer" />
                                                <div className="w-11 h-6 bg-brand-text-02/20 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-brand-text-02/20 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-system-color-02"></div>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </form>
                    </div>

                    {/* Footer */}
                    <div className="px-8 py-5 border-t border-brand-text-02/20 bg-brand-text-02/5 flex justify-end gap-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-3 rounded-xl font-bold text-brand-text-02 hover:bg-brand-text-02/20 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit(onSubmit)}
                            disabled={isSubmitting}
                            className="px-8 py-3 rounded-xl font-bold text-white bg-brand-color-01 hover:bg-brand-color-01/90 shadow-lg hover:shadow-xl transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? (
                                <>Saving...</>
                            ) : (
                                <>
                                    <Save size={18} /> Save Service
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            <SecurityModal
                isOpen={showSecurityCheck}
                onClose={() => setShowSecurityCheck(false)}
                onConfirm={(reason) => executeSubmit(pendingData, reason)}
                title="Confirm Service Changes"
                actionType="warning"
                isLoading={isSubmitting}
            />
        </>
    );
}

function PlusIcon({ className }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M5 12h14" />
            <path d="M12 5v14" />
        </svg>
    );
}
