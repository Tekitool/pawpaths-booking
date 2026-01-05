'use client';

import React, { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, CheckSquare, Calendar, Tag } from 'lucide-react';
import { getTaskTemplates, deleteTaskTemplate } from '@/lib/actions/task-template-actions';
import TaskTemplateModal from './TaskTemplateModal';

import SecurityModal from '@/components/ui/SecurityModal';
import { toast } from 'sonner';

export default function TaskTemplateManager() {
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState(null);

    // Security Modal State
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const fetchTemplates = async () => {
        setLoading(true);
        try {
            const data = await getTaskTemplates();
            setTemplates(data);
        } catch (error) {
            console.error('Failed to load templates', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTemplates();
    }, []);

    const handleDeleteClick = (id) => {
        setDeleteTarget({ id });
    };

    const executeDelete = async () => {
        if (!deleteTarget) return;
        setIsDeleting(true);

        try {
            await deleteTaskTemplate(deleteTarget.id);
            toast.success("Template deleted successfully");
            fetchTemplates();
            setDeleteTarget(null);
        } catch (error) {
            console.error('Delete failed', error);
            toast.error("Failed to delete template");
        } finally {
            setIsDeleting(false);
        }
    };

    const handleEdit = (template) => {
        setEditingTemplate(template);
        setIsModalOpen(true);
    };

    const handleAddNew = () => {
        setEditingTemplate(null);
        setIsModalOpen(true);
    };

    const handleModalClose = (shouldRefresh) => {
        setIsModalOpen(false);
        setEditingTemplate(null);
        if (shouldRefresh) {
            fetchTemplates();
        }
    };

    return (
        <>
            <div className="bg-white rounded-3xl shadow-sm border border-brand-text-02/20 overflow-hidden flex flex-col h-full">
                <div className="p-8 border-b border-brand-text-02/20 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-info/10 text-info rounded-2xl">
                            <CheckSquare size={24} />
                        </div>
                        <div>
                            <h2 className="text-brand-text-02">Task Templates</h2>
                            <p className="text-sm text-brand-text-02/80">Manage automated task lists</p>
                        </div>
                    </div>
                    <button
                        onClick={handleAddNew}
                        className="flex items-center gap-2 px-4 py-2 bg-info text-white rounded-xl hover:bg-system-color-03 transition-colors shadow-sm font-bold text-sm"
                    >
                        <Plus size={16} /> New Template
                    </button>
                </div>

                <div className="p-8 flex-1 overflow-y-auto">
                    {loading ? (
                        <div className="text-center py-8 text-brand-text-02/60">Loading templates...</div>
                    ) : templates.length === 0 ? (
                        <div className="text-center py-12 bg-brand-text-02/5 rounded-2xl border border-dashed border-brand-text-02/20">
                            <p className="text-brand-text-02/80 font-medium">No task templates found.</p>
                            <p className="text-sm text-brand-text-02/60 mt-1">Create one to start automating your workflow.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-4">
                            {templates.map((template) => (
                                <div key={template.id} className="p-4 rounded-xl border border-brand-text-02/20 hover:border-system-color-03 hover:shadow-md transition-all bg-white group">
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="text-gray-900">{template.title}</h3>
                                                <span className={`px-2 py-0.5 text-xs rounded-full font-bold border ${template.priority === 'high' ? 'bg-error/10 text-error border-system-color-01' :
                                                    template.priority === 'low' ? 'bg-success/15 text-success border-system-color-02' :
                                                        'bg-warning/10 text-warning border-yellow-100'
                                                    }`}>
                                                    {template.priority}
                                                </span>
                                            </div>
                                            <p className="text-sm text-brand-text-02/80 mb-3">{template.description || 'No description'}</p>

                                            <div className="flex flex-wrap gap-3 text-xs text-brand-text-02/80">
                                                <div className="flex items-center gap-1 bg-brand-text-02/5 px-2 py-1 rounded border border-brand-text-02/20">
                                                    <Calendar size={12} />
                                                    <span>
                                                        {Math.abs(template.days_offset)} days {template.days_offset < 0 ? 'before' : 'after'} {template.anchor_event.replace(/_/g, ' ')}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-1 bg-brand-text-02/5 px-2 py-1 rounded border border-brand-text-02/20">
                                                    <Tag size={12} />
                                                    <span>{template.service_scope.join(', ')}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => handleEdit(template)}
                                                className="p-2 text-brand-text-02/60 hover:text-info hover:bg-info/10 rounded-lg transition-colors"
                                            >
                                                <Edit size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteClick(template.id)}
                                                className="p-2 text-brand-text-02/60 hover:text-error hover:bg-error/10 rounded-lg transition-colors"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {isModalOpen && (
                    <TaskTemplateModal
                        isOpen={isModalOpen}
                        onClose={handleModalClose}
                        template={editingTemplate}
                    />
                )}
            </div>

            <SecurityModal
                isOpen={!!deleteTarget}
                onClose={() => setDeleteTarget(null)}
                onConfirm={executeDelete}
                title="Delete Task Template"
                actionType="danger"
                isLoading={isDeleting}
            />
        </>
    );
}
