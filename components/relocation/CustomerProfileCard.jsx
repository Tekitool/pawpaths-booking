'use client';

import React, { useState } from 'react';
import { User, Mail, Phone, Edit2, Briefcase } from 'lucide-react';
import CustomerManagerModal from './modals/CustomerManagerModal';

export default function CustomerProfileCard({ customer }) {
    const [isModalOpen, setIsModalOpen] = useState(false);

    if (!customer) return null;

    return (
        <>
            <div className="bg-white rounded-2xl shadow-sm border border-brand-text-02/20 p-6">
                <div className="flex justify-between items-start mb-4">
                    <h3 className="text-gray-900 flex items-center gap-2">
                        <User size={20} className="text-system-color-03" />
                        Customer Profile
                    </h3>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="p-2 hover:bg-brand-text-02/10 rounded-full text-brand-text-02/60 hover:text-info transition-colors"
                    >
                        <Edit2 size={16} />
                    </button>
                </div>

                <div className="space-y-4">
                    <div>
                        <p className="text-sm text-brand-text-02/80 mb-1">Full Name</p>
                        <p className="font-semibold text-gray-900">{customer.display_name}</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-info/10 text-info rounded-lg">
                            <Mail size={16} />
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-xs text-brand-text-02/80">Email Address</p>
                            <p className="text-sm font-medium text-gray-900 truncate" title={customer.contact_info?.email}>
                                {customer.contact_info?.email || 'N/A'}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-success/15 text-success rounded-lg">
                            <Phone size={16} />
                        </div>
                        <div>
                            <p className="text-xs text-brand-text-02/80">WhatsApp / Phone</p>
                            <p className="text-sm font-medium text-gray-900">
                                {customer.contact_info?.whatsapp || customer.contact_info?.phone || 'N/A'}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-brand-text-03/10 text-brand-text-03 rounded-lg">
                            <Briefcase size={16} />
                        </div>
                        <div>
                            <p className="text-xs text-brand-text-02/80">Type</p>
                            <p className="text-sm font-medium text-gray-900 capitalize">
                                {customer.type || 'Private'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <CustomerManagerModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                customer={customer}
            />
        </>
    );
}
