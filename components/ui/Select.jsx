import React from 'react';
import { ChevronDown } from 'lucide-react';

export default function Select({
    label,
    error,
    helperText,
    className = '',
    id,
    options = [],
    ...props
}) {
    return (
        <div className={`relative ${className}`}>
            <select
                id={id}
                className={`
          peer block w-full appearance-none rounded-t-md3-xs border-b border-outline bg-surface px-4 pb-2.5 pt-6 text-body-large text-on-surface focus:border-b-2 focus:border-brand-color-01 focus:outline-none
          ${error ? 'border-error focus:border-error' : ''}
          disabled:opacity-38 disabled:cursor-not-allowed
        `}
                {...props}
            >
                <option value="" disabled hidden></option>
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
            <label
                htmlFor={id}
                className={`
          absolute left-4 top-4 z-10 origin-[0] -translate-y-3 scale-75 transform text-body-medium text-on-surface-variant duration-200 
          peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 
          peer-focus:-translate-y-3 peer-focus:scale-75 peer-focus:text-brand-color-01
          ${error ? 'text-error peer-focus:text-error' : ''}
        `}
            >
                {label}
            </label>
            <ChevronDown className="absolute right-4 top-4 text-on-surface-variant pointer-events-none" size={24} />

            {helperText && !error && (
                <p className="mt-1 text-body-small text-on-surface-variant px-4">{helperText}</p>
            )}
            {error && (
                <p className="mt-1 text-body-small text-error px-4">{error}</p>
            )}
        </div>
    );
}
