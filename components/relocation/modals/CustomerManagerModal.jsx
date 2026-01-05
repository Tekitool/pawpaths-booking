'use client';

import React, { useState } from 'react';
import { X, Save, Loader2 } from 'lucide-react';
import { updateCustomerDetails } from '@/lib/actions/manage-relocation';
import { toast } from 'sonner';

export default function CustomerManagerModal({ isOpen, onClose, customer }) {
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        display_name: customer?.display_name || '',
        email: customer?.contact_info?.email || '',
        phone: customer?.contact_info?.phone || '',
        whatsapp: customer?.contact_info?.whatsapp || '',
        type: customer?.type || 'private'
    });

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            // Construct the update payload
            // Note: This depends on your exact DB schema for 'entities'
            // Assuming contact_info is a JSONB column
            const updatePayload = {
                display_name: formData.display_name,
                type: formData.type,
                contact_info: {
                    ...customer.contact_info, // Preserve other fields
                    email: formData.email,
                    phone: formData.phone,
                    whatsapp: formData.whatsapp
                }
            };

            await updateCustomerDetails(customer.id, updatePayload);
            onClose();
        } catch (error) {
            console.error('Failed to update customer:', error);
            toast.error('Failed to update customer details.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="flex justify-between items-center p-6 border-b border-brand-text-02/20">
                    <h3 className="text-gray-900">Edit Customer Profile</h3>
                    <button onClick={onClose} className="text-brand-text-02/60 hover:text-brand-text-02 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-brand-text-02 mb-1">Full Name</label>
                        <input
                            type="text"
                            value={formData.display_name}
                            onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                            className="w-full px-4 py-2 rounded-lg border border-brand-text-02/20 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-brand-text-02 mb-1">Email Address</label>
                        <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full px-4 py-2 rounded-lg border border-brand-text-02/20 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-brand-text-02 mb-1">Phone</label>
                            <input
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                className="w-full px-4 py-2 rounded-lg border border-brand-text-02/20 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-brand-text-02 mb-1">WhatsApp</label>
                            <input
                                type="tel"
                                value={formData.whatsapp}
                                onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                                className="w-full px-4 py-2 rounded-lg border border-brand-text-02/20 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-brand-text-02 mb-1">Customer Type</label>
                        <select
                            value={formData.type}
                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                            className="w-full px-4 py-2 rounded-lg border border-brand-text-02/20 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                        >
                            <option value="private">Private</option>
                            <option value="corporate">Corporate</option>
                            <option value="agent">Agent</option>
                        </select>
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 bg-brand-text-02/5 text-brand-text-02 rounded-xl font-medium hover:bg-brand-text-02/10 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="flex-1 px-4 py-2 bg-info text-white rounded-xl font-medium hover:bg-system-color-03 transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
