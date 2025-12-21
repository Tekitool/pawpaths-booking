import React from 'react';

export default function Input({
    label,
    error,
    helperText,
    className = '',
    id,
    ...props
}) {
    return (
        <div className={`relative ${className}`}>
            <input
                id={id}
                placeholder=" "
                className={`
          peer block w-full rounded-t-md3-xs border-b border-outline bg-surface px-4 pb-2.5 pt-6 text-body-large text-on-surface focus:border-b-2 focus:border-primary focus:outline-none placeholder:text-transparent focus:placeholder:text-gray-400
          ${error ? 'border-error focus:border-error' : ''}
          disabled:opacity-38 disabled:cursor-not-allowed
        `}
                {...props}
            />
            <label
                htmlFor={id}
                className={`
          absolute left-4 top-4 z-10 origin-[0] -translate-y-3 scale-75 transform text-body-medium text-on-surface-variant duration-200 
          peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 
          peer-focus:-translate-y-3 peer-focus:scale-75 peer-focus:text-primary
          ${error ? 'text-error peer-focus:text-error' : ''}
        `}
            >
                {label}
            </label>
            {helperText && !error && (
                <p className="mt-1 text-body-small text-on-surface-variant px-4">{helperText}</p>
            )}
            {error && (
                <p className="mt-1 text-body-small text-error px-4">{error}</p>
            )}
        </div>
    );
}
