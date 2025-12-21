import React from 'react';

export default function Badge({
    count,
    variant = 'standard', // standard (dot) or numeric
    className = '',
    ...props
}) {
    if (variant === 'standard') {
        return (
            <span className={`inline-block h-2 w-2 rounded-full bg-error ${className}`} {...props} />
        );
    }

    return (
        <span className={`inline-flex h-4 min-w-[16px] items-center justify-center rounded-full bg-error px-1 text-[10px] font-medium text-white ${className}`} {...props}>
            {count > 99 ? '99+' : count}
        </span>
    );
}
