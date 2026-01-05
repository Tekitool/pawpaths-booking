'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';

export default function ConfirmDialog({
    isOpen,
    onClose,
    onConfirm,
    title = "Are you sure?",
    message = "This action cannot be undone.",
    confirmText = "Confirm",
    cancelText = "Cancel",
    isDestructive = false,
    isLoading = false
}) {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={!isLoading ? onClose : undefined}
                        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ duration: 0.3, type: "spring", bounce: 0.3 }}
                        className="relative w-full max-w-md bg-white/90 backdrop-blur-xl border border-white/50 shadow-2xl rounded-3xl overflow-hidden z-10"
                    >
                        <div className="p-8 text-center">
                            {/* Icon */}
                            <div className="mx-auto w-16 h-16 bg-accent/15 rounded-full flex items-center justify-center mb-6 shadow-inner">
                                <AlertTriangle size={32} className="text-accent" />
                            </div>

                            <h3 className="text-gray-900 mb-2">{title}</h3>
                            <p className="text-brand-text-02/80 mb-8 leading-relaxed">{message}</p>

                            <div className="flex gap-3">
                                <button
                                    onClick={onClose}
                                    disabled={isLoading}
                                    className="flex-1 px-4 py-3 bg-white border border-brand-text-02/20 text-brand-text-02 rounded-xl font-medium hover:bg-brand-text-02/5 transition-colors disabled:opacity-50"
                                >
                                    {cancelText}
                                </button>
                                <button
                                    onClick={onConfirm}
                                    disabled={isLoading}
                                    className={`flex-1 px-4 py-3 rounded-xl font-bold text-white shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2 ${isDestructive
                                        ? 'bg-gradient-to-r from-system-color-01 to-system-color-01/80 hover:from-system-color-01/90 hover:to-system-color-01 shadow-system-color-01/30'
                                        : 'bg-gradient-to-r from-warning to-warning/80 hover:from-warning/90 hover:to-warning shadow-warning/30'
                                        }`}
                                >
                                    {isLoading ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        confirmText
                                    )}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
