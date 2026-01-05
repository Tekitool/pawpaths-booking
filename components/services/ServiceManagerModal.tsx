'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
    X, Save, Box, FileText, DollarSign, Settings,
    Plus, Trash2, AlertTriangle, Check, RefreshCw,
    Dog, Cat, Bird, Info, TrendingUp
} from 'lucide-react';
import { toast } from 'sonner';
import { upsertService, getCategories } from '@/lib/actions/service-actions';

// --- Types & Constants ---

const TABS = [
    { id: 'identity', label: 'Identity', icon: FileText },
    { id: 'financials', label: 'Financials', icon: DollarSign },
    { id: 'operations', label: 'Operations', icon: Settings },
];

const PRICING_MODELS = [
    { value: 'fixed', label: 'Fixed Price (One-time)' },
    { value: 'per_day', label: 'Time-Based (Per Day)' },
    { value: 'per_item', label: 'Quantity-Based (Per Item)' },
    { value: 'per_kg', label: 'Weight-Based (Per Kg)' },
    { value: 'per_km', label: 'Distance-Based (Per Km)' },
];

const PET_TYPES = [
    { value: 'dog', label: 'Dog', icon: Dog },
    { value: 'cat', label: 'Cat', icon: Cat },
    { value: 'bird', label: 'Bird', icon: Bird },
    { value: 'other', label: 'Other', icon: Box },
];

// --- Helper Components ---

const TabButton = ({ active, onClick, icon: Icon, label }) => (
    <button
        onClick={onClick}
        className={`
            flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all border-b-2
            ${active
                ? 'border-brand-color-01 text-brand-color-01 bg-brand-color-01/5'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'}
        `}
    >
        <Icon size={16} />
        {label}
    </button>
);

interface FormFieldProps {
    label: string;
    required?: boolean;
    children: React.ReactNode;
    helpText?: string;
}

const FormField = ({ label, required, children, helpText }: FormFieldProps) => (
    <div className="space-y-1.5">
        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        {children}
        {helpText && <p className="text-xs text-gray-400">{helpText}</p>}
    </div>
);

// --- Main Component ---

