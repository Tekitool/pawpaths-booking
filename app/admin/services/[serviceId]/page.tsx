'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
    ChevronRight, Save, X, RefreshCw, Trash2, Plus,
    AlertTriangle, Check, Box, FileText, DollarSign,
    Settings, Plane, Stethoscope, Home, Truck, Info, Tag, Layers
} from 'lucide-react';
import { toast } from 'sonner';
import { getCategories } from '@/lib/actions/service-actions';
import { supabase } from '@/lib/supabase/client';

// --- Zod Schema ---

const serviceSchema = z.object({
    id: z.string().optional(),
    code: z.string().min(1, "SKU Code is required"),
    name: z.string().min(2, "Service Name is required"),
    categoryId: z.union([z.string(), z.number()]).refine(val => val !== '', "Category is required"),
    icon: z.string().optional(),
    shortDescription: z.string().max(140, "Short description must be under 140 characters").optional(),
    longDescription: z.string().optional(),

    // Logic Matrix
    validSpecies: z.array(z.string()),
    validServiceTypes: z.array(z.string()),
    validTransportModes: z.array(z.string()),

    requirements: z.array(z.object({ value: z.string() })),

    // Financials & Marketing
    pricingModel: z.string().min(1, "Pricing Model is required"),
    basePrice: z.number().min(0, "Price must be positive"),
    baseCost: z.number().min(0, "Cost must be positive"),
    taxRate: z.number().min(0),
    promoBadge: z.enum(['none', 'complimentary', 'bestseller', 'limited_offer', 'essential']),

    isActive: z.boolean(),
    isMandatory: z.boolean(),
});

type ServiceFormValues = z.infer<typeof serviceSchema>;

// --- Constants ---

const PRICING_MODELS = [
    { value: 'fixed', label: 'Fixed Price (One-time)' },
    { value: 'per_day', label: 'Time-Based (Per Day)' },
    { value: 'per_item', label: 'Quantity-Based (Per Item)' },
    { value: 'per_kg', label: 'Weight-Based (Per Kg)' },
    { value: 'per_km', label: 'Distance-Based (Per Km)' },
];

const ICONS = [
    { value: 'Plane', icon: Plane },
    { value: 'Stethoscope', icon: Stethoscope },
    { value: 'Home', icon: Home },
    { value: 'Truck', icon: Truck },
    { value: 'FileText', icon: FileText },
    { value: 'Box', icon: Box },
];

const SERVICE_TYPES = [
    { value: 'export', label: 'Export' },
    { value: 'import', label: 'Import' },
    { value: 'local', label: 'Local' },
    { value: 'transit', label: 'Transit' }
];

const TRANSPORT_MODES = [
    { value: 'manifest_cargo', label: 'Manifest Cargo' },
    { value: 'in_cabin', label: 'In Cabin' },
    { value: 'excess_baggage', label: 'Excess Baggage' },
    { value: 'ground_transport', label: 'Road' }
];

const SPECIES_OPTIONS = [
    { value: 'Dog', label: 'Dog' },
    { value: 'Cat', label: 'Cat' },
    { value: 'Bird', label: 'Bird' },
    { value: 'Other', label: 'Other' }
];

const PROMO_BADGES = [
    { value: 'none', label: 'None' },
    { value: 'complimentary', label: 'Complimentary (Free)' },
    { value: 'bestseller', label: 'Bestseller' },
    { value: 'limited_offer', label: 'Limited Offer' },
    { value: 'essential', label: 'Essential' }
];

// --- Components ---

