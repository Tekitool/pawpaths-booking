'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Loader2 } from 'lucide-react';

/**
 * Reason-capture confirmation modal for soft-deleting a pet.
 * Matches the glassmorphism design of ConfirmDialog.jsx.
 *
 * Props:
 *   isOpen     — boolean
 *   onClose    — fn() called on cancel / backdrop click
 *   onConfirm  — fn(reason: string) called with the trimmed reason
 *   petName    — string shown in the title
 *   isDeleting — boolean; shows spinner and disables inputs while in-flight
 */
export default function DeletePetModal({ isOpen, onClose, onConfirm, petName, isDeleting = false }) {
    const [reason, setReason] = useState('');

    // Reset reason text each time modal is opened
    useEffect(() => {
        if (isOpen) setReason('');
    }, [isOpen]);

    const handleClose = () => {
        if (isDeleting) return;
        onClose();
    };

    const handleConfirm = () => {
        if (!reason.trim() || isDeleting) return;
        onConfirm(reason.trim());
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleClose}
                        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
                    />

                    {/* Card */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ duration: 0.3, type: 'spring', bounce: 0.3 }}
                        className="relative w-full max-w-md bg-white/90 backdrop-blur-xl border border-white/50 shadow-2xl rounded-3xl overflow-hidden z-10"
                    >
                        <div className="p-8">
                            {/* Icon */}
                            <div className="mx-auto w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-6">
                                <AlertTriangle size={32} className="text-red-500" />
                            </div>

                            {/* Title + description */}
                            <div className="text-center mb-6">
                                <h3 className="text-gray-900 font-bold text-lg mb-2">
                                    Remove {petName || 'Pet'} from Relocation?
                                </h3>
                                <p className="text-brand-text-02/80 text-sm leading-relaxed">
                                    This pet will be deactivated and removed from the active manifest.
                                    The record is retained for compliance and logged to the System Audit.
                                </p>
                            </div>

                            {/* Reason textarea */}
                            <div className="mb-6">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Reason for Removal <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    value={reason}
                                    onChange={e => setReason(e.target.value)}
                                    disabled={isDeleting}
                                    rows={3}
                                    placeholder="e.g. Added by mistake, Client cancelled, Medical disqualification…"
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-red-400 focus:outline-none focus:bg-white transition-all duration-200 resize-none disabled:opacity-50"
                                />
                            </div>

                            {/* Action buttons */}
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={handleClose}
                                    disabled={isDeleting}
                                    className="flex-1 px-4 py-3 bg-white border border-brand-text-02/20 text-brand-text-02 rounded-xl font-medium hover:bg-brand-text-02/5 transition-colors disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={handleConfirm}
                                    disabled={!reason.trim() || isDeleting}
                                    className="flex-1 px-4 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-lg shadow-red-500/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {isDeleting ? (
                                        <><Loader2 size={16} className="animate-spin" /> Removing…</>
                                    ) : (
                                        'Confirm Removal'
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
