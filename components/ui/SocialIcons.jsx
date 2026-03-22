'use client';

import React from 'react';
import Image from 'next/image';

/**
 * Basic Social Icon component using local SVGs.
 */
const BaseSocialIcon = ({ src, alt, size = 20, className = "" }) => (
    <div
        className={`relative flex items-center justify-center shrink-0 ${className}`}
        style={{ width: size, height: size }}
    >
        <Image
            src={src}
            alt={alt}
            width={size}
            height={size}
            className="w-full h-full object-contain"
            priority={false}
        />
    </div>
);

export const FacebookIcon = (props) => <BaseSocialIcon src="/icons/facebook.svg" alt="Facebook" {...props} />;
export const InstagramIcon = (props) => <BaseSocialIcon src="/icons/instagram.svg" alt="Instagram" {...props} />;
export const LinkedInIcon = (props) => <BaseSocialIcon src="/icons/linkedin.svg" alt="LinkedIn" {...props} />;
export const TikTokIcon = (props) => <BaseSocialIcon src="/icons/tiktok.svg" alt="TikTok" {...props} />;
export const YouTubeIcon = (props) => <BaseSocialIcon src="/icons/youtube.svg" alt="YouTube" {...props} />;
export const PinterestIcon = (props) => <BaseSocialIcon src="/icons/pinterest.svg" alt="Pinterest" {...props} />;
export const SnapchatIcon = (props) => <BaseSocialIcon src="/icons/snapchat.svg" alt="Snapchat" {...props} />;

/**
 * XIcon (Twitter)
 * Custom SVG as it's not present in the local icons folder but needed for footer.
 */
export const XIcon = ({ size = 20, className = "" }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <path d="M4 4l11.733 16h4.267l-11.733 -16z" />
        <path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772" />
    </svg>
);
