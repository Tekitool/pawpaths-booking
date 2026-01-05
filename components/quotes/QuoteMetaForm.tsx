'use client';

import React from 'react';
import { Calendar, Search, Settings } from 'lucide-react';

export default function QuoteMetaForm({ initialData }) {
    return (
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Customer */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-red-500">Customer Name*</label>
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Select or add a customer"
                            defaultValue={initialData?.name || ''}
                            className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-color-03/20 focus:border-brand-color-03 outline-none transition-all text-sm"
                        />
                        <button className="absolute right-0 top-0 h-full w-10 bg-brand-color-03 text-white rounded-r-lg flex items-center justify-center hover:bg-brand-color-03/90">
                            <Search size={16} />
                        </button>
                    </div>
                </div>

                {/* Quote # */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-red-500">Quote#*</label>
                    <div className="relative">
                        <input
                            type="text"
                            value="EST400"
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
                        defaultValue={initialData?.reference || ''}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-color-03/20 focus:border-brand-color-03 outline-none text-sm"
                    />
                </div>

                {/* Dates */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-red-500">Quote Date*</label>
                    <input
                        type="date"
                        defaultValue={new Date().toISOString().split('T')[0]}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-color-03/20 focus:border-brand-color-03 outline-none text-sm"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Expiry Date</label>
                    <input
                        type="date"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-color-03/20 focus:border-brand-color-03 outline-none text-sm"
                    />
                </div>

                {/* Salesperson */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Salesperson</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-color-03/20 focus:border-brand-color-03 outline-none text-sm bg-white">
                        <option>Select or Add Salesperson</option>
                        <option>John Doe</option>
                        <option>Jane Smith</option>
                    </select>
                </div>

                {/* Project Name */}
                <div className="space-y-2 md:col-span-1">
                    <label className="text-sm font-medium text-gray-700">Project Name</label>
                    <div>
                        <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-color-03/20 focus:border-brand-color-03 outline-none text-sm bg-white mb-1">
                            <option>Select a project</option>
                        </select>
                        <p className="text-xs text-gray-400">Select a customer to associate a project.</p>
                    </div>
                </div>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-100 grid grid-cols-[140px_1fr] items-center gap-4">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                    Subject <span className="text-gray-400 text-xs">ⓘ</span>
                </label>
                <textarea
                    placeholder="Let your customer know what this Quote is for"
                    defaultValue={initialData?.subject || ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-color-03/20 focus:border-brand-color-03 outline-none text-sm resize-none h-10"
                ></textarea>
            </div>
        </div>
    );
}
