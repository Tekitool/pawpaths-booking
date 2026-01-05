'use client';

import React, { useEffect, useState } from 'react';
import { CheckSquare, Calendar, Clock, AlertCircle, CheckCircle } from 'lucide-react';
import { getAllTasks } from '@/lib/actions/admin-task-actions';
import { updateTaskStatus } from '@/lib/actions/task-automation-actions';
import Link from 'next/link';

export default function TasksPage() {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [error, setError] = useState(null);

    const fetchTasks = async () => {
        setLoading(true);
        setError(null);
        try {
            const { tasks, error } = await getAllTasks();
            if (error) {
                setError(error);
                setTasks([]);
            } else {
                setTasks(tasks);
            }
        } catch (error) {
            console.error('Failed to load tasks', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTasks();
    }, []);

    const handleStatusChange = async (taskId, newStatus) => {
        setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
        try {
            await updateTaskStatus(taskId, newStatus);
        } catch (error) {
            console.error('Failed to update status', error);
            fetchTasks();
        }
    };

    const filteredTasks = tasks.filter(t => {
        if (filter === 'all') return true;
        if (filter === 'pending') return t.status === 'pending' || t.status === 'in_progress';
        if (filter === 'completed') return t.status === 'completed';
        return true;
    });

    const getPriorityColor = (p) => {
        switch (p) {
            case 'high': return 'text-error bg-error/10 border-system-color-01';
            case 'medium': return 'text-accent bg-accent/15 border-accent/15';
            case 'low': return 'text-success bg-success/15 border-system-color-02';
            default: return 'text-brand-text-02 bg-brand-text-02/5 border-brand-text-02/20';
        }
    };

    return (
        <div className="min-h-screen bg-brand-text-02/5/50 p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8 flex items-center justify-between">
                    <h1 className="text-gray-900 flex items-center gap-3">
                        <CheckSquare className="text-info" /> Task Management
                    </h1>

                    <div className="flex bg-white rounded-lg p-1 border border-brand-text-02/20 shadow-sm">
                        <button
                            onClick={() => setFilter('all')}
                            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${filter === 'all' ? 'bg-brand-text-02/10 text-gray-900' : 'text-brand-text-02/80 hover:text-brand-text-02'}`}
                        >
                            All
                        </button>
                        <button
                            onClick={() => setFilter('pending')}
                            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${filter === 'pending' ? 'bg-info/10 text-info' : 'text-brand-text-02/80 hover:text-brand-text-02'}`}
                        >
                            Pending
                        </button>
                        <button
                            onClick={() => setFilter('completed')}
                            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${filter === 'completed' ? 'bg-success/15 text-success' : 'text-brand-text-02/80 hover:text-brand-text-02'}`}
                        >
                            Completed
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="bg-white rounded-2xl shadow-sm border border-brand-text-02/20 overflow-hidden">
                    {loading ? (
                        <div className="p-12 text-center text-brand-text-02/60">Loading tasks...</div>
                    ) : error ? (
                        <div className="p-12 text-center">
                            <div className="w-16 h-16 bg-error/10 rounded-full flex items-center justify-center mx-auto mb-4 text-system-color-01">
                                <AlertCircle size={24} />
                            </div>
                            <p className="text-system-color-01 font-bold mb-2">Failed to load tasks</p>
                            <p className="text-brand-text-02/80 text-sm mb-4">{error}</p>
                            <button
                                onClick={fetchTasks}
                                className="px-4 py-2 bg-white border border-brand-text-02/20 rounded-lg text-brand-text-02 hover:bg-brand-text-02/5 font-medium text-sm"
                            >
                                Try Again
                            </button>
                        </div>
                    ) : filteredTasks.length === 0 ? (
                        <div className="p-12 text-center">
                            <div className="w-16 h-16 bg-brand-text-02/5 rounded-full flex items-center justify-center mx-auto mb-4 text-brand-text-02/60">
                                <CheckSquare size={24} />
                            </div>
                            <p className="text-brand-text-02/80 font-medium">No tasks found.</p>
                            <p className="text-brand-text-02/60 text-sm mt-1">Tasks will be generated when bookings are confirmed.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {filteredTasks.map(task => (
                                <div key={task.id} className="p-4 hover:bg-brand-text-02/5 transition-colors flex items-start gap-4 group">
                                    <button
                                        onClick={() => handleStatusChange(task.id, task.status === 'completed' ? 'pending' : 'completed')}
                                        className={`mt-1 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${task.status === 'completed'
                                            ? 'bg-success/150 border-system-color-02 text-white'
                                            : 'border-brand-text-02/20 text-transparent hover:border-system-color-03'
                                            }`}
                                    >
                                        <CheckCircle size={14} />
                                    </button>

                                    <div className="flex-1">
                                        <div className="flex justify-between items-start mb-1">
                                            <h3 className={`text-gray-900 ${task.status === 'completed' ? 'line-through text-brand-text-02/60' : ''}`}>
                                                {task.title}
                                            </h3>
                                            <span className={`px-2 py-0.5 text-xs rounded border font-bold uppercase ${getPriorityColor(task.priority)}`}>
                                                {task.priority}
                                            </span>
                                        </div>
                                        <p className="text-sm text-brand-text-02/80 mb-2">{task.description}</p>

                                        <div className="flex items-center gap-4 text-xs text-brand-text-02/60">
                                            <Link href={`/admin/relocations/${task.bookingReference}`} className="flex items-center gap-1 hover:text-info transition-colors">
                                                <span className="font-mono bg-brand-text-02/10 px-1.5 py-0.5 rounded text-brand-text-02 group-hover:bg-white group-hover:shadow-sm transition-all">
                                                    {task.bookingReference}
                                                </span>
                                                <span>{task.customerName}</span>
                                            </Link>
                                            <div className="flex items-center gap-1">
                                                <Calendar size={12} />
                                                <span className={new Date(task.due_date) < new Date() && task.status !== 'completed' ? 'text-system-color-01 font-bold' : ''}>
                                                    {new Date(task.due_date).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
