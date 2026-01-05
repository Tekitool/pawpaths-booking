'use client';

import React from 'react';
import { ClipboardList } from 'lucide-react';
import TaskTemplateManager from '@/components/admin/settings/TaskTemplateManager';

export default function TaskTemplatesPage() {
    return (
        <div className="space-y-8 relative">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-brand-text-02">Task Templates</h1>
                    <p className="text-brand-text-02/80 mt-1">Manage task templates and automation rules</p>
                </div>
            </div>

            <section className="bg-white backdrop-blur-xl rounded-3xl shadow-sm border border-brand-text-02/20 overflow-hidden relative">
                <div className="absolute top-0 right-0 p-6 opacity-5">
                    <ClipboardList size={100} />
                </div>
                <div className="p-8 border-b border-brand-text-02/20 flex items-center gap-4">
                    <div className="p-3 bg-info/10 rounded-2xl text-info shadow-sm">
                        <ClipboardList size={24} />
                    </div>
                    <div>
                        <h2 className="text-brand-text-02">Task Automation</h2>
                        <p className="text-sm text-brand-text-02/80">Manage task templates and automation rules</p>
                    </div>
                </div>
                <div className="p-8 relative z-10">
                    <TaskTemplateManager />
                </div>
            </section>
        </div>
    );
}
