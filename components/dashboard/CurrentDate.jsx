'use client';

import React, { useState, useEffect } from 'react';

export default function CurrentDate() {
    const [dateString, setDateString] = useState('');

    useEffect(() => {
        const timer = setTimeout(() => {
            setDateString(new Date().toLocaleDateString('en-GB', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            }));
        }, 0);
        return () => clearTimeout(timer);
    }, []);

    if (!dateString) {
        return <span className="opacity-0">Loading...</span>; // Or a skeleton
    }

    return (
        <span>{dateString}</span>
    );
}
