// components/admin/services/ServiceLogicSection.tsx
// Card C: Route logic, transport modes, species, and requirements builder.

'use client';

import { UseFormReturn, Controller, useFieldArray } from 'react-hook-form';
import { Layers, Check, X, Plus, Trash2 } from 'lucide-react';
import { SERVICE_TYPES, TRANSPORT_MODES, SPECIES_OPTIONS } from '@/lib/constants/service-constants';
import type { ServiceFormValues } from '@/lib/validations/service-schema';

interface Props {
    form: UseFormReturn<ServiceFormValues>;
}

function ChipSelector({
    field,
    options,
    universalLabel,
    activeColor,
}: {
    field: { value: string[]; onChange: (v: string[]) => void };
    options: { value: string; label: string }[];
    universalLabel: string;
    activeColor: string;
}) {
    const colorMap: Record<string, string> = {
        blue: 'bg-blue-50 text-blue-700 border-blue-200',
        purple: 'bg-purple-50 text-purple-700 border-purple-200',
        orange: 'bg-orange-50 text-orange-700 border-orange-200',
    };
    const activeClass = colorMap[activeColor] || colorMap.blue;

    return (
        <div className="flex flex-wrap gap-2">
            <div
                className={`
                    flex items-center gap-2 px-2.5 py-1 rounded-full border transition-all text-xs font-medium
                    ${field.value.length === 0
                        ? 'bg-green-50 text-green-700 border-green-200 shadow-sm'
                        : 'bg-gray-100 text-gray-400 border-gray-200 opacity-50'}
                `}
            >
                {field.value.length === 0 ? <Check size={14} /> : <X size={14} />}
                {universalLabel}
            </div>

            {options.map(option => {
                const isSelected = field.value.includes(option.value);
                return (
                    <button
                        key={option.value}
                        type="button"
                        onClick={() => {
                            if (isSelected) {
                                field.onChange(field.value.filter(v => v !== option.value));
                            } else {
                                field.onChange([...field.value, option.value]);
                            }
                        }}
                        className={`
                            flex items-center gap-2 px-2.5 py-1 rounded-full border transition-all text-xs font-medium
                            ${isSelected
                                ? `${activeClass} shadow-sm`
                                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}
                        `}
                    >
                        {option.label}
                        {isSelected && <Check size={14} />}
                    </button>
                );
            })}
        </div>
    );
}

export default function ServiceLogicSection({ form }: Props) {
    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: 'requirements',
    });

    return (
        <section className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Layers className="text-brand-color-01" size={20} />
                Logic Matrix
            </h2>

            <div className="space-y-8">
                {/* Route Logic */}
                <div className="space-y-3">
                    <label className="text-xs font-bold text-gray-700 uppercase">Route Logic</label>
                    <Controller
                        control={form.control}
                        name="validServiceTypes"
                        render={({ field }) => (
                            <ChipSelector
                                field={field}
                                options={SERVICE_TYPES}
                                universalLabel="Universal (All)"
                                activeColor="blue"
                            />
                        )}
                    />
                </div>

                {/* Transport Logic */}
                <div className="space-y-3">
                    <label className="text-xs font-bold text-gray-700 uppercase">Transport Logic</label>
                    <Controller
                        control={form.control}
                        name="validTransportModes"
                        render={({ field }) => (
                            <ChipSelector
                                field={field}
                                options={TRANSPORT_MODES}
                                universalLabel="All Modes"
                                activeColor="purple"
                            />
                        )}
                    />
                </div>

                {/* Species Logic */}
                <div className="space-y-3">
                    <label className="text-xs font-bold text-gray-700 uppercase">Species Logic</label>
                    <Controller
                        control={form.control}
                        name="validSpecies"
                        render={({ field }) => (
                            <ChipSelector
                                field={field}
                                options={SPECIES_OPTIONS}
                                universalLabel="All Species"
                                activeColor="orange"
                            />
                        )}
                    />
                </div>

                {/* Requirements Builder */}
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
    );
}
