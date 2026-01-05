'use client';

import React, { useState } from 'react';
import { Edit2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function ServiceRow({ service, onEdit, onDelete, onUpdate }) {
    // Safely extract values with fallbacks
    const safeService = service || {};
    const id = safeService.id || safeService._id;
    const name = safeService.name || 'Unnamed Service';
    const description = safeService.short_description || safeService.shortDescription || 'No description';
    const baseCost = Number(safeService.base_cost || safeService.baseCost || 0);
    const basePrice = Number(safeService.base_price || safeService.basePrice || 0);

    // State initialization
    const initialMandatory = safeService.is_mandatory || safeService.isMandatory || false;
    const initialActive = safeService.is_active !== undefined ? safeService.is_active : (safeService.status === 'active');

    const [isMandatory, setIsMandatory] = useState(initialMandatory);
    const [isActive, setIsActive] = useState(initialActive);

    if (!service) return null;

    const handleToggle = async (field, currentValue, setFn) => {
        const newValue = !currentValue;

        // 1. Optimistic Update
        setFn(newValue);

        try {
            // 2. API Call
            const response = await fetch(`/api/services/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ [field]: newValue })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: 'Unknown server error' }));
                throw new Error(errorData.message || 'Update failed');
            }

            // 3. Success Feedback
            toast.success('Saved', { duration: 1500 });

            // 4. Notify Parent
            if (onUpdate) {
                onUpdate({ ...service, [field === 'isMandatory' ? 'is_mandatory' : 'is_active']: newValue });
            }
        } catch (error) {
            // 4. Rollback
            setFn(currentValue);
            console.error(error);
            toast.error('Update Failed', { description: error.message });
        }
    };

    return (
        <tr className="hover:bg-brand-text-02/5 transition-colors">
            <td className="py-3 px-4">
                <button
                    onClick={() => onEdit(service)}
                    className="font-bold text-gray-900 text-sm hover:text-brand-color-01 hover:underline text-left block w-full"
                >
                    {name}
                </button>
                <div className="text-[10px] text-brand-text-02/60 mt-0.5 truncate max-w-xs font-medium">
                    {description}
                </div>
            </td>
            <td className="py-3 px-4">
                <div className="font-medium text-brand-text-02 bg-brand-text-02/5 px-2 py-0.5 rounded-md inline-block border border-brand-text-02/20 text-xs">
                    AED {baseCost.toLocaleString()}
                </div>
            </td>
            <td className="py-3 px-4">
                <div className="font-bold text-brand-color-01 bg-accent/15 px-2 py-0.5 rounded-md inline-block border border-accent/15 text-xs">
                    AED {basePrice.toLocaleString()}
                </div>
            </td>
            <td className="py-3 px-4 text-center">
                <button
                    onClick={() => handleToggle('isMandatory', isMandatory, setIsMandatory)}
                    className={`
                        relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none
                        ${isMandatory ? 'bg-system-color-01' : 'bg-brand-text-02/20'}
                    `}
                >
                    <span
                        className={`
                            pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out
                            ${isMandatory ? 'translate-x-4' : 'translate-x-0'}
                        `}
                    />
                </button>
            </td>
            <td className="py-3 px-4 text-center">
                <button
                    onClick={() => handleToggle('isActive', isActive, setIsActive)}
                    className={`
                        relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none
                        ${isActive ? 'bg-system-color-02' : 'bg-brand-text-02/20'}
                    `}
                >
                    <span
                        className={`
                            pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out
                            ${isActive ? 'translate-x-4' : 'translate-x-0'}
                        `}
                    />
                </button>
            </td>
            <td className="py-3 px-4 text-right space-x-1">
                <button onClick={() => onEdit(service)} className="p-1.5 hover:bg-accent/15 rounded-lg text-brand-text-02/60 hover:text-accent transition-all">
                    <Edit2 size={16} />
                </button>
                <button onClick={() => onDelete(id)} className="p-1.5 hover:bg-error/10 rounded-lg text-brand-text-02/60 hover:text-system-color-01 transition-all">
                    <Trash2 size={16} />
                </button>
            </td>
        </tr>
    );
}