export default function ServiceManagementPage() {
    const router = useRouter();
    const params = useParams();
    const serviceId = params.serviceId as string;
    const isNew = serviceId === 'new';

    const [categories, setCategories] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(!isNew);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showDiscardModal, setShowDiscardModal] = useState(false);

    const form = useForm<ServiceFormValues>({
        resolver: zodResolver(serviceSchema),
        defaultValues: {
            code: '',
            name: '',
            categoryId: '',
            icon: 'Box',
            shortDescription: '',
            longDescription: '',
            validSpecies: [],
            validServiceTypes: [],
            validTransportModes: [],
            requirements: [],
            pricingModel: 'fixed',
            basePrice: 0,
            baseCost: 0,
            taxRate: 5.0,
            promoBadge: 'none',
            isActive: true,
            isMandatory: false,
        }
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "requirements"
    });

    const promoBadge = form.watch('promoBadge');

    // Auto-set price to 0 if complimentary
    useEffect(() => {
        if (promoBadge === 'complimentary') {
            form.setValue('basePrice', 0);
        }
    }, [promoBadge, form]);

    // --- Data Fetching ---

    useEffect(() => {
        const init = async () => {
            const cats = await getCategories();
            setCategories(cats || []);

            if (!isNew) {
                try {
                    const { data: service, error } = await supabase
                        .from('service_catalog')
                        .select('*')
                        .eq('id', serviceId)
                        .single();

                    if (error) throw error;

                    if (service) {
                        // Parse requirements
                        let reqs = [];
                        try {
                            reqs = typeof service.requirements === 'string'
                                ? JSON.parse(service.requirements)
                                : service.requirements || [];
                            if (!Array.isArray(reqs)) reqs = [service.requirements].filter(Boolean);
                        } catch (e) {
                            reqs = service.requirements ? [service.requirements] : [];
                        }

                        form.reset({
                            id: service.id,
                            code: service.code || '',
                            name: service.name || '',
                            categoryId: service.category_id || '',
                            icon: service.icon || 'Box',
                            shortDescription: service.short_description || '',
                            longDescription: service.long_description || '',

                            validSpecies: service.valid_species || [],
                            validServiceTypes: service.valid_service_types || [],
                            validTransportModes: service.valid_transport_modes || [],

                            requirements: reqs.map((r: string) => ({ value: r })),
                            pricingModel: service.pricing_model || 'fixed',
                            basePrice: Number(service.base_price || 0),
                            baseCost: Number(service.base_cost || 0),
                            taxRate: Number(service.tax_rate || 5.0),
                            promoBadge: service.promo_badge || 'none',
                            isActive: service.is_active !== undefined ? service.is_active : true,
                            isMandatory: service.is_mandatory || false,
                        });
                    }
                } catch (error) {
                    console.error(error);
                    toast.error('Error loading service details');
                } finally {
                    setIsLoading(false);
                }
            }
        };
        init();
    }, [serviceId, isNew, form]);

    // --- Logic ---

    const generateSKU = () => {
        const sku = `SVC-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
        form.setValue('code', sku, { shouldValidate: true });
    };

    const onSubmit = async (data: ServiceFormValues) => {
        setIsSubmitting(true);
        try {
            const payload = {
                code: data.code,
                name: data.name,
                category_id: data.categoryId,
                icon: data.icon,
                short_description: data.shortDescription,
                long_description: data.longDescription,

                valid_species: data.validSpecies,
                valid_service_types: data.validServiceTypes,
                valid_transport_modes: data.validTransportModes,

                requirements: JSON.stringify(data.requirements.map(r => r.value)),
                pricing_model: data.pricingModel,
                base_price: data.basePrice,
                base_cost: data.baseCost,
                tax_rate: data.taxRate,
                promo_badge: data.promoBadge,
                is_active: data.isActive,
                is_mandatory: data.isMandatory
            };

            let error;
            if (isNew) {
                const res = await supabase.from('service_catalog').insert(payload);
                error = res.error;
            } else {
                const res = await supabase.from('service_catalog').update(payload).eq('id', serviceId);
                error = res.error;
            }

            if (!error) {
                toast.success(`Service ${isNew ? 'created' : 'updated'} successfully`);
                router.push('/admin/services');
            } else {
                console.error(error);
                toast.error('Failed to save service');
            }
        } catch (error) {
            console.error(error);
            toast.error('An unexpected error occurred');
        } finally {
            setIsSubmitting(false);
        }
    };

    // --- Calculations ---
    const basePrice = form.watch('basePrice') || 0;
    const baseCost = form.watch('baseCost') || 0;
    const profit = basePrice - baseCost;
    const margin = basePrice > 0 ? (profit / basePrice) * 100 : 0;
    const isLowMargin = margin < 15;
    const isActive = form.watch('isActive');

    // --- Data Safety ---

    // Protect Browser Window (Refresh/Close Tab)
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (form.formState.isDirty) {
                e.preventDefault();
                e.returnValue = '';
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [form.formState.isDirty]);

    // Protect Cancel Button
    const handleCancel = () => {
        if (form.formState.isDirty) {
            setShowDiscardModal(true);
        } else {
            router.push('/admin/services');
        }
    };

    const confirmDiscard = () => {
        router.push('/admin/services');
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50/50 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <RefreshCw className="animate-spin text-brand-color-01" size={32} />
                    <p className="text-gray-500 font-medium">Loading service details...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50/50 pb-20">
            {/* 1. Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
                <div className="container-custom py-4">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                            {/* Breadcrumbs Removed */}
                            <div className="flex items-center gap-3">
                                <h1 className="text-2xl font-bold text-brand-color-01">
                                    {isNew ? 'Create Service' : form.getValues('name')}
                                </h1>
                                {!isNew && (
                                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${isActive
                                        ? 'bg-green-50 text-green-700 border-green-200'
                                        : 'bg-gray-100 text-gray-600 border-gray-200'
                                        }`}>
                                        {isActive ? 'Active' : 'Archived'}
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={handleCancel}
                                className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={form.handleSubmit(onSubmit)}
                                disabled={isSubmitting}
                                className="px-6 py-2 rounded-lg bg-brand-color-01 text-white text-sm font-bold shadow-lg shadow-brand-color-01/20 hover:bg-brand-color-01/90 transition-all flex items-center gap-2 disabled:opacity-70"
                            >
                                {isSubmitting ? <RefreshCw className="animate-spin" size={16} /> : <Save size={16} />}
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="container-custom py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* 2. Left Column (Main Context) */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* Card A: Service Identity */}
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
                                                onClick={generateSKU}
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

                        {/* Card B: Descriptions */}
                        <section className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                            <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <FileText className="text-brand-color-01" size={20} />
                                Descriptions
                            </h2>

                            <div className="space-y-6">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-700 uppercase">Short Brief <span className="text-gray-400 font-normal normal-case">(Max 140 chars)</span></label>
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

                        {/* Card C: Logic Matrix */}
                        <section className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                            <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <Layers className="text-brand-color-01" size={20} />
                                Logic Matrix
                            </h2>

                            <div className="space-y-8">
                                {/* Group 1: Route Logic */}
                                <div className="space-y-3">
                                    <label className="text-xs font-bold text-gray-700 uppercase">Route Logic</label>
                                    <Controller
                                        control={form.control}
                                        name="validServiceTypes"
                                        render={({ field }) => (
                                            <div className="flex flex-wrap gap-2">
                                                {/* Universal Chip */}
                                                <div className={`
                                                    flex items-center gap-2 px-2.5 py-1 rounded-full border transition-all text-xs font-medium
                                                    ${field.value.length === 0
                                                        ? 'bg-green-50 text-green-700 border-green-200 shadow-sm'
                                                        : 'bg-gray-100 text-gray-400 border-gray-200 opacity-50'}
                                                `}>
                                                    {field.value.length === 0 ? <Check size={14} /> : <X size={14} />}
                                                    Universal (All)
                                                </div>

                                                {SERVICE_TYPES.map(type => {
                                                    const isSelected = field.value.includes(type.value);
                                                    return (
                                                        <button
                                                            key={type.value}
                                                            type="button"
                                                            onClick={() => {
                                                                if (isSelected) {
                                                                    field.onChange(field.value.filter(v => v !== type.value));
                                                                } else {
                                                                    field.onChange([...field.value, type.value]);
                                                                }
                                                            }}
                                                            className={`
                                                                flex items-center gap-2 px-2.5 py-1 rounded-full border transition-all text-xs font-medium
                                                                ${isSelected
                                                                    ? 'bg-blue-50 text-blue-700 border-blue-200 shadow-sm'
                                                                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}
                                                            `}
                                                        >
                                                            {type.label}
                                                            {isSelected && <Check size={14} />}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    />
                                </div>

                                {/* Group 2: Transport Logic */}
                                <div className="space-y-3">
                                    <label className="text-xs font-bold text-gray-700 uppercase">Transport Logic</label>
                                    <Controller
                                        control={form.control}
                                        name="validTransportModes"
                                        render={({ field }) => (
                                            <div className="flex flex-wrap gap-2">
                                                {/* Universal Chip */}
                                                <div className={`
                                                    flex items-center gap-2 px-2.5 py-1 rounded-full border transition-all text-xs font-medium
                                                    ${field.value.length === 0
                                                        ? 'bg-green-50 text-green-700 border-green-200 shadow-sm'
                                                        : 'bg-gray-100 text-gray-400 border-gray-200 opacity-50'}
                                                `}>
                                                    {field.value.length === 0 ? <Check size={14} /> : <X size={14} />}
                                                    All Modes
                                                </div>

                                                {TRANSPORT_MODES.map(mode => {
                                                    const isSelected = field.value.includes(mode.value);
                                                    return (
                                                        <button
                                                            key={mode.value}
                                                            type="button"
                                                            onClick={() => {
                                                                if (isSelected) {
                                                                    field.onChange(field.value.filter(v => v !== mode.value));
                                                                } else {
                                                                    field.onChange([...field.value, mode.value]);
                                                                }
                                                            }}
                                                            className={`
                                                                flex items-center gap-2 px-2.5 py-1 rounded-full border transition-all text-xs font-medium
                                                                ${isSelected
                                                                    ? 'bg-purple-50 text-purple-700 border-purple-200 shadow-sm'
                                                                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}
                                                            `}
                                                        >
                                                            {mode.label}
                                                            {isSelected && <Check size={14} />}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    />
                                </div>

                                {/* Group 3: Species Logic */}
                                <div className="space-y-3">
                                    <label className="text-xs font-bold text-gray-700 uppercase">Species Logic</label>
                                    <Controller
                                        control={form.control}
                                        name="validSpecies"
                                        render={({ field }) => (
                                            <div className="flex flex-wrap gap-2">
                                                {/* Universal Chip */}
                                                <div className={`
                                                    flex items-center gap-2 px-2.5 py-1 rounded-full border transition-all text-xs font-medium
                                                    ${field.value.length === 0
                                                        ? 'bg-green-50 text-green-700 border-green-200 shadow-sm'
                                                        : 'bg-gray-100 text-gray-400 border-gray-200 opacity-50'}
                                                `}>
                                                    {field.value.length === 0 ? <Check size={14} /> : <X size={14} />}
                                                    All Species
                                                </div>

                                                {SPECIES_OPTIONS.map(species => {
                                                    const isSelected = field.value.includes(species.value);
                                                    return (
                                                        <button
                                                            key={species.value}
                                                            type="button"
                                                            onClick={() => {
                                                                if (isSelected) {
                                                                    field.onChange(field.value.filter(v => v !== species.value));
                                                                } else {
                                                                    field.onChange([...field.value, species.value]);
                                                                }
                                                            }}
                                                            className={`
                                                                flex items-center gap-2 px-2.5 py-1 rounded-full border transition-all text-xs font-medium
                                                                ${isSelected
                                                                    ? 'bg-orange-50 text-orange-700 border-orange-200 shadow-sm'
                                                                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}
                                                            `}
                                                        >
                                                            {species.label}
                                                            {isSelected && <Check size={14} />}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    />
                                </div>

                                {/* Requirements Builder (Kept) */}
                                <div className="space-y-3 pt-4 border-t border-gray-100">
                                    <label className="text-xs font-bold text-gray-700 uppercase">Requirements Builder</label>
                                    <div className="flex gap-2">
                                        <input
                                            id="req-input"
                                            className="flex-1 px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-color-01/20 focus:border-brand-color-01 outline-none"
                                            placeholder="Add a requirement (e.g. Valid Rabies Vaccine)"
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    const val = e.currentTarget.value.trim();
                                                    if (val) {
                                                        append({ value: val });
                                                        e.currentTarget.value = '';
                                                    }
                                                }
                                            }}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const input = document.getElementById('req-input') as HTMLInputElement;
                                                const val = input.value.trim();
                                                if (val) {
                                                    append({ value: val });
                                                    input.value = '';
                                                }
                                            }}
                                            className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
                                        >
                                            <Plus size={18} />
                                        </button>
                                    </div>

                                    <div className="space-y-2">
                                        {fields.length === 0 && (
                                            <div className="text-center py-6 text-gray-400 text-sm bg-gray-50 rounded-lg border border-dashed border-gray-200">
                                                No requirements added yet.
                                            </div>
                                        )}
                                        {fields.map((field, index) => (
                                            <div key={field.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 group hover:border-brand-color-01/30 transition-colors">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-brand-color-01" />
                                                    <span className="text-sm text-gray-700">{field.value}</span>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => remove(index)}
                                                    className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* 3. Right Column (Financials & Control - Sticky) */}
                    <div className="lg:col-span-1 space-y-8">
                        <div className="sticky top-24 space-y-8">

                            {/* Card: Marketing (New) */}
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

                            {/* Card D: Financial Engine */}
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

                                    {/* Revenue Section */}
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
                                                className={`w-full px-3 py-2 bg-white border border-emerald-200 rounded-lg text-lg font-bold text-gray-900 tabular-nums focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none ${promoBadge === 'complimentary' ? 'opacity-50 bg-gray-100' : ''}`}
                                                min="0"
                                                step="0.01"
                                            />
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

                                    {/* Cost Section */}
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

                            {/* Card E: Control Center */}
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

                                            {/* Tooltip */}
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
                    </div>

                </div>
            </main>

            {/* Discard Changes Modal */}
            {showDiscardModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 animate-in zoom-in-95 duration-200 border border-gray-200">
                        <div className="flex items-center gap-3 mb-4 text-amber-600">
                            <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center">
                                <AlertTriangle size={20} />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900">Unsaved Changes</h3>
                        </div>
                        <p className="text-gray-600 mb-6 text-sm leading-relaxed">
                            You have unsaved changes. If you leave this page, all changes will be lost. Are you sure you want to discard them?
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowDiscardModal(false)}
                                className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition-colors text-sm"
                            >
                                Keep Editing
                            </button>
                            <button
                                onClick={confirmDiscard}
                                className="px-4 py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition-colors shadow-lg shadow-red-600/20 text-sm"
                            >
                                Discard Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
