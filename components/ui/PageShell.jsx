import React from 'react';

export default function PageShell({ title, subtitle, actions, children }) {
    return (
        <div className="min-h-full bg-gradient-to-br from-surface-warm via-white to-surface-cool p-6 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-brand-text-02">{title}</h1>
                    {subtitle && <p className="text-brand-text-02/80 mt-1">{subtitle}</p>}
                </div>
                {actions && <div className="flex items-center gap-3">{actions}</div>}
            </div>
            {children}
        </div>
    );
}
