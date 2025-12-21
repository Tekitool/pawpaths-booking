import React from 'react';

const variants = {
    elevated: 'bg-surface-container-low shadow-level-1 hover:shadow-level-2',
    outlined: 'border border-outline bg-surface',
    filled: 'bg-surface-container-highest',
};

export default function Card({
    variant = 'elevated',
    className = '',
    children,
    ...props
}) {
    const baseStyles = 'rounded-md3-md overflow-hidden transition-shadow duration-200';
    const variantStyles = variants[variant] || variants.elevated;

    return (
        <div className={`${baseStyles} ${variantStyles} ${className}`} {...props}>
            {children}
        </div>
    );
}
