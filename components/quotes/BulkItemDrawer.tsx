'use client';

import React, { useState } from 'react';
import { X, Search, Plus, Minus, Check } from 'lucide-react';

interface ServiceItem {
    id: string;
    name: string;
    rate: number;
    description?: string;
}

interface BulkItemDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    onAddItems: (items: { item: ServiceItem; quantity: number }[]) => void;
}

const MOCK_SERVICES: ServiceItem[] = [
    { id: '1', name: 'Airline fee AWB & Customs BOE', rate: 0 },
    { id: '2', name: 'Australia Blood Works & Treatment Package for Cats', rate: 1630 },
    { id: '3', name: 'Australia Blood Works & Treatment Package for Dogs', rate: 2650 },
    { id: '4', name: 'Boarding fee', rate: 0 },
    { id: '5', name: 'Brucella Canis Test', rate: 500 },
    { id: '6', name: 'Deworming, Tick & Flea Treatments', rate: 300 },
    { id: '7', name: 'Dnata ground handling fee & Customs BOE', rate: 1000 },
];

export default function BulkItemDrawer({ isOpen, onClose, onAddItems }: BulkItemDrawerProps) {
    const [selectedItems, setSelectedItems] = useState<Record<string, number>>({});
    const [searchQuery, setSearchQuery] = useState('');

    if (!isOpen) return null;

    const handleQuantityChange = (id: string, delta: number) => {
        setSelectedItems(prev => {
            const current = prev[id] || 0;
            const next = Math.max(0, current + delta);
            if (next === 0) {
                const { [id]: _, ...rest } = prev;
                return rest;
            }
            return { ...prev, [id]: next };
        });
    };

    const handleAdd = () => {
        const itemsToAdd = Object.entries(selectedItems).map(([id, qty]) => {
            const item = MOCK_SERVICES.find(s => s.id === id);
            return item ? { item, quantity: qty } : null;
        }).filter(Boolean) as { item: ServiceItem; quantity: number }[];

        onAddItems(itemsToAdd);
        onClose();
        setSelectedItems({});
    };

    const filteredServices = MOCK_SERVICES.filter(s =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const totalQuantity = Object.values(selectedItems).reduce((a, b) => a + b, 0);

    return (
        <div className="fixed inset-0 z-50 flex justify-end">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={onClose} />

            {/* Drawer */}
            <div className="relative w-full max-w-4xl bg-white shadow-2xl flex flex-col h-full animate-in slide-in-from-right duration-300">
                {/* Header */}
                <div className="h-16 border-b border-gray-100 flex items-center justify-between px-6">
                    <h2 className="text-lg font-semibold text-gray-800">Add Items in Bulk</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 flex overflow-hidden">
                    {/* Left: List */}
                    <div className="w-1/2 border-r border-gray-100 flex flex-col">
                        <div className="p-4 border-b border-gray-100">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                <input
                                    type="text"
                                    placeholder="Type to search or scan the barcode of the item"
                                    className="w-full pl-10 pr-4 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-sm"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto p-2 space-y-1">
                            {filteredServices.map(service => {
                                const isSelected = !!selectedItems[service.id];
                                return (
                                    <div
                                        key={service.id}
                                        className={`p-3 rounded-lg flex items-center justify-between cursor-pointer transition-all ${isSelected ? 'bg-blue-50 border border-blue-100' : 'hover:bg-gray-50 border border-transparent'}`}
                                        onClick={() => handleQuantityChange(service.id, 1)}
                                    >
                                        <div>
                                            <p className={`text-sm font-medium ${isSelected ? 'text-blue-700' : 'text-gray-700'}`}>{service.name}</p>
                                            <p className="text-xs text-gray-500 mt-0.5">Rate: AED{service.rate.toLocaleString()}</p>
                                        </div>
                                        {isSelected && <div className="bg-green-500 rounded-full p-0.5"><Check size={12} className="text-white" /></div>}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Right: Selected */}
                    <div className="w-1/2 flex flex-col bg-gray-50/30">
                        <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <span className="text-lg font-medium text-gray-800">Selected Items</span>
                                <span className="px-2 py-0.5 bg-gray-200 rounded-full text-xs font-bold text-gray-600">{Object.keys(selectedItems).length}</span>
                            </div>
                            <span className="text-sm text-gray-500">Total Quantity: {totalQuantity}</span>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-3">
                            {Object.entries(selectedItems).map(([id, qty]) => {
                                const item = MOCK_SERVICES.find(s => s.id === id);
                                if (!item) return null;
                                return (
                                    <div key={id} className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
                                        <span className="text-sm font-medium text-gray-700 flex-1 mr-4">{item.name}</span>
                                        <div className="flex items-center border border-gray-200 rounded-lg bg-white">
                                            <button
                                                className="p-1.5 hover:bg-gray-50 text-gray-500 border-r border-gray-200"
                                                onClick={() => handleQuantityChange(id, -1)}
                                            >
                                                <Minus size={14} />
                                            </button>
                                            <span className="w-10 text-center text-sm font-medium">{qty}</span>
                                            <button
                                                className="p-1.5 hover:bg-gray-50 text-gray-500 border-l border-gray-200"
                                                onClick={() => handleQuantityChange(id, 1)}
                                            >
                                                <Plus size={14} />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                            {Object.keys(selectedItems).length === 0 && (
                                <div className="h-full flex flex-col items-center justify-center text-gray-400">
                                    <p>No items selected</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-100 flex justify-start gap-3 bg-white">
                    <button
                        onClick={handleAdd}
                        disabled={totalQuantity === 0}
                        className="px-6 py-2 bg-brand-color-03 text-white rounded-lg font-medium hover:bg-brand-color-03/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        Add Items
                    </button>
                    <button
                        onClick={onClose}
                        className="px-6 py-2 border border-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}
