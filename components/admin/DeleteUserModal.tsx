'use client';

import React, { useState, useEffect, useRef } from 'react';
import { AlertTriangle, Loader2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface DeleteUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => Promise<void>;
    userName: string;
    userEmail: string;
}

export default function DeleteUserModal({
    isOpen,
    onClose,
    onConfirm,
    userName,
    userEmail,
}: DeleteUserModalProps) {
    const [confirmText, setConfirmText] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const isMatch = confirmText.trim().toLowerCase() === userName.trim().toLowerCase();

    // Reset on open/close & auto-focus input
    useEffect(() => {
        if (isOpen) {
            setConfirmText('');
            setIsDeleting(false);
            // Short delay so the animation has started before focusing
            setTimeout(() => inputRef.current?.focus(), 150);
        }
    }, [isOpen]);

    // Close on Escape key
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        if (isOpen) document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [isOpen, onClose]);

    const handleConfirm = async () => {
        if (!isMatch || isDeleting) return;
        setIsDeleting(true);
        try {
            await onConfirm();
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        key="backdrop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
                        onClick={onClose}
                        aria-hidden="true"
                    />

                    {/* Modal */}
                    <motion.div
                        key="modal"
                        role="alertdialog"
                        aria-modal="true"
                        aria-labelledby="delete-modal-title"
                        aria-describedby="delete-modal-desc"
                        initial={{ opacity: 0, scale: 0.95, y: 16 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 16 }}
                        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
                    >
                        <div
                            className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden pointer-events-auto"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Red accent bar */}
                            <div className="h-1 bg-gradient-to-r from-red-500 via-red-400 to-orange-400" />

                            <div className="p-6 space-y-5">
                                {/* Header */}
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
                                            <AlertTriangle size={20} className="text-red-600" />
                                        </div>
                                        <div>
                                            <h2 id="delete-modal-title" className="text-base font-bold text-gray-900">
                                                Delete Account
                                            </h2>
                                            <p className="text-xs text-gray-500 mt-0.5">{userEmail}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={onClose}
                                        disabled={isDeleting}
                                        className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                                        aria-label="Close"
                                    >
                                        <X size={18} />
                                    </button>
                                </div>

                                {/* Warning body */}
                                <div
                                    id="delete-modal-desc"
                                    className="bg-red-50 border border-red-100 rounded-xl p-4 space-y-2"
                                >
                                    <p className="text-sm font-semibold text-red-700">
                                        This action is permanent and cannot be undone.
                                    </p>
                                    <ul className="text-xs text-red-600 space-y-1 list-disc list-inside">
                                        <li>The user will immediately lose all access</li>
                                        <li>Their auth credentials will be destroyed</li>
                                        <li>Associated activity logs will be orphaned</li>
                                    </ul>
                                </div>

                                {/* Typed confirmation */}
                                <div className="space-y-2">
                                    <label
                                        htmlFor="confirm-input"
                                        className="text-xs font-semibold text-gray-500 uppercase tracking-widest"
                                    >
                                        Type{' '}
                                        <span className="font-mono font-bold text-gray-900 bg-gray-100 px-1.5 py-0.5 rounded">
                                            {userName}
                                        </span>{' '}
                                        to confirm
                                    </label>
                                    <input
                                        id="confirm-input"
                                        ref={inputRef}
                                        type="text"
                                        value={confirmText}
                                        onChange={(e) => setConfirmText(e.target.value)}
                                        onKeyDown={(e) => { if (e.key === 'Enter') handleConfirm(); }}
                                        disabled={isDeleting}
                                        autoComplete="off"
                                        placeholder={userName}
                                        className={`w-full px-3 py-2.5 rounded-lg border text-sm font-medium outline-none transition-all
                                            ${isMatch
                                                ? 'border-red-300 bg-red-50 text-gray-900 ring-2 ring-red-200'
                                                : 'border-gray-200 bg-gray-50 text-gray-900 focus:ring-2 focus:ring-gray-100'
                                            }
                                        `}
                                    />
                                </div>

                                {/* Action buttons */}
                                <div className="flex items-center gap-3 pt-1">
                                    <button
                                        onClick={onClose}
                                        disabled={isDeleting}
                                        className="flex-1 px-4 py-2.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleConfirm}
                                        disabled={!isMatch || isDeleting}
                                        className="flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold text-white transition-all flex items-center justify-center gap-2
                                            bg-red-600 hover:bg-red-700 active:scale-[0.98]
                                            disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-red-600 disabled:active:scale-100"
                                    >
                                        {isDeleting ? (
                                            <>
                                                <Loader2 size={15} className="animate-spin" />
                                                Deleting…
                                            </>
                                        ) : (
                                            'Delete Account'
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
