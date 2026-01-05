'use client';

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { createTaskTemplate, updateTaskTemplate } from '@/lib/actions/task-template-actions';
import { toast } from 'sonner';

const ANCHOR_EVENTS = [
    { value: 'booking_confirmed', label: 'Booking Confirmed' },
    { value: 'scheduled_departure', label: 'Scheduled Departure' },
    { value: 'scheduled_arrival', label: 'Scheduled Arrival' },
];

const SERVICE_SCOPES = ['export', 'import', 'local', 'domestic', 'transit'];

export default function TaskTemplateModal({ isOpen, onClose, template }) {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        priority: 'medium',
        service_scope: ['export', 'import'],
        anchor_event: 'scheduled_departure',
        days_offset: 0,
        is_active: true
    });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (template) {
            setFormData({
                title: template.title,
                description: template.description || '',
                priority: template.priority,
                service_scope: template.service_scope || [],
                anchor_event: template.anchor_event,
                days_offset: template.days_offset,
                is_active: template.is_active
            });
        }
    }, [template]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleScopeChange = (scope) => {
        setFormData(prev => {
            const newScope = prev.service_scope.includes(scope)
                ? prev.service_scope.filter(s => s !== scope)
                : [...prev.service_scope, scope];
            return { ...prev, service_scope: newScope };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (template) {
                await updateTaskTemplate(template.id, formData);
            } else {
                await createTaskTemplate(formData);
            }
            onClose(true);
        } catch (error) {
            console.error('Failed to save template', error);
            toast.error('Failed to save template');
        } finally {
            setSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg border border-brand-text-02/20 flex flex-col max-h-[90vh]">
                <div className="p-6 border-b border-brand-text-02/20 flex justify-between items-center">
                    <h3 className="text-gray-900">
                        {template ? 'Edit Task Template' : 'New Task Template'}
                    </h3>
                    <button onClick={() => onClose(false)} className="p-2 hover:bg-brand-text-02/10 rounded-full text-brand-text-02/80">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-brand-text-02 mb-1">Task Title</label>
                        <input
                            type="text"
                            name="title"
                            required
                            value={formData.title}
                            onChange={handleChange}
                            className="w-full p-3 bg-brand-text-02/5 border border-brand-text-02/20 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-system-color-03 outline-none"
                            placeholder="e.g. Book Vet Appointment"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-brand-text-02 mb-1">Description</label>
                        <textarea
                            name="description"
                            rows={3}
                            value={formData.description}
                            onChange={handleChange}
                            className="w-full p-3 bg-brand-text-02/5 border border-brand-text-02/20 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-system-color-03 outline-none resize-none"
                            placeholder="Optional details..."
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-brand-text-02 mb-1">Priority</label>
                            <select
                                name="priority"
                                value={formData.priority}
                                onChange={handleChange}
                                className="w-full p-3 bg-brand-text-02/5 border border-brand-text-02/20 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-system-color-03 outline-none"
                            >
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-brand-text-02 mb-1">Days Offset</label>
                            <input
                                type="number"
                                name="days_offset"
                                value={formData.days_offset}
                                onChange={handleChange}
                                className="w-full p-3 bg-brand-text-02/5 border border-brand-text-02/20 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-system-color-03 outline-none"
                            />
                            <p className="text-xs text-brand-text-02/60 mt-1">Negative = Before, Positive = After</p>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-brand-text-02 mb-1">Anchor Event</label>
                        <select
                            name="anchor_event"
                            value={formData.anchor_event}
                            onChange={handleChange}
                            className="w-full p-3 bg-brand-text-02/5 border border-brand-text-02/20 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-system-color-03 outline-none"
                        >
                            {ANCHOR_EVENTS.map(ev => (
                                <option key={ev.value} value={ev.value}>{ev.label}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-brand-text-02 mb-2">Service Scope</label>
                        <div className="flex flex-wrap gap-2">
                            {SERVICE_SCOPES.map(scope => (
                                <button
                                    key={scope}
                                    type="button"
                                    onClick={() => handleScopeChange(scope)}
                                    className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${formData.service_scope.includes(scope)
                                        ? 'bg-info/10 border-info/30 text-info'
                                        : 'bg-white border-brand-text-02/20 text-brand-text-02 hover:bg-brand-text-02/5'
                                        }`}
                                >
                                    {scope.charAt(0).toUpperCase() + scope.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>
                </form>

                <div className="p-6 border-t border-brand-text-02/20 flex justify-end gap-3">
                    <button
                        onClick={() => onClose(false)}
                        className="px-5 py-2.5 rounded-xl font-bold text-brand-text-02 hover:bg-brand-text-02/10 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={saving}
                        className="px-5 py-2.5 rounded-xl font-bold text-white bg-info hover:bg-system-color-03 transition-colors shadow-lg shadow-system-color-03/20 disabled:opacity-70"
                    >
                        {saving ? 'Saving...' : 'Save Template'}
                    </button>
                </div>
            </div>
        </div>
    );
}
