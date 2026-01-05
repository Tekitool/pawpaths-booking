'use client';

import React, { useState, useEffect } from 'react';
import { Trash2, GripVertical, Plus, Calculator, MoreHorizontal, XCircle } from 'lucide-react';
import Image from 'next/image';
import BulkItemDrawer from './BulkItemDrawer';

export interface QuoteItem {
    id: string;
    title: string;
    description?: string;
    image?: string;
    isPackage?: boolean;
    quantity: number;
    rate: number;
    discount: number;
    taxType: 'standard' | 'zero' | 'exempt';
}

interface ServiceTableProps {
    items: QuoteItem[];
    setItems: React.Dispatch<React.SetStateAction<QuoteItem[]>>;
}

export default function ServiceTable({ items, setItems }: ServiceTableProps) {
    const [isBulkDrawerOpen, setIsBulkDrawerOpen] = useState(false);

    const handleUpdateItem = (id: string, field: keyof QuoteItem, value: any) => {
        setItems(prev => prev.map(item =>
            item.id === id ? { ...item, [field]: value } : item
        ));
    };

    const handleDeleteItem = (id: string) => {
        setItems(prev => prev.filter(item => item.id !== id));
    };

    const handleAddRow = () => {
        const newItem: QuoteItem = {
            id: Math.random().toString(36).substr(2, 9),
            title: '',
            description: '',
            quantity: 1,
            rate: 0,
            discount: 0,
            taxType: 'standard'
        };
        setItems(prev => [...prev, newItem]);
    };

    const handleBulkAdd = (newItems: { item: { id: string, name: string, rate: number }, quantity: number }[]) => {
        const mappedItems: QuoteItem[] = newItems.map(({ item, quantity }) => ({
            id: Math.random().toString(36).substr(2, 9),
            title: item.name,
            description: 'Imported from bulk selection', // Placeholder
            quantity: quantity,
            rate: item.rate,
            discount: 0,
            taxType: 'standard',
            isPackage: item.name.toLowerCase().includes('package')
        }));
        setItems(prev => [...prev, ...mappedItems]);
    };

    const calculateAmount = (item: QuoteItem) => {
        const base = item.quantity * item.rate;
        const discountAmount = (base * item.discount) / 100;
        return base - discountAmount;
    };

    return (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden mb-6">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                <h3 className="font-bold text-gray-800">Item Table</h3>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full min-w-[1000px]">
                    <thead>
                        <tr className="border-b border-gray-200 bg-gray-50">
                            <th className="w-10 py-3 pl-4"></th>
                            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider w-[40%]">Item Details</th>
                            <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider w-[10%]">Quantity</th>
                            <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider w-[15%]">
                                <div className="flex items-center justify-end gap-1">
                                    Rate <Calculator size={12} />
                                </div>
                            </th>
                            <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider w-[10%]">Discount</th>
                            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider w-[15%]">Tax</th>
                            <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider w-[10%]">Amount</th>
                            <th className="w-10 py-3 pr-4"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {items.map((item) => (
                            <tr key={item.id} className="group hover:bg-gray-50/50 transition-colors">
                                <td className="py-4 pl-4 text-center text-gray-300 cursor-grab active:cursor-grabbing">
                                    <GripVertical size={16} />
                                </td>
                                <td className="py-4 px-4 align-top">
                                    <div className="flex gap-4">
                                        <div className="w-12 h-12 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                                            {item.image ? (
                                                <Image src={item.image} alt="" width={48} height={48} className="object-cover" />
                                            ) : (
                                                <div className="text-gray-300">
                                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                                        <circle cx="8.5" cy="8.5" r="1.5"></circle>
                                                        <polyline points="21 15 16 10 5 21"></polyline>
                                                    </svg>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 space-y-2">
                                            {item.title ? (
                                                <div className="flex items-start justify-between">
                                                    <span className="font-bold text-gray-900 text-sm">{item.title}</span>
                                                    <div className="flex gap-1 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <MoreHorizontal size={14} className="cursor-pointer hover:text-gray-600" />
                                                        <XCircle size={14} className="cursor-pointer hover:text-red-500" onClick={() => handleDeleteItem(item.id)} />
                                                    </div>
                                                </div>
                                            ) : (
                                                <input
                                                    type="text"
                                                    placeholder="Type or click to select an item."
                                                    className="w-full bg-transparent border-none p-0 text-sm font-medium placeholder:text-gray-400 focus:ring-0"
                                                    value={item.title}
                                                    onChange={(e) => handleUpdateItem(item.id, 'title', e.target.value)}
                                                />
                                            )}

                                            <textarea
                                                className="w-full text-xs text-gray-500 bg-gray-50/50 border border-transparent hover:border-gray-200 rounded p-2 resize-none focus:bg-white focus:border-blue-300 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                                                rows={2}
                                                placeholder="Add a description to your item"
                                                value={item.description}
                                                onChange={(e) => handleUpdateItem(item.id, 'description', e.target.value)}
                                            />

                                            {item.isPackage && (
                                                <span className="inline-block px-2 py-0.5 bg-green-600 text-white text-[10px] font-bold uppercase tracking-wider rounded">
                                                    Service
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </td>
                                <td className="py-4 px-4 align-top text-right">
                                    <input
                                        type="number"
                                        min="1"
                                        className="w-16 text-right p-1 border border-transparent hover:border-gray-200 focus:border-blue-500 rounded text-sm outline-none bg-transparent"
                                        value={item.quantity}
                                        onChange={(e) => handleUpdateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                                    />
                                </td>
                                <td className="py-4 px-4 align-top text-right">
                                    <div className="space-y-1">
                                        <input
                                            type="number"
                                            className="w-24 text-right p-1 border border-transparent hover:border-gray-200 focus:border-blue-500 rounded text-sm outline-none bg-transparent font-medium"
                                            value={item.rate}
                                            onChange={(e) => handleUpdateItem(item.id, 'rate', parseFloat(e.target.value) || 0)}
                                        />
                                        <div className="text-[10px] text-blue-500 cursor-pointer hover:underline">Recent Transactions</div>
                                    </div>
                                </td>
                                <td className="py-4 px-4 align-top text-right">
                                    <div className="flex items-center justify-end gap-1">
                                        <input
                                            type="number"
                                            className="w-12 text-right p-1 border border-transparent hover:border-gray-200 focus:border-blue-500 rounded text-sm outline-none bg-transparent"
                                            value={item.discount}
                                            onChange={(e) => handleUpdateItem(item.id, 'discount', parseFloat(e.target.value) || 0)}
                                        />
                                        <span className="text-gray-400 text-xs">%</span>
                                    </div>
                                </td>
                                <td className="py-4 px-4 align-top">
                                    <div className="relative group/tax">
                                        <select
                                            className="w-full p-1 border border-transparent hover:border-gray-200 focus:border-blue-500 rounded text-sm outline-none bg-transparent appearance-none pr-6 cursor-pointer"
                                            value={item.taxType}
                                            onChange={(e) => handleUpdateItem(item.id, 'taxType', e.target.value)}
                                        >
                                            <option value="standard">Standard Rate [5%]</option>
                                            <option value="zero">Zero Rate [0%]</option>
                                            <option value="exempt">Exempt</option>
                                        </select>
                                        <div className="absolute right-1 top-2 pointer-events-none text-gray-400">
                                            <svg width="10" height="6" viewBox="0 0 10 6" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M1 1L5 5L9 1" /></svg>
                                        </div>
                                    </div>
                                </td>
                                <td className="py-4 px-4 align-top text-right font-bold text-gray-900">
                                    {calculateAmount(item).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </td>
                                <td className="py-4 pr-4 align-top text-center">
                                    <button
                                        onClick={() => handleDeleteItem(item.id)}
                                        className="text-gray-300 hover:text-red-500 transition-colors p-1"
                                    >
                                        <XCircle size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="px-6 py-4 bg-gray-50/30 border-t border-gray-100 flex gap-3">
                <div className="relative group">
                    <button
                        onClick={handleAddRow}
                        className="flex items-center gap-2 px-4 py-2 bg-brand-color-03/10 text-brand-color-03 rounded-lg text-sm font-medium hover:bg-brand-color-03/20 transition-colors border border-brand-color-03/20"
                    >
                        <Plus size={16} className="bg-brand-color-03 text-white rounded-full p-0.5" />
                        Add New Row
                    </button>
                </div>

                <button
                    onClick={() => setIsBulkDrawerOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors border border-gray-200"
                >
                    <Plus size={16} className="bg-gray-400 text-white rounded-full p-0.5" />
                    Add Items in Bulk
                </button>
            </div>

            <BulkItemDrawer
                isOpen={isBulkDrawerOpen}
                onClose={() => setIsBulkDrawerOpen(false)}
                onAddItems={handleBulkAdd}
            />
        </div>
    );
}
