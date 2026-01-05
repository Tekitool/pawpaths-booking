'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
    Edit2, Trash2, CheckSquare, Square, Plane, Stethoscope,
    Home, FileText, Box, Truck, AlertCircle, TrendingUp,
    Archive, DollarSign, MoreHorizontal, ShieldAlert
} from 'lucide-react';
import { toast } from 'sonner';

// --- Types ---
export interface ServiceData {
    id: string;
    name: string;
    description: string;
    cost: number;
    price: number;
    isMandatory: boolean;
    isActive: boolean;
    category: string;
}

interface ServicesTableProps {
    data: ServiceData[];
    onEdit: (service: ServiceData) => void;
    onDelete: (ids: string[]) => void;
    onToggleStatus: (id: string, currentStatus: boolean) => void;
    onArchive: (ids: string[]) => void;
}

// --- Helpers ---

const getCategoryIcon = (category: string) => {
    const normalized = category?.toLowerCase() || '';
    if (normalized.includes('logistics') || normalized.includes('transport')) return <Plane size={18} />;
    if (normalized.includes('medical') || normalized.includes('vet')) return <Stethoscope size={18} />;
    if (normalized.includes('boarding') || normalized.includes('housing')) return <Home size={18} />;
    if (normalized.includes('admin') || normalized.includes('doc')) return <FileText size={18} />;
    if (normalized.includes('crate') || normalized.includes('box')) return <Box size={18} />;
    return <Truck size={18} />;
};

const getCategoryColor = (category: string) => {
    const normalized = category?.toLowerCase() || '';

    // Veterinary / Medical -> Pink/Red
    if (normalized.includes('vet') || normalized.includes('medical') || normalized.includes('health')) {
        return 'bg-pink-50 text-pink-700 border-pink-200';
    }

    // Transport / Logistics -> Blue
    if (normalized.includes('transport') || normalized.includes('logistics') || normalized.includes('flight') || normalized.includes('cargo') || normalized.includes('taxi')) {
        return 'bg-blue-50 text-blue-700 border-blue-200';
    }

    // Boarding -> Orange
    if (normalized.includes('boarding') || normalized.includes('housing') || normalized.includes('kennel') || normalized.includes('day care')) {
        return 'bg-orange-50 text-orange-700 border-orange-200';
    }

    // Admin / Docs -> Gray/Slate
    if (normalized.includes('admin') || normalized.includes('doc') || normalized.includes('permit') || normalized.includes('clearance')) {
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }

    // Crate -> Amber
    if (normalized.includes('crate') || normalized.includes('box')) {
        return 'bg-amber-50 text-amber-700 border-amber-200';
    }

    // Default -> Purple
    return 'bg-purple-50 text-purple-700 border-purple-200';
};

const calculateMargin = (cost: number, price: number) => {
    if (price === 0) return 0;
    return ((price - cost) / price) * 100;
};

const getMarginColor = (margin: number) => {
    if (margin >= 30) return 'bg-green-100 text-green-800 border-green-200'; // Healthy
    if (margin >= 15) return 'bg-yellow-100 text-yellow-800 border-yellow-200'; // Warning
    return 'bg-red-100 text-red-800 border-red-200'; // Critical
};

// --- Component ---

