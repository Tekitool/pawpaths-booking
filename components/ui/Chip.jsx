import React from 'react';
import { X } from 'lucide-react';

const variants = {
    assist: 'bg-surface border border-outline text-on-surface hover:bg-surface-variant',
    filter: 'bg-surface border border-outline text-on-surface hover:bg-surface-variant data-[selected=true]:bg-secondary-container data-[selected=true]:border-transparent data-[selected=true]:text-on-secondary-container',
    input: 'bg-surface-variant text-on-surface-variant hover:bg-on-surface-variant hover:text-surface-variant',
    suggestion: 'bg-surface-container-low text-on-surface hover:bg-surface-container-high',
};

export default function Chip({
    label,
    icon: Icon,
    variant = 'assist',
    selected = false,
    onDelete,
    onClick,
    className = '',
    ...props
}) {
    const baseStyles = 'inline-flex items-center gap-2 rounded-md3-sm px-3 py-1.5 text-label-large transition-colors cursor-pointer';
    const variantStyles = variants[variant] || variants.assist;

    return (
        <div
            className={`${baseStyles} ${variantStyles} ${className}`}
            data-selected={selected}
            onClick={onClick}
            {...props}
        >
            {selected && variant === 'filter' && <span className="text-lg leading-none">✓</span>}
            {Icon && !selected && <Icon size={18} />}
            <span>{label}</span>
            {onDelete && (
                <button
                    onClick={(e) => { e.stopPropagation(); onDelete(); }}
                    className="ml-1 rounded-full p-0.5 hover:bg-black/10"
                >
                    <X size={14} />
                </button>
            )}
        </div>
    );
}
