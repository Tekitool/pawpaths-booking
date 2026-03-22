'use client';

import React, { useEffect, useState } from 'react';
import WhatsAppIcon from '@/components/ui/WhatsAppIcon';

interface WhatsAppShareBtnProps {
    title?: string;
    text?: string;
}

export default function WhatsAppShareBtn({
    title = 'Check out this tool!',
    text = 'I found this useful tool on Pawpaths.'
}: WhatsAppShareBtnProps) {
    // No need for state if we only use it on click


    const handleShare = () => {
        const url = typeof window !== 'undefined' ? window.location.href : '';
        const message = `${title}\n${text}\n${url}`;
        const encodedMessage = encodeURIComponent(message);
        const whatsappUrl = `https://wa.me/?text=${encodedMessage}`;
        window.open(whatsappUrl, '_blank');
    };

    return (
        <button
            onClick={handleShare}
            className="
        inline-flex items-center gap-2 px-6 py-3 
        bg-system-color-02 hover:opacity-90 
        text-white font-bold rounded-xl 
        transition-all duration-300 
        shadow-lg shadow-success/20 hover:shadow-xl hover:-translate-y-0.5 active:scale-95
      "
            aria-label="Share via WhatsApp"
        >
            <WhatsAppIcon size={20} />
            <span>Share via WhatsApp</span>
        </button>
    );
}
