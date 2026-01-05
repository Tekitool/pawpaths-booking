import React from 'react';
import { AlertTriangle } from 'lucide-react';

export default function UnsavedChangesModal({ isOpen, onClose, onConfirm }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 animate-in zoom-in-95 duration-200 border border-gray-200">
                <div className="flex items-center gap-3 mb-4 text-amber-600">
                    <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center">
                        <AlertTriangle size={20} />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">Unsaved Changes</h3>
                </div>
                <p className="text-gray-600 mb-6 text-sm leading-relaxed">
                    You have unsaved changes. If you leave this page, all changes will be lost. Are you sure you want to discard them?
                </p>
                <div className="flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition-colors text-sm"
                    >
                        Keep Editing
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-4 py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition-colors shadow-lg shadow-red-600/20 text-sm"
                    >
                        Discard Changes
                    </button>
                </div>
            </div>
        </div>
    );
}
