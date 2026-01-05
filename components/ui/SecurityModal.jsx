'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, ShieldCheck, Lock } from 'lucide-react';

export default function SecurityModal({
    isOpen,
    onClose,
    onConfirm,
    title = "Security Check",
    actionType = 'warning', // 'warning' | 'danger'
    isLoading = false,
    zIndex = "z-[60]"
}) {
    const [reason, setReason] = useState('');

    if (!isOpen) return null;

    const handleSubmit = () => {
        if (reason.trim().length > 0) {
            onConfirm(reason);
        }
    };

    const isDanger = actionType === 'danger';

    return (
        <AnimatePresence>
            {isOpen && (
                <div className={`fixed inset-0 ${zIndex} flex items-center justify-center p-4`}>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={!isLoading ? onClose : undefined}
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ duration: 0.3, type: "spring", bounce: 0.3 }}
                        className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden z-10 border border-brand-text-02/20"
                    >
                        {/* Header */}
                        <div className={`p-4 flex items-center gap-4 border-b ${isDanger ? 'bg-system-color-01/10 border-system-color-01/20' : 'bg-warning/10 border-warning/20'}`}>
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-sm ${isDanger ? 'bg-system-color-01/10 text-system-color-01' : 'bg-warning/10 text-warning'}`}>
                                <ShieldAlert size={20} />
                            </div>
                            <div>
                                <h3 className={`text-sm font-bold ${isDanger ? 'text-system-color-01' : 'text-warning'}`}>
                                    {title}
                                </h3>
                            </div>
                        </div>

                        {/* Body */}
                        <div className="p-4 space-y-3">
                            <div className="bg-brand-text-02/5 p-3 rounded-lg border border-brand-text-02/20 flex gap-3">
                                <Lock size={16} className="text-brand-text-02/60 shrink-0 mt-0.5" />
                                <p className="text-xs text-brand-text-02 leading-relaxed font-medium">
                                    You must provide a valid reason to proceed.
                                </p>
                            </div>

                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <label className="block text-xs font-bold text-brand-text-02">
                                        Reason for this action <span className="text-system-color-01">*</span>
                                    </label>
                                    <span className="text-[10px] text-brand-text-02/60">{reason.length}/50</span>
                                </div>
                                <input
                                    type="text"
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    placeholder="Please provide a reason..."
                                    maxLength={50}
                                    className="w-full px-3 py-2 rounded-lg border border-brand-text-02/20 focus:ring-2 focus:ring-slate-400 focus:border-transparent outline-none text-sm text-brand-text-02 placeholder:text-brand-text-02/60 transition-all"
                                    autoFocus
                                />
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-4 bg-brand-text-02/5 border-t border-brand-text-02/20 flex gap-3 justify-end">
                            <button
                                onClick={onClose}
                                disabled={isLoading}
                                className="px-4 py-2 text-brand-text-02 font-medium hover:bg-brand-text-02/20 rounded-lg transition-colors text-xs"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={isLoading || reason.trim().length === 0}
                                className={`px-4 py-2 rounded-lg font-bold text-white shadow-lg transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-xs ${isDanger
                                    ? 'bg-system-color-01 hover:bg-system-color-01/90 shadow-system-color-01/20'
                                    : 'bg-slate-800 hover:bg-slate-900 shadow-slate-500/20'
                                    }`}
                            >
                                {isLoading ? (
                                    <>
                                        <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <ShieldCheck size={14} />
                                        Confirm Delete
                                    </>
                                )}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
