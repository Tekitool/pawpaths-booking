import React from 'react';

export default function GlassCard({ children, className = '' }) {
    return (
        <div className={`bg-white/60 backdrop-blur-md border border-white/50 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] rounded-xl hover:shadow-lg transition-all duration-300 ease-out ${className}`}>
            {children}
        </div>
    );
}
