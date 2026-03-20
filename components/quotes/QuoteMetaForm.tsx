'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Settings, ChevronDown } from 'lucide-react';

interface Entity {
    id: string;
    display_name: string;
    contact_info?: { email?: string; phone?: string };
}

export interface QuoteFormState {
    entity_id: string;
    customer_name: string;
    reference: string;
    issue_date: string;
    due_date: string;
    subject: string;
}

interface QuoteMetaFormProps {
    formState: QuoteFormState;
    onFieldChange: (field: keyof QuoteFormState, value: string) => void;
    entities?: Entity[];
    docNumber?: string;
}

export default function QuoteMetaForm({
    formState,
    onFieldChange,
    entities = [],
    docNumber,
}: QuoteMetaFormProps) {
    const [entitySearch, setEntitySearch] = useState(formState.customer_name || '');
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setEntitySearch(formState.customer_name || '');
    }, [formState.customer_name]);

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setShowDropdown(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const filteredEntities = entities.filter((e) =>
        e.display_name.toLowerCase().includes(entitySearch.toLowerCase())
    );

    const handleSelectEntity = (entity: Entity) => {
        onFieldChange('entity_id', entity.id);
        onFieldChange('customer_name', entity.display_name);
        setEntitySearch(entity.display_name);
        setShowDropdown(false);
    };

    return (
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Customer */}
                <div className="space-y-2" ref={dropdownRef}>
                    <label className="text-sm font-medium text-red-500">Customer Name*</label>
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Select or add a customer"
                            value={entitySearch}
                            onChange={(e) => {
                                setEntitySearch(e.target.value);
                                setShowDropdown(true);
                            }}
                            onFocus={() => setShowDropdown(true)}
                            className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-color-03/20 focus:border-brand-color-03 outline-none transition-all text-sm"
                        />
                        <button
                            type="button"
                            onClick={() => setShowDropdown(!showDropdown)}
                            className="absolute right-0 top-0 h-full w-10 bg-brand-color-03 text-white rounded-r-lg flex items-center justify-center hover:bg-brand-color-03/90"
                        >
                            <ChevronDown size={16} />
                        </button>
                        {showDropdown && filteredEntities.length > 0 && (
                            <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                                {filteredEntities.map((entity) => (
                                    <button
                                        key={entity.id}
                                        type="button"
                                        onClick={() => handleSelectEntity(entity)}
                                        className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors"
                                    >
                                        <span className="font-medium text-gray-900">{entity.display_name}</span>
                                        {entity.contact_info?.email && (
                                            <span className="text-xs text-gray-500 ml-2">{entity.contact_info.email}</span>
                                        )}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Quote # */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-red-500">Quote#*</label>
                    <div className="relative">
                        <input
                            type="text"
                            value={docNumber || 'Auto-generated'}
                            readOnly
                            className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 text-sm"
                        />
                        <Settings size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-500 cursor-pointer" />
                    </div>
                </div>

                {/* Reference */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Reference#</label>
                    <input
                        type="text"
                        value={formState.reference}
                        onChange={(e) => onFieldChange('reference', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-color-03/20 focus:border-brand-color-03 outline-none text-sm"
                    />
                </div>

                {/* Dates */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-red-500">Quote Date*</label>
                    <input
                        type="date"
                        value={formState.issue_date}
                        onChange={(e) => onFieldChange('issue_date', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-color-03/20 focus:border-brand-color-03 outline-none text-sm"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Expiry Date</label>
                    <input
                        type="date"
                        value={formState.due_date}
                        onChange={(e) => onFieldChange('due_date', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-color-03/20 focus:border-brand-color-03 outline-none text-sm"
                    />
                </div>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-100 grid grid-cols-[140px_1fr] items-center gap-4">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                    Subject
                </label>
                <textarea
                    placeholder="Let your customer know what this Quote is for"
                    value={formState.subject}
                    onChange={(e) => onFieldChange('subject', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-color-03/20 focus:border-brand-color-03 outline-none text-sm resize-none h-10"
                />
            </div>
        </div>
    );
}