export default function ServiceManagerModal({ isOpen, onClose, service, onSuccess }) {
    const [activeTab, setActiveTab] = useState('identity');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [categories, setCategories] = useState([]);

    // Form State
    const [formData, setFormData] = useState({
        id: '',
        code: '',
        name: '',
        category_id: '',
        pricing_model: 'fixed',
        short_description: '',
        long_description: '',
        base_price: 0,
        base_cost: 0,
        tax_rate: 5.0,
        applicability: [],
        requirements: [], // Array of strings
        is_mandatory: false,
        is_active: true,
    });

    const [newRequirement, setNewRequirement] = useState('');

    // --- Initialization ---

    useEffect(() => {
        if (isOpen) {
            loadCategories();
            if (service) {
                // Parse requirements if stored as JSON string, else treat as single item or empty
                let parsedReqs = [];
                try {
                    parsedReqs = JSON.parse(service.requirements || '[]');
                    if (!Array.isArray(parsedReqs)) parsedReqs = [service.requirements].filter(Boolean);
                } catch (e) {
                    parsedReqs = service.requirements ? [service.requirements] : [];
                }

                setFormData({
                    id: service.id || '',
                    code: service.code || '',
                    name: service.name || '',
                    category_id: service.category_id || '',
                    pricing_model: service.pricing_model || 'fixed',
                    short_description: service.short_description || '',
                    long_description: service.long_description || '',
                    base_price: Number(service.base_price || 0),
                    base_cost: Number(service.base_cost || 0),
                    tax_rate: Number(service.tax_rate || 5.0),
                    applicability: service.applicability || [],
                    requirements: parsedReqs,
                    is_mandatory: service.is_mandatory || false,
                    is_active: service.is_active !== undefined ? service.is_active : true,
                });
            } else {
                // Reset for new entry
                setFormData({
                    id: '',
                    code: generateSKU(),
                    name: '',
                    category_id: '',
                    pricing_model: 'fixed',
                    short_description: '',
                    long_description: '',
                    base_price: 0,
                    base_cost: 0,
                    tax_rate: 5.0,
                    applicability: [],
                    requirements: [],
                    is_mandatory: false,
                    is_active: true,
                });
            }
            setActiveTab('identity');
        }
    }, [isOpen, service]);

    const loadCategories = async () => {
        const cats = await getCategories();
        setCategories(cats || []);
    };

    const generateSKU = () => {
        return `SVC-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
    };

    // --- Logic ---

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleAddRequirement = () => {
        if (!newRequirement.trim()) return;
        setFormData(prev => ({
            ...prev,
            requirements: [...prev.requirements, newRequirement.trim()]
        }));
        setNewRequirement('');
    };

    const handleRemoveRequirement = (index) => {
        setFormData(prev => ({
            ...prev,
            requirements: prev.requirements.filter((_, i) => i !== index)
        }));
    };

    const toggleApplicability = (value) => {
        setFormData(prev => {
            const current = prev.applicability || [];
            if (current.includes(value)) {
                return { ...prev, applicability: current.filter(item => item !== value) };
            } else {
                return { ...prev, applicability: [...current, value] };
            }
        });
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            // Prepare payload
            const payload = {
                ...formData,
                // Serialize requirements back to string/JSON if needed, or keep as array if backend supports
                // Based on previous file, it seemed to be a string. Let's JSON stringify to be safe and structured.
                requirements: JSON.stringify(formData.requirements),
                audit_reason: service ? 'Updated via Service Manager' : 'Created via Service Manager'
            };

            const result: any = await upsertService(payload);

            if (result.success) {
                toast.success('Service saved successfully');
                onSuccess?.();
                onClose();
            } else {
                console.error(result.error);
                const errorMessage = result.message || (typeof result.error === 'string' ? result.error : 'Please check all required fields');
                toast.error(`Failed to save service: ${errorMessage}`);
            }
        } catch (error) {
            console.error(error);
            toast.error('An unexpected error occurred');
        } finally {
            setIsSubmitting(false);
        }
    };

    // --- Financial Calculations ---
    const profit = formData.base_price - formData.base_cost;
    const margin = formData.base_price > 0 ? (profit / formData.base_price) * 100 : 0;
    const isLowMargin = margin < 15;

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">

                {/* 1. Sticky Header */}
                <div className="bg-white border-b border-gray-100 z-10">
                    <div className="flex justify-between items-center px-6 py-4">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">
                                {service ? 'Edit Service' : 'New Service'}
                            </h2>
                            <p className="text-sm text-gray-500">
                                {service ? `Editing ${service.name}` : 'Define a new service offering'}
                            </p>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    {/* Tabs */}
                    <div className="flex px-6 gap-2">
                        {TABS.map(tab => (
                            <TabButton
                                key={tab.id}
                                active={activeTab === tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                icon={tab.icon}
                                label={tab.label}
                            />
                        ))}
                    </div>
                </div>

                {/* 2. Scrollable Content */}
                <div className="flex-1 overflow-y-auto bg-gray-50/50 p-6">

                    {/* Tab 1: Identity */}
                    {activeTab === 'identity' && (
                        <div className="space-y-6 max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-300">

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField label="Service Code (SKU)" required>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={formData.code}
                                            onChange={(e) => handleInputChange('code', e.target.value)}
                                            className="flex-1 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-mono focus:ring-2 focus:ring-brand-color-01/20 focus:border-brand-color-01 outline-none"
                                            placeholder="SVC-0000"
                                        />
                                        <button
                                            onClick={() => handleInputChange('code', generateSKU())}
                                            className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg transition-colors"
                                            title="Auto-Generate SKU"
                                        >
                                            <RefreshCw size={18} />
                                        </button>
                                    </div>
                                </FormField>

                                <FormField label="Service Name" required>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => handleInputChange('name', e.target.value)}
                                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-color-01/20 focus:border-brand-color-01 outline-none"
                                        placeholder="e.g. Premium Pet Taxi"
                                    />
                                </FormField>

                                <FormField label="Category" required>
                                    <select
                                        value={formData.category_id}
                                        onChange={(e) => handleInputChange('category_id', e.target.value)}
                                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-color-01/20 focus:border-brand-color-01 outline-none"
                                    >
                                        <option value="">Select Category...</option>
                                        {categories.map(cat => (
                                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                                        ))}
                                    </select>
                                </FormField>

                                <FormField label="Unit of Measure" required>
                                    <select
                                        value={formData.pricing_model}
                                        onChange={(e) => handleInputChange('pricing_model', e.target.value)}
                                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-color-01/20 focus:border-brand-color-01 outline-none"
                                    >
                                        {PRICING_MODELS.map(model => (
                                            <option key={model.value} value={model.value}>{model.label}</option>
                                        ))}
                                    </select>
                                </FormField>
                            </div>

                            <FormField label="Short Description">
                                <input
                                    type="text"
                                    value={formData.short_description}
                                    onChange={(e) => handleInputChange('short_description', e.target.value)}
                                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-color-01/20 focus:border-brand-color-01 outline-none"
                                    placeholder="Brief summary for lists (max 100 chars)"
                                    maxLength={100}
                                />
                            </FormField>

                            <FormField label="Long Description">
                                <textarea
                                    value={formData.long_description}
                                    onChange={(e) => handleInputChange('long_description', e.target.value)}
                                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-color-01/20 focus:border-brand-color-01 outline-none min-h-[120px]"
                                    placeholder="Detailed description for quotes and invoices..."
                                />
                            </FormField>
                        </div>
                    )}

                    {/* Tab 2: Financials */}
                    {activeTab === 'financials' && (
                        <div className="space-y-8 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-300">

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Revenue Section */}
                                <div className="bg-emerald-50/50 p-6 rounded-xl border border-emerald-100 space-y-4">
                                    <div className="flex items-center gap-2 text-emerald-800 mb-2">
                                        <div className="p-1.5 bg-emerald-100 rounded-md"><DollarSign size={16} /></div>
                                        <h3 className="font-bold text-sm uppercase">Revenue (Price)</h3>
                                    </div>

                                    <FormField label="Base Price (AED)" required>
                                        <input
                                            type="number"
                                            value={formData.base_price}
                                            onChange={(e) => handleInputChange('base_price', parseFloat(e.target.value) || 0)}
                                            className="w-full px-3 py-2 bg-white border border-emerald-200 rounded-lg text-lg font-bold text-gray-900 tabular-nums focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                                            min="0"
                                            step="0.01"
                                        />
                                    </FormField>

                                    <FormField label="Tax Class">
                                        <select
                                            value={formData.tax_rate}
                                            onChange={(e) => handleInputChange('tax_rate', parseFloat(e.target.value))}
                                            className="w-full px-3 py-2 bg-white border border-emerald-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                                        >
                                            <option value={5.0}>Standard Rate (5%)</option>
                                            <option value={0.0}>Zero Rated (0%)</option>
                                        </select>
                                    </FormField>
                                </div>

                                {/* Cost Section */}
                                <div className="bg-orange-50/50 p-6 rounded-xl border border-orange-100 space-y-4">
                                    <div className="flex items-center gap-2 text-orange-800 mb-2">
                                        <div className="p-1.5 bg-orange-100 rounded-md"><TrendingUp size={16} /></div>
                                        <h3 className="font-bold text-sm uppercase">Cost (Expense)</h3>
                                    </div>

                                    <FormField label="Base Cost (AED)" required helpText="Vendor fee or internal cost allocation">
                                        <input
                                            type="number"
                                            value={formData.base_cost}
                                            onChange={(e) => handleInputChange('base_cost', parseFloat(e.target.value) || 0)}
                                            className="w-full px-3 py-2 bg-white border border-orange-200 rounded-lg text-lg font-bold text-gray-900 tabular-nums focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none"
                                            min="0"
                                            step="0.01"
                                        />
                                    </FormField>
                                </div>
                            </div>

                            {/* Live Intelligence Card */}
                            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-4">Profit Summary</h3>
                                <div className="grid grid-cols-3 gap-6">
                                    <div>
                                        <p className="text-xs text-gray-500 mb-1">Net Profit</p>
                                        <p className={`text-2xl font-bold tabular-nums ${profit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                            AED {profit.toFixed(2)}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 mb-1">Margin %</p>
                                        <div className="flex items-center gap-2">
                                            <p className={`text-2xl font-bold tabular-nums ${isLowMargin ? 'text-red-600' : 'text-emerald-600'}`}>
                                                {margin.toFixed(1)}%
                                            </p>
                                            {isLowMargin && (
                                                <span className="px-2 py-1 bg-red-100 text-red-700 text-[10px] font-bold uppercase rounded-full flex items-center gap-1">
                                                    <AlertTriangle size={10} /> Low Margin
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Tab 3: Operations */}
                    {activeTab === 'operations' && (
                        <div className="space-y-8 max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-300">

                            {/* Applicability */}
                            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-4">Applicability</h3>
                                <div className="flex gap-3">
                                    {PET_TYPES.map(pet => {
                                        const isSelected = formData.applicability.includes(pet.value);
                                        const Icon = pet.icon;
                                        return (
                                            <button
                                                key={pet.value}
                                                onClick={() => toggleApplicability(pet.value)}
                                                className={`
                                                    flex items-center gap-2 px-4 py-2 rounded-full border transition-all
                                                    ${isSelected
                                                        ? 'bg-brand-color-01 text-white border-brand-color-01 shadow-md'
                                                        : 'bg-white text-gray-600 border-gray-200 hover:border-brand-color-01/50 hover:bg-gray-50'}
                                                `}
                                            >
                                                <Icon size={16} />
                                                <span className="text-sm font-medium">{pet.label}</span>
                                                {isSelected && <Check size={14} />}
                                            </button>
                                        );
                                    })}
                                </div>
                                <p className="text-xs text-gray-400 mt-3">Select which pet types this service applies to.</p>
                            </div>

                            {/* Requirements Builder */}
                            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-4">Requirements Checklist</h3>

                                <div className="flex gap-2 mb-4">
                                    <input
                                        type="text"
                                        value={newRequirement}
                                        onChange={(e) => setNewRequirement(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleAddRequirement()}
                                        className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-color-01/20 focus:border-brand-color-01 outline-none"
                                        placeholder="Add a requirement (e.g. 'Valid Rabies Vaccine')"
                                    />
                                    <button
                                        onClick={handleAddRequirement}
                                        className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium text-sm"
                                    >
                                        Add
                                    </button>
                                </div>

                                <div className="space-y-2">
                                    {formData.requirements.length === 0 ? (
                                        <div className="text-center py-6 text-gray-400 text-sm bg-gray-50 rounded-lg border border-dashed border-gray-200">
                                            No requirements added yet.
                                        </div>
                                    ) : (
                                        formData.requirements.map((req, index) => (
                                            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100 group">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-brand-color-01" />
                                                    <span className="text-sm text-gray-700">{req}</span>
                                                </div>
                                                <button
                                                    onClick={() => handleRemoveRequirement(index)}
                                                    className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>

                            {/* Control Center */}
                            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-4">Control Center</h3>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                        <div>
                                            <h4 className="text-sm font-bold text-gray-900">Mandatory Service</h4>
                                            <p className="text-xs text-gray-500">Automatically added to all relevant quotes.</p>
                                        </div>
                                        <button
                                            onClick={() => handleInputChange('is_mandatory', !formData.is_mandatory)}
                                            className={`
                                                relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none
                                                ${formData.is_mandatory ? 'bg-brand-color-01' : 'bg-gray-200'}
                                            `}
                                        >
                                            <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${formData.is_mandatory ? 'translate-x-5' : 'translate-x-0'}`} />
                                        </button>
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                        <div>
                                            <h4 className="text-sm font-bold text-gray-900">Active Status</h4>
                                            <p className="text-xs text-gray-500">Visible in the service catalog and quotes.</p>
                                        </div>
                                        <button
                                            onClick={() => handleInputChange('is_active', !formData.is_active)}
                                            className={`
                                                relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none
                                                ${formData.is_active ? 'bg-green-500' : 'bg-gray-200'}
                                            `}
                                        >
                                            <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${formData.is_active ? 'translate-x-5' : 'translate-x-0'}`} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* 3. Sticky Footer */}
                <div className="bg-white border-t border-gray-100 p-6 z-10 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="px-6 py-2.5 rounded-xl bg-brand-color-01 text-white font-bold hover:bg-brand-color-01/90 transition-all shadow-lg shadow-brand-color-01/20 flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? <RefreshCw className="animate-spin" size={18} /> : <Save size={18} />}
                        Save Service
                    </button>
                </div>

            </div>
        </div>
    );
}
