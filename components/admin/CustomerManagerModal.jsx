'use client';

import React, { useState, useEffect } from 'react';
import { X, Save, Loader2 } from 'lucide-react';
import { updateCustomer } from '@/lib/actions/customer-mutations';
import { toast } from 'sonner';
import SecurityModal from '@/components/ui/SecurityModal';

export default function CustomerManagerModal({ isOpen, onClose, customer }) {
    const [isLoading, setIsLoading] = useState(false);
    const [showSecurityCheck, setShowSecurityCheck] = useState(false);
    const [formData, setFormData] = useState({
        display_name: '',
        email: '',
        phone: '',
        whatsapp: '',
        type: 'individual'
    });

    useEffect(() => {
        if (customer) {
            setFormData({
                display_name: customer.display_name || '',
                email: customer.contact_info?.email || '',
                phone: customer.contact_info?.phone || '',
                whatsapp: customer.contact_info?.whatsapp || '',
                type: customer.type || 'individual'
            });
        }
    }, [customer]);

    if (!isOpen) return null;

    const handleInitialSubmit = (e) => {
        e.preventDefault();
        setShowSecurityCheck(true);
    };

    const executeUpdate = async (reason) => {
        setIsLoading(true);

        try {
            const data = new FormData();
            data.append('display_name', formData.display_name);
            data.append('email', formData.email);
            data.append('phone', formData.phone);
            data.append('whatsapp', formData.whatsapp);
            data.append('type', formData.type);
            data.append('audit_reason', reason);

            const result = await updateCustomer(customer.id, data);

            if (result.success) {
                toast.success(result.message);
                setShowSecurityCheck(false);
                onClose();
            } else {
                toast.error(result.message);
                setShowSecurityCheck(false); // Close security modal to allow retry or cancel
            }
        } catch (error) {
            console.error('Failed to update customer:', error);
            toast.error('An unexpected error occurred.');
            setShowSecurityCheck(false);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200 border border-white/50">
                    <div className="flex justify-between items-center p-6 border-b border-brand-text-02/20">
                        <h3 className="text-gray-900">Edit Customer Profile</h3>
                        <button onClick={onClose} className="text-brand-text-02/60 hover:text-brand-text-02 transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    <form onSubmit={handleInitialSubmit} className="p-6 space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-brand-text-02 mb-1">Full Name</label>
                            <input
                                type="text"
                                value={formData.display_name}
                                onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                                className="w-full px-4 py-2 rounded-lg border border-brand-text-02/20 focus:ring-2 focus:ring-accent focus:border-transparent outline-none transition-all bg-white/50"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-brand-text-02 mb-1">Email Address</label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full px-4 py-2 rounded-lg border border-brand-text-02/20 focus:ring-2 focus:ring-accent focus:border-transparent outline-none transition-all bg-white/50"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-brand-text-02 mb-1">Phone</label>
                                <input
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="w-full px-4 py-2 rounded-lg border border-brand-text-02/20 focus:ring-2 focus:ring-accent focus:border-transparent outline-none transition-all bg-white/50"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-brand-text-02 mb-1">WhatsApp</label>
                                <input
                                    type="tel"
                                    value={formData.whatsapp}
                                    onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                                    className="w-full px-4 py-2 rounded-lg border border-brand-text-02/20 focus:ring-2 focus:ring-accent focus:border-transparent outline-none transition-all bg-white/50"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-brand-text-02 mb-1">Customer Type</label>
                            <select
                                value={formData.type}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                className="w-full px-4 py-2 rounded-lg border border-brand-text-02/20 focus:ring-2 focus:ring-accent focus:border-transparent outline-none transition-all bg-white/50"
                            >
                                <option value="individual">Individual</option>
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
                                className="flex-1 px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-medium hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg shadow-accent/30 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                                Save Changes
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <SecurityModal
                isOpen={showSecurityCheck}
                onClose={() => setShowSecurityCheck(false)}
                onConfirm={executeUpdate}
                title="Confirm Changes"
                actionType="warning"
                isLoading={isLoading}
            />
        </>
    );
}
