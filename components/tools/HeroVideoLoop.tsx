'use client';

import { useState } from 'react';

interface HeroVideoLoopProps {
    videos: string[];
    opacity?: number;
}

/**
 * Cycles through videos using React's key trick (fresh <video> per src).
 * Stays invisible until onCanPlay fires — eliminates poster flash between clips.
 */
export default function HeroVideoLoop({ videos, opacity = 0.6 }: HeroVideoLoopProps) {
    const [idx, setIdx] = useState(0);
    const [ready, setReady] = useState(false);

    if (!videos.length) return null;

    return (
        <video
            key={videos[idx]}
            src={videos[idx]}
            muted
            playsInline
            autoPlay
            onCanPlay={() => setReady(true)}
            onEnded={() => {
                setReady(false);
                setIdx(p => (p + 1) % videos.length);
            }}
            aria-hidden="true"
            className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700"
            style={{ opacity: ready ? opacity : 0 }}
        />
    );
}
