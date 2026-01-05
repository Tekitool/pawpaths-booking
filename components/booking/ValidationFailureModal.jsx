'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, X, CheckCircle } from 'lucide-react';
import Button from '@/components/ui/Button';

export default function ValidationFailureModal({ isOpen, onClose, errors = {} }) {
    if (!isOpen) return null;

    // Flatten errors for display
    const errorMessages = Object.entries(errors).flatMap(([field, msgs]) => {
        const messages = Array.isArray(msgs) ? msgs : [msgs];
        return messages.map(msg => ({
            field: field.split('.').pop()
                .replace(/_/g, ' ')
                .replace(/([A-Z])/g, ' $1')
                .replace(/\s+[Ii][Dd]$/, '') // Remove trailing ID
                .trim(),
            fullField: field,
            message: msg
        }));
    });

    const firstError = errorMessages[0] || { field: 'Error', message: 'Something went wrong.' };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ duration: 0.4, type: "spring", bounce: 0.3 }}
                        className="relative w-full max-w-lg bg-white/80 backdrop-blur-xl border border-white/50 shadow-2xl rounded-3xl overflow-hidden z-10"
                    >
                        {/* Decorative Elements */}
                        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-system-color-01/80 to-system-color-01" />
                        <div className="absolute -top-20 -right-20 w-64 h-64 bg-error/100/10 rounded-full blur-3xl" />
                        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-accent/10 rounded-full blur-3xl" />

                        <div className="p-8 relative">
                            {/* Icon */}
                            <div className="flex justify-center mb-8">
                                <div className="relative w-32 h-32 flex items-center justify-center">
                                    {/* Rotating Ring */}
                                    <div className="absolute inset-0 rounded-full bg-[conic-gradient(from_0deg,oklch(var(--status-error)),#FFFFFF,#000000,oklch(var(--status-error)))] animate-[spin_4s_linear_infinite] blur-[2px] opacity-80"></div>

                                    {/* Sharp Hairline Ring */}
                                    <div className="absolute inset-0 rounded-full bg-[conic-gradient(from_0deg,oklch(var(--status-error)),#FFFFFF,#000000,oklch(var(--status-error)))] animate-[spin_4s_linear_infinite]"></div>

                                    {/* Inner Mask */}
                                    <div className="absolute inset-[2px] rounded-full bg-white/90 backdrop-blur-xl flex items-center justify-center z-10 shadow-[inset_0_0_20px_rgba(0,0,0,0.05)]">
                                        <AlertCircle size={64} className="text-system-color-01" />
                                    </div>

                                    {/* Outer Glow */}
                                    <div className="absolute inset-0 rounded-full shadow-glow-error z-0"></div>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="text-center space-y-4 mb-8">
                                <h3 className="text-brand-text-02 tracking-tight">
                                    Action Required
                                </h3>
                                <div className="space-y-4 text-brand-text-02 leading-relaxed">
                                    <p>
                                        We noticed some missing or incorrect information in your enquiry details. Please review the following:
                                    </p>

                                    <div className="p-4 rounded-2xl bg-error/10/50 border border-system-color-01 backdrop-blur-sm shadow-sm text-left">
                                        <ul className="space-y-2">
                                            {errorMessages.map((err, idx) => (
                                                <li key={idx} className="flex items-start gap-2 text-sm text-error font-medium">
                                                    <X size={16} className="shrink-0 mt-0.5" />
                                                    <span>
                                                        <span className="capitalize font-bold">{err.field}:</span> {err.message}
                                                    </span>
                                                </li>
                                            ))}
                                            {errorMessages.length === 0 && (
                                                <li className="text-sm text-error">Please check your inputs and try again.</li>
                                            )}
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="space-y-3">
                                <Button
                                    onClick={onClose}
                                    className="w-full py-4 bg-system-color-01 hover:bg-system-color-01/90 text-white rounded-xl font-bold shadow-lg shadow-system-color-01/30 transition-all duration-300"
                                >
                                    Okay, I&apos;ll Fix It
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
