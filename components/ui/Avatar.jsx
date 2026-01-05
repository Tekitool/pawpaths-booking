import Image from 'next/image';
import React from 'react';

function getInitials(name) {
    if (!name) return '?';
    return name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();
}

export function Avatar({ name, src, size = 32, className }) {
    const initials = getInitials(name);

    return (
        <div
            className={`relative inline-flex items-center justify-center rounded-full bg-brand-text-02/20 text-brand-text-02 font-medium overflow-hidden ${className || ''}`}
            style={{ width: size, height: size, fontSize: size * 0.4 }}
        >
            {src ? (
                <Image
                    src={src}
                    alt={name || 'Avatar'}
                    fill
                    className="object-cover"
                    unoptimized
                />
            ) : (
                <span>{initials}</span>
            )}
        </div>
    );
}