export default function ServicesTable({
    data,
    onEdit,
    onDelete,
    onToggleStatus,
    onArchive
}: ServicesTableProps) {
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    // --- Selection Logic ---
    const handleSelectAll = () => {
        if (selectedIds.size === data.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(data.map(d => d.id)));
        }
    };

    const handleSelectRow = (id: string) => {
        const newSelected = new Set(selectedIds);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedIds(newSelected);
    };

    const isAllSelected = data.length > 0 && selectedIds.size === data.length;
    const isIndeterminate = selectedIds.size > 0 && selectedIds.size < data.length;

    // --- Render ---
    return (
        <div className="relative pb-20"> {/* Padding for floating bar */}

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500 font-semibold">
                                {/* Checkbox */}
                                <th className="py-4 px-4 w-12 text-center">
                                    <button
                                        onClick={handleSelectAll}
                                        className="text-gray-400 hover:text-gray-600 transition-colors"
                                    >
                                        {isAllSelected ? (
                                            <CheckSquare size={18} className="text-brand-color-01" />
                                        ) : isIndeterminate ? (
                                            <CheckSquare size={18} className="text-brand-color-01 opacity-50" />
                                        ) : (
                                            <Square size={18} />
                                        )}
                                    </button>
                                </th>

                                <th className="py-4 px-4">Service Identity</th>
                                <th className="py-4 px-4">Category</th>
                                <th className="py-4 px-4 text-right">Cost</th>
                                <th className="py-4 px-4 text-right">Price</th>
                                <th className="py-4 px-4 text-right">Margin</th>
                                <th className="py-4 px-4 text-center">Status</th>
                                <th className="py-4 px-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {data.map((service) => {
                                const margin = calculateMargin(service.cost, service.price);
                                const isSelected = selectedIds.has(service.id);

                                return (
                                    <tr
                                        key={service.id}
                                        className={`
                                            group transition-all duration-200
                                            ${isSelected ? 'bg-brand-color-01/5' : 'hover:bg-gray-50'}
                                        `}
                                    >
                                        {/* Checkbox */}
                                        <td className="py-4 px-4 text-center">
                                            <button
                                                onClick={() => handleSelectRow(service.id)}
                                                className="text-gray-400 hover:text-gray-600 transition-colors"
                                            >
                                                {isSelected ? (
                                                    <CheckSquare size={18} className="text-brand-color-01" />
                                                ) : (
                                                    <Square size={18} />
                                                )}
                                            </button>
                                        </td>

                                        {/* Identity */}
                                        <td className="py-4 px-4">
                                            <div className="flex items-start gap-3">
                                                <div className={`
                                                    p-2 rounded-lg bg-gray-100 text-gray-500 mt-0.5
                                                    group-hover:bg-white group-hover:shadow-sm transition-all
                                                `}>
                                                    {getCategoryIcon(service.category)}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-gray-900 text-sm">
                                                        <Link href={`/admin/services/${service.id}`} className="hover:text-blue-600 hover:underline cursor-pointer">
                                                            {service.name}
                                                        </Link>
                                                        {service.isMandatory && (
                                                            <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-red-100 text-red-800">
                                                                Mandatory
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="text-xs text-gray-500 mt-0.5 line-clamp-1 max-w-[240px]">
                                                        {service.description}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Category */}
                                        <td className="py-4 px-4">
                                            <span className={`
                                                inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border
                                                ${getCategoryColor(service.category)}
                                            `}>
                                                {service.category || 'Uncategorized'}
                                            </span>
                                        </td>

                                        {/* Cost */}
                                        <td className="py-4 px-4 text-right font-medium text-gray-600 tabular-nums text-sm">
                                            {service.cost.toFixed(2)}
                                        </td>

                                        {/* Price */}
                                        <td className="py-4 px-4 text-right font-bold text-gray-900 tabular-nums text-sm">
                                            {service.price.toFixed(2)}
                                        </td>

                                        {/* Margin */}
                                        <td className="py-4 px-4 text-right">
                                            <span className={`
                                                inline-flex items-center px-2 py-1 rounded-md text-xs font-bold border tabular-nums
                                                ${getMarginColor(margin)}
                                            `}>
                                                {margin.toFixed(1)}%
                                            </span>
                                        </td>

                                        {/* Status */}
                                        <td className="py-4 px-4 text-center">
                                            <button
                                                onClick={() => onToggleStatus(service.id, service.isActive)}
                                                className={`
                                                    inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all
                                                    ${service.isActive
                                                        ? 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-200'
                                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200'}
                                                `}
                                            >
                                                <span className={`w-1.5 h-1.5 rounded-full ${service.isActive ? 'bg-green-500' : 'bg-gray-400'}`} />
                                                {service.isActive ? 'Active' : 'Archived'}
                                            </button>
                                        </td>

                                        {/* Actions */}
                                        <td className="py-4 px-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => onEdit(service)}
                                                    className="p-2 text-brand-secondary opacity-60 hover:opacity-100 hover:bg-brand-secondary/10 rounded-lg transition-all"
                                                    title="Edit Service"
                                                >
                                                    <Edit2 size={18} />
                                                </button>
                                                <button
                                                    onClick={() => onDelete([service.id])}
                                                    className="p-2 text-brand-color-03 opacity-60 hover:opacity-100 hover:bg-brand-color-03/10 rounded-lg transition-all"
                                                    title="Delete Service"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>


        </div>
    );
}
