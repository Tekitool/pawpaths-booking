'use client';

import React from 'react';
import Image from 'next/image';

interface WhatsAppIconProps {
    size?: number;
    className?: string;
}

/**
 * WhatsAppIcon Component
 * 
 * A replacement for the generic Lucide MessageCircle icon, using the official 
 * Pawpaths WhatsApp brand logo from the local icons folder.
 * 
 * @param {Object} props
 * @param {number} props.size - The width and height in pixels (default: 20)
 * @param {string} props.className - Additional CSS classes
 */
const WhatsAppIcon: React.FC<WhatsAppIconProps> = ({ size = 20, className = "" }) => {
    return (
        <div
            className={`relative flex items-center justify-center shrink-0 ${className}`}
            style={{ width: size, height: size }}
        >
            <Image
                src="/icons/whatsapp.svg"
                alt="WhatsApp"
                width={size}
                height={size}
                className="w-full h-full object-contain"
                priority={false}
            />
        </div>
    );
};

export default WhatsAppIcon;
