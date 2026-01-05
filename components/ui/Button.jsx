import React from 'react';
import { Loader2 } from 'lucide-react';

const variants = {
    filled: 'bg-brand-color-01 text-white hover:shadow-level-1 hover:bg-opacity-90',
    tonal: 'bg-secondary-container text-on-secondary-container hover:shadow-level-1 hover:bg-opacity-80',
    outlined: 'border border-outline text-brand-color-01 hover:bg-surface-variant hover:bg-opacity-10',
    text: 'text-brand-color-01 hover:bg-surface-variant hover:bg-opacity-10',
    fab: 'bg-brand-color-02 text-on-primary-container shadow-level-3 hover:shadow-level-4 rounded-md3-xl',
};

const sizes = {
    sm: 'h-8 px-3 text-label-small',
    md: 'h-10 px-6 text-label-large',
    lg: 'h-12 px-8 text-label-large',
    icon: 'h-10 w-10 p-2',
    fab: 'h-14 w-14 p-4',
};

export default function Button({
    variant = 'filled',
    size = 'md',
    className = '',
    isLoading = false,
    disabled = false,
    children,
    ...props
}) {
    const baseStyles = 'inline-flex items-center justify-center rounded-full font-medium transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none active:scale-95';
    const variantStyles = variants[variant] || variants.filled;
    const sizeStyles = sizes[size] || sizes.md;

    return (
        <button
            className={`${baseStyles} ${variantStyles} ${sizeStyles} ${className}`}
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {children}
        </button>
    );
}
