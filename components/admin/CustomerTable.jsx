'use client';

import React from 'react';
import GlassCard from '@/components/ui/GlassCard';
import { Mail, Phone, Edit, Trash2, MoreVertical } from 'lucide-react';

import { deleteCustomer } from '@/lib/actions/customer-mutations';
import { toast } from 'sonner';
import { useTransition, useState } from 'react';
import SecurityModal from '@/components/ui/SecurityModal';
import CustomerManagerModal from '@/components/admin/CustomerManagerModal';

export default function CustomerTable({ customers }) {
    const [isPending, startTransition] = useTransition();
    const [deleteId, setDeleteId] = useState(null);
    const [editCustomer, setEditCustomer] = useState(null);

    const handleDeleteClick = (customerId) => {
        setDeleteId(customerId);
    };

    const executeDelete = async (reason) => {
        if (!deleteId) return;

        startTransition(async () => {
            const result = await deleteCustomer(deleteId, reason);
            if (result.success) {
                toast.success(result.message);
                setDeleteId(null);
            } else {
                toast.error(result.message);
                setDeleteId(null);
            }
        });
    };

    return (
        <>
            <GlassCard className="overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-accent/15/80 border-b border-accent/15 text-xs uppercase tracking-wider text-orange-800 font-bold">
                                <th className="px-6 py-4">Customer Identity</th>
                                <th className="px-6 py-4">Contact Details</th>
                                <th className="px-6 py-4">Type</th>
                                <th className="px-6 py-4 text-right">Total Spend</th>
                                <th className="px-6 py-4 text-center">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {customers.map((customer) => {
                                // Calculate Total Spend
                                const totalSpend = customer.bookings?.reduce((sum, b) => sum + (Number(b.total_amount) || 0), 0) || 0;

                                return (
                                    <tr key={customer.id} className="hover:bg-accent/15/50 transition-colors group">
                                        {/* Col 1: Identity */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-accent/15 flex items-center justify-center text-accent font-bold text-sm flex-shrink-0">
                                                    {customer.display_name?.substring(0, 2).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-brand-text-02 text-sm">{customer.display_name}</div>
                                                    <div className="text-[10px] font-mono text-brand-text-02/60">{customer.code || 'N/A'}</div>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Col 2: Contact */}
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-2 text-xs text-brand-text-02">
                                                    <Mail size={12} className="text-brand-text-02/60" />
                                                    <span className="truncate max-w-[150px]" title={customer.contact_info?.email}>{customer.contact_info?.email || '-'}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-xs text-brand-text-02">
                                                    <Phone size={12} className="text-brand-text-02/60" />
                                                    <span>{customer.contact_info?.phone || customer.contact_info?.whatsapp || '-'}</span>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Col 3: Type */}
                                        <td className="px-6 py-4">
                                            <span className="text-xs font-medium text-brand-text-02 bg-brand-text-02/10 px-2 py-1 rounded capitalize">
                                                {customer.type || 'Individual'}
                                            </span>
                                        </td>

                                        {/* Col 4: Financials */}
                                        <td className="px-6 py-4 text-right">
                                            <div className="font-bold text-brand-text-02 text-sm">
                                                AED {totalSpend.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </div>
                                        </td>

                                        {/* Col 5: Status */}
                                        <td className="px-6 py-4 text-center">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${customer.is_active
                                                ? 'bg-success/15 text-system-color-02'
                                                : 'bg-brand-text-02/10 text-brand-text-02'
                                                }`}>
                                                {customer.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>

                                        {/* Col 6: Actions */}
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => setEditCustomer(customer)}
                                                    className="p-1.5 text-brand-text-02/60 hover:text-accent hover:bg-accent/15 rounded-lg transition-colors"
                                                    title="Edit"
                                                >
                                                    <Edit size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteClick(customer.id)}
                                                    disabled={isPending}
                                                    className="p-1.5 text-brand-text-02/60 hover:text-error hover:bg-error/10 rounded-lg transition-colors disabled:opacity-50"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                            {customers.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-brand-text-02/80 italic">
                                        No customers found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </GlassCard>

            <SecurityModal
                isOpen={!!deleteId}
                onClose={() => setDeleteId(null)}
                onConfirm={executeDelete}
                title="Confirm Deletion"
                actionType="danger"
                isLoading={isPending}
            />

            <CustomerManagerModal
                isOpen={!!editCustomer}
                onClose={() => setEditCustomer(null)}
                customer={editCustomer}
            />
        </>
    );
}
