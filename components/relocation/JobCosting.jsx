'use client';

import React from 'react';
import { Calculator, Plus, DollarSign } from 'lucide-react';

export default function JobCosting({ services, bookingId }) {
    const subtotal = services?.reduce((sum, service) => sum + (service.amount || 0), 0) || 0;
    const taxRate = 0.05; // Example 5% VAT
    const tax = subtotal * taxRate;
    const total = subtotal + tax;

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-brand-text-02/20 p-6 h-full flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-gray-900 flex items-center gap-2">
                    <Calculator size={20} className="text-system-color-02" />
                    Job Costing
                </h3>
                <button className="p-2 hover:bg-success/15 text-success rounded-full transition-colors">
                    <Plus size={18} />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 mb-6 pr-2 custom-scrollbar max-h-[300px]">
                {services && services.length > 0 ? (
                    services.map((service) => (
                        <div key={service.id} className="flex justify-between items-center p-3 rounded-lg hover:bg-brand-text-02/5 transition-colors group border border-transparent hover:border-brand-text-02/20">
                            <span className="text-sm font-medium text-brand-text-02">{service.description}</span>
                            <div className="flex items-center gap-3">
                                <span className="text-sm font-bold text-gray-900">
                                    {service.currency} {service.amount?.toLocaleString()}
                                </span>
                                <button className="text-brand-text-02/60 hover:text-system-color-01 opacity-0 group-hover:opacity-100 transition-opacity">
                                    &times;
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-8 text-brand-text-02/60 text-sm italic">
                        No service items added yet.
                    </div>
                )}
            </div>

            <div className="border-t border-brand-text-02/20 pt-4 space-y-2">
                <div className="flex justify-between text-sm text-brand-text-02/80">
                    <span>Subtotal</span>
                    <span>AED {subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm text-brand-text-02/80">
                    <span>VAT (5%)</span>
                    <span>AED {tax.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t border-brand-text-02/20 mt-2">
                    <span>Grand Total</span>
                    <span className="text-success">AED {total.toLocaleString()}</span>
                </div>
            </div>

            <button className="w-full mt-6 py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-colors shadow-lg shadow-gray-200 flex items-center justify-center gap-2">
                <DollarSign size={18} />
                Generate Invoice
            </button>
        </div>
    );
}
