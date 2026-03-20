// lib/utils/services-table-helpers.tsx
// Shared helpers for the services table: category icons, colors, margin calculations.

import React from 'react';
import {
    Plane, Stethoscope, Home, FileText, Box, Truck,
} from 'lucide-react';

export function getCategoryIcon(category: string) {
    const normalized = category?.toLowerCase() || '';
    if (normalized.includes('logistics') || normalized.includes('transport')) return <Plane size={18} />;
    if (normalized.includes('medical') || normalized.includes('vet')) return <Stethoscope size={18} />;
    if (normalized.includes('boarding') || normalized.includes('housing')) return <Home size={18} />;
    if (normalized.includes('admin') || normalized.includes('doc')) return <FileText size={18} />;
    if (normalized.includes('crate') || normalized.includes('box')) return <Box size={18} />;
    return <Truck size={18} />;
}

export function getCategoryColor(category: string): string {
    const normalized = category?.toLowerCase() || '';

    if (normalized.includes('vet') || normalized.includes('medical') || normalized.includes('health')) {
        return 'bg-pink-50 text-pink-700 border-pink-200';
    }
    if (normalized.includes('transport') || normalized.includes('logistics') || normalized.includes('flight') || normalized.includes('cargo') || normalized.includes('taxi')) {
        return 'bg-blue-50 text-blue-700 border-blue-200';
    }
    if (normalized.includes('boarding') || normalized.includes('housing') || normalized.includes('kennel') || normalized.includes('day care')) {
        return 'bg-orange-50 text-orange-700 border-orange-200';
    }
    if (normalized.includes('admin') || normalized.includes('doc') || normalized.includes('permit') || normalized.includes('clearance')) {
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
    if (normalized.includes('crate') || normalized.includes('box')) {
        return 'bg-amber-50 text-amber-700 border-amber-200';
    }
    return 'bg-purple-50 text-purple-700 border-purple-200';
}

export function calculateMargin(cost: number, price: number): number {
    if (price === 0) return 0;
    return ((price - cost) / price) * 100;
}

export function getMarginColor(margin: number): string {
    if (margin >= 30) return 'bg-green-100 text-green-800 border-green-200';
    if (margin >= 15) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-red-100 text-red-800 border-red-200';
}
