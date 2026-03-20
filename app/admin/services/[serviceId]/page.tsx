'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save, RefreshCw, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { getCategories, upsertService } from '@/lib/actions/service-actions';
import { supabase } from '@/lib/supabase/client';
import { serviceSchema, type ServiceFormValues } from '@/lib/validations/service-schema';
import SecurityModal from '@/components/ui/SecurityModal';

import ServiceIdentitySection from '@/components/admin/services/ServiceIdentitySection';
import ServiceDescriptionsSection from '@/components/admin/services/ServiceDescriptionsSection';
import ServiceLogicSection from '@/components/admin/services/ServiceLogicSection';
import ServiceFinancialsSection from '@/components/admin/services/ServiceFinancialsSection';

export default function ServiceManagementPage() {
    const router = useRouter();
    const params = useParams();
    const serviceId = params.serviceId as string;
    const isNew = serviceId === 'new';

    const [categories, setCategories] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(!isNew);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showDiscardModal, setShowDiscardModal] = useState(false);
    const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
    const [pendingFormData, setPendingFormData] = useState<ServiceFormValues | null>(null);

    const form = useForm<ServiceFormValues>({
        resolver: zodResolver(serviceSchema),
        defaultValues: {
            code: '', name: '', categoryId: '', icon: 'Box',
            shortDescription: '', longDescription: '',
            validSpecies: [], validServiceTypes: [], validTransportModes: [],
            requirements: [],
            pricingModel: 'fixed', uom: 'service', basePrice: 0, baseCost: 0, taxRate: 5.0,
            promoBadge: 'none', isActive: true, isMandatory: false,
        },
    });

    const promoBadge = form.watch('promoBadge');
    const isActive = form.watch('isActive');

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
                        let reqs: string[] = [];
                        try {
                            reqs = typeof service.requirements === 'string'
                                ? JSON.parse(service.requirements)
                                : service.requirements || [];
                            if (!Array.isArray(reqs)) reqs = [service.requirements].filter(Boolean);
                        } catch {
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
                            uom: service.uom || 'service',
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

    // --- Handlers ---

    const generateSKU = () => {
        const sku = `SVC-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
        form.setValue('code', sku, { shouldValidate: true });
    };

    // Step 1: form validates → open SecurityModal for updates, or save directly for new
    const handleValidSubmit = (data: ServiceFormValues) => {
        if (isNew) {
            doSave(data, undefined);
        } else {
            setPendingFormData(data);
            setIsSaveModalOpen(true);
        }
    };

    // Step 2: SecurityModal confirmed → proceed with save
    const handleSaveConfirm = async (reason: string) => {
        if (!pendingFormData) return;
        setIsSaveModalOpen(false);
        await doSave(pendingFormData, reason);
    };

    // Step 3: actual save
    const doSave = async (data: ServiceFormValues, audit_reason: string | undefined) => {
        setIsSubmitting(true);
        try {
            const result = await upsertService({
                id: isNew ? undefined : serviceId,
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
                uom: data.uom,
                base_price: data.basePrice,
                base_cost: data.baseCost,
                tax_rate: data.taxRate,
                promo_badge: data.promoBadge,
                is_active: data.isActive,
                is_mandatory: data.isMandatory,
                audit_reason,
            });

            if (result.success) {
                toast.success(`Service ${isNew ? 'created' : 'updated'} successfully`);
                router.push('/admin/services');
            } else {
                console.error(result.error || result.message);
                toast.error(result.message || 'Failed to save service');
            }
        } catch (error) {
            console.error(error);
            toast.error('An unexpected error occurred');
        } finally {
            setIsSubmitting(false);
        }
    };

    // --- Data Safety ---

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

    // --- Render ---

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
            {/* Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
                <div className="container-custom py-4">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
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
                        <div className="flex items-center gap-3">
                            <button type="button" onClick={handleCancel}
                                className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors">
                                Cancel
                            </button>
                            <button onClick={form.handleSubmit(handleValidSubmit)} disabled={isSubmitting}
                                className="px-6 py-2 rounded-lg bg-brand-color-01 text-white text-sm font-bold shadow-lg shadow-brand-color-01/20 hover:bg-brand-color-01/90 transition-all flex items-center gap-2 disabled:opacity-70">
                                {isSubmitting ? <RefreshCw className="animate-spin" size={16} /> : <Save size={16} />}
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="container-custom py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column */}
                    <div className="lg:col-span-2 space-y-8">
                        <ServiceIdentitySection form={form} categories={categories} onGenerateSKU={generateSKU} />
                        <ServiceDescriptionsSection form={form} />
                        <ServiceLogicSection form={form} />
                    </div>

                    {/* Right Column */}
                    <div className="lg:col-span-1 space-y-8">
                        <ServiceFinancialsSection form={form} />
                    </div>
                </div>
            </main>

            {/* Save Confirmation Modal */}
            <SecurityModal
                isOpen={isSaveModalOpen}
                onClose={() => setIsSaveModalOpen(false)}
                onConfirm={handleSaveConfirm}
                title={`Save Changes to "${form.getValues('name')}"`}
                actionType="warning"
                isLoading={isSubmitting}
                confirmLabel="Save Changes"
                zIndex="z-[70]"
            />

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
                            <button onClick={() => setShowDiscardModal(false)}
                                className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition-colors text-sm">
                                Keep Editing
                            </button>
                            <button onClick={confirmDiscard}
                                className="px-4 py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition-colors shadow-lg shadow-red-600/20 text-sm">
                                Discard Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
