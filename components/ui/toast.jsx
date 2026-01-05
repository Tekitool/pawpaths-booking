'use client';

import * as React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { useToastStore } from '../../hooks/use-toast';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
    return twMerge(clsx(inputs));
}

const icons = {
    success: <CheckCircle className="w-5 h-5 text-system-color-02" />,
    error: <AlertCircle className="w-5 h-5 text-system-color-01" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-500" />,
    info: <Info className="w-5 h-5 text-system-color-03" />,
    default: <Info className="w-5 h-5 text-brand-text-02/80" />,
};

const borderColors = {
    success: 'border-success/30 bg-success/15/90',
    error: 'border-error/30 bg-error/10/90',
    warning: 'border-warning/30 bg-warning/10/90',
    info: 'border-info/30 bg-info/10/90',
    default: 'border-brand-text-02/20 bg-white/90',
};

export function Toaster() {
    const { toasts, dismiss } = useToastStore();
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 w-full max-w-sm pointer-events-none">
            <AnimatePresence mode="popLayout">
                {toasts.map((t) => (
                    <motion.div
                        key={t.id}
                        layout
                        initial={{ opacity: 0, x: 50, scale: 0.9 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: 20, scale: 0.95 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        className={cn(
                            "pointer-events-auto relative flex w-full items-start gap-3 overflow-hidden rounded-xl border p-4 shadow-lg backdrop-blur-md transition-all",
                            borderColors[t.variant] || borderColors.default
                        )}
                    >
                        <div className="shrink-0 mt-0.5">
                            {icons[t.variant] || icons.default}
                        </div>

                        <div className="flex-1">
                            {t.title && <div className="font-semibold text-sm text-gray-900">{t.title}</div>}
                            {t.description && <p className="text-sm text-brand-text-02 mt-1 leading-relaxed">{t.description}</p>}
                        </div>

                        <button
                            onClick={() => dismiss(t.id)}
                            className="shrink-0 rounded-md p-1 text-brand-text-02/60 hover:text-gray-900 transition-colors hover:bg-black/5"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
}
