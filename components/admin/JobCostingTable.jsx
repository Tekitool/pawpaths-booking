'use client';

import React, { useState } from 'react';
import { Trash2, Plus, Save, X, Edit, FileText } from 'lucide-react';
import { updateLineItem, removeLineItem } from '@/lib/actions/admin-booking-actions';
import { toast } from '@/hooks/use-toast';

import SecurityModal from '@/components/ui/SecurityModal';

import Link from 'next/link';

export default function JobCostingTable({ items = [], relocationId }) {
    const [editingId, setEditingId] = useState(null);
    const [editValues, setEditValues] = useState({});
    const [isUpdating, setIsUpdating] = useState(false);

    // Security Modal State
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleEdit = (item) => {
        setEditingId(item.id);
        setEditValues({ quantity: item.quantity, unitPrice: item.unitPrice });
    };

    const handleCancel = () => {
        setEditingId(null);
        setEditValues({});
    };

    const handleSave = async (id) => {
        setIsUpdating(true);
        try {
            const result = await updateLineItem(id, {
                quantity: parseInt(editValues.quantity),
                unit_price: parseFloat(editValues.unitPrice)
            });

            if (result.success) {
                toast({ title: "Updated", description: "Line item updated successfully." });
                setEditingId(null);
            } else {
                toast({ variant: "destructive", title: "Error", description: result.error });
            }
        } catch (error) {
            console.error(error);
            toast({ variant: "destructive", title: "Error", description: "Failed to update item." });
        } finally {
            setIsUpdating(false);
        }
    };

    const handleRemoveClick = (id) => {
        setDeleteTarget({ id });
    };

    const executeDelete = async () => {
        if (!deleteTarget) return;
        setIsDeleting(true);
        setIsUpdating(true);

        try {
            const result = await removeLineItem(deleteTarget.id);
            if (result.success) {
                toast({ title: "Removed", description: "Line item removed successfully." });
                setDeleteTarget(null);
            } else {
                toast({ variant: "destructive", title: "Error", description: result.error });
            }
        } catch (error) {
            console.error(error);
            toast({ variant: "destructive", title: "Error", description: "Failed to remove item." });
        } finally {
            setIsUpdating(false);
            setIsDeleting(false);
        }
    };

    const grandTotal = items.reduce((sum, item) => sum + (item.total || 0), 0);

    return (
        <>
            <div className="bg-white/60 backdrop-blur-xl rounded-3xl shadow-sm border-[0.5px] border-brand-text-02/20 overflow-hidden">
                <div className="p-6 bg-brand-color-02 border-b border-brand-text-02/10 flex justify-between items-center">
                    <h3 className="text-base font-bold text-brand-color-01">Requested Services Breakdown</h3>
                    <Link
                        href={`/admin/quotes/create?relocationId=${relocationId}`}
                        className="flex items-center gap-2 px-3 py-1.5 bg-brand-color-03 text-white rounded-lg text-sm font-bold hover:bg-brand-color-03/90 transition-colors"
                    >
                        <FileText size={16} /> Prepare Quotation
                    </Link>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-brand-text-02/5 text-brand-text-02/80 font-bold uppercase text-xs border-b border-brand-text-02/10">
                            <tr>
                                <th className="px-6 py-4">Service</th>
                                <th className="px-6 py-4 text-right">Unit Price</th>
                                <th className="px-6 py-4 text-center">Qty</th>
                                <th className="px-6 py-4 text-right">Total</th>
                                <th className="px-6 py-4 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-brand-text-02/10">
                            {items.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-8 text-center text-brand-text-02/60 italic">
                                        No line items added yet.
                                    </td>
                                </tr>
                            ) : (
                                items.map((item) => (
                                    <tr key={item.id} className="hover:bg-brand-text-02/5 transition-colors">
                                        <td className="px-6 py-4 font-medium text-brand-text-02">
                                            {item.name}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {editingId === item.id ? (
                                                <input
                                                    type="number"
                                                    className="w-24 px-2 py-1 border border-brand-text-02/20 rounded text-right bg-white/50 focus:ring-2 focus:ring-brand-color-01/20 outline-none"
                                                    value={editValues.unitPrice}
                                                    onChange={(e) => setEditValues({ ...editValues, unitPrice: e.target.value })}
                                                />
                                            ) : (
                                                `AED ${item.unitPrice?.toLocaleString()}`
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {editingId === item.id ? (
                                                <input
                                                    type="number"
                                                    className="w-16 px-2 py-1 border border-brand-text-02/20 rounded text-center bg-white/50 focus:ring-2 focus:ring-brand-color-01/20 outline-none"
                                                    value={editValues.quantity}
                                                    onChange={(e) => setEditValues({ ...editValues, quantity: e.target.value })}
                                                />
                                            ) : (
                                                item.quantity
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right font-bold text-brand-text-02">
                                            AED {(editingId === item.id
                                                ? (parseFloat(editValues.unitPrice || 0) * parseInt(editValues.quantity || 0))
                                                : item.total
                                            ).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {editingId === item.id ? (
                                                <div className="flex justify-center gap-2">
                                                    <button onClick={() => handleSave(item.id)} disabled={isUpdating} className="p-1 text-success hover:bg-success/15 rounded">
                                                        <Save size={16} />
                                                    </button>
                                                    <button onClick={handleCancel} disabled={isUpdating} className="p-1 text-brand-text-02/60 hover:bg-brand-text-02/10 rounded">
                                                        <X size={16} />
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="flex justify-center gap-2">
                                                    <button onClick={() => handleEdit(item)} className="p-1 text-brand-color-03 hover:bg-brand-color-03/10 rounded">
                                                        <Edit size={16} />
                                                    </button>
                                                    <button onClick={() => handleRemoveClick(item.id)} disabled={isUpdating} className="p-1 text-system-color-01 hover:bg-error/10 rounded">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                        <tfoot className="bg-brand-color-02 font-bold text-brand-color-01 border-t border-brand-text-02/10">
                            <tr>
                                <td colSpan="3" className="px-6 py-4 text-right uppercase text-xs tracking-wide text-brand-color-01/80">Grand Total</td>
                                <td className="px-6 py-4 text-right text-2xl text-brand-color-01">
                                    AED {grandTotal.toLocaleString()}
                                </td>
                                <td></td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>

            <SecurityModal
                isOpen={!!deleteTarget}
                onClose={() => setDeleteTarget(null)}
                onConfirm={executeDelete}
                title="Remove Line Item"
                actionType="danger"
                isLoading={isDeleting}
            />
        </>
    );
}
