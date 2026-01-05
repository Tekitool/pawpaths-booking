'use client';

import React from 'react';
import { CheckSquare, Circle, CheckCircle2 } from 'lucide-react';

export default function TaskChecklist({ booking }) {
    // Placeholder tasks for now
    const tasks = [
        { id: 1, label: 'Initial Consultation', completed: true },
        { id: 2, label: 'Quotation Sent', completed: true },
        { id: 3, label: 'Booking Confirmed', completed: booking.status === 'confirmed' },
        { id: 4, label: 'Veterinary Records Received', completed: false },
        { id: 5, label: 'Import Permit Applied', completed: false },
        { id: 6, label: 'Flight Booking Secured', completed: false },
        { id: 7, label: 'Crate Verification', completed: false },
    ];

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-brand-text-02/20 p-6">
            <h3 className="text-gray-900 mb-4 flex items-center gap-2">
                <CheckSquare size={20} className="text-purple-500" />
                Task Checklist
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {tasks.map((task) => (
                    <div
                        key={task.id}
                        className={`
                            flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer
                            ${task.completed
                                ? 'bg-success/15 border-system-color-02 text-system-color-02'
                                : 'bg-white border-brand-text-02/20 text-brand-text-02 hover:border-brand-text-03/30 hover:bg-brand-text-03/10/30'
                            }
                        `}
                    >
                        {task.completed ? (
                            <CheckCircle2 size={20} className="text-success flex-shrink-0" />
                        ) : (
                            <Circle size={20} className="text-brand-text-02/60 flex-shrink-0" />
                        )}
                        <span className={`text-sm font-medium ${task.completed ? 'line-through opacity-70' : ''}`}>
                            {task.label}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
