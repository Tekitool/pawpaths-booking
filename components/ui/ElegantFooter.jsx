'use client';

import React from 'react';
import { Facebook, Instagram, Youtube, Linkedin, MessageCircle } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

// Custom Icons for brands not always in Lucide
const XIcon = ({ size = 24, className = "" }) => (
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

const TikTokIcon = ({ size = 24, className = "" }) => (
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
        <path d="M9 12a4 4 0 1 0 4 4v-12a5 5 0 0 0 5 5" />
    </svg>
);

const SocialButton = ({ href, icon: Icon, label }) => (
    <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-brand-color-01 hover:bg-white hover:scale-110 transition-all duration-300 border border-brand-color-01/10 shadow-sm"
        aria-label={label}
    >
        <Icon size={20} />
    </a>
);

const FooterLink = ({ href, children }) => (
    <Link
        href={href}
        className="text-brand-color-01 hover:text-black font-medium text-sm transition-colors duration-200"
    >
        {children}
    </Link>
);

export default function ElegantFooter() {
    return (
        <footer className="relative mt-16 w-full">
            {/* Main Footer Container with Gradient */}
            <div
                className="w-full pt-10 pb-6 px-4 relative z-10 bg-gradient-to-r from-brand-color-04 to-brand-color-03"
            >
                {/* Extruded Logo Circle */}
                <a
                    href="https://pawpathsae.com/"
                    className="absolute top-0 left-1/2 transform -translate-x-1/2 -mt-16 z-20 group"
                >
                    {/* Rotating Glow Effect */}
                    <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-brand-color-04 via-brand-color-03 to-brand-color-04 opacity-30 blur-md group-hover:opacity-60 transition-all duration-500 animate-[spin_4s_linear_infinite]" />

                    {/* Logo Container */}
                    <div className="relative w-24 h-24 rounded-full p-1.5 bg-white/40 backdrop-blur-md shadow-2xl transition-all duration-500 group-hover:scale-110 group-hover:shadow-[0_0_30px_rgba(255,189,0,0.5)]">
                        <div
                            className="w-full h-full rounded-full flex items-center justify-center border-4 border-white shadow-inner bg-white overflow-hidden"
                        >
                            {/* Logo Image */}
                            <Image
                                src="/ppicon.svg"
                                alt="Pawpaths Logo"
                                width={48}
                                height={48}
                                className="w-12 h-12 object-contain transition-transform duration-500 group-hover:rotate-6"
                            />
                        </div>
                    </div>
                </a>

                {/* Content Container */}
                <div className="max-w-7xl mx-auto flex flex-col items-center text-center pt-8">

                    {/* Brand Name & Slogan */}
                    <h2 className="text-brand-color-01 mb-1 tracking-tight">
                        Pawpaths Pets Relocation Services
                    </h2>
                    <p
                        className="text-brand-color-01/80 font-medium text-2xl mb-6"
                        style={{ fontFamily: '"Brush Script MT", cursive' }}
                    >
                        &quot;The Paw-Fect journey for your Pet&quot;
                    </p>

                    {/* Social Icons */}
                    <div className="flex flex-wrap justify-center gap-3 mb-6">
                        <SocialButton href="https://wa.me/971586947755?text=Hi,%20Pawpaths,%0a%0aI%20want%20to%20know%20more%20about%20the%20pet%20relocation%20services.%0aPlease%20call%20me%20back..." icon={MessageCircle} label="WhatsApp" />
                        <SocialButton href="https://www.facebook.com/pawpathsae" icon={Facebook} label="Facebook" />
                        <SocialButton href="https://www.instagram.com/pawpathsae/" icon={Instagram} label="Instagram" />
                        <SocialButton href="https://www.tiktok.com/@pawpathsae" icon={TikTokIcon} label="TikTok" />
                        <SocialButton href="https://www.youtube.com/@pawpaths" icon={Youtube} label="YouTube" />
                        <SocialButton href="https://www.linkedin.com/company/pawpaths/" icon={Linkedin} label="LinkedIn" />
                        <SocialButton href="https://x.com/pawpathsae" icon={XIcon} label="X (Twitter)" />
                    </div>

                    {/* Navigation Links */}
                    <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 mb-6 px-4">
                        <FooterLink href="https://pawpathsae.com/">Home</FooterLink>
                        <span className="text-brand-color-01/30 hidden sm:inline">|</span>
                        <FooterLink href="https://pawpathsae.com/contacts/">Contact</FooterLink>
                        <span className="text-brand-color-01/30 hidden sm:inline">|</span>
                        <FooterLink href="https://pawpathsae.com/services/">Services</FooterLink>
                        <span className="text-brand-color-01/30 hidden sm:inline">|</span>
                        <FooterLink href="https://pawpathsae.com/faq/">FAQ</FooterLink>
                        <span className="text-brand-color-01/30 hidden sm:inline">|</span>
                        <FooterLink href="https://pawpathsae.com/pet-breed/">Pets & Breeds</FooterLink>
                        <span className="text-brand-color-01/30 hidden sm:inline">|</span>
                        <FooterLink href="https://pawpathsae.com/terms-of-service/">Terms of Service</FooterLink>
                        <span className="text-brand-color-01/30 hidden sm:inline">|</span>
                        <FooterLink href="https://pawpathsae.com/privacy-policy/">Privacy Policy</FooterLink>
                    </div>

                    {/* Copyright */}
                    <div className="text-brand-color-01/70 text-xs font-medium">
                        Copyright © {new Date().getFullYear()} <a href="https://tekitool.com/" target="_blank" rel="noopener noreferrer" className="underline decoration-dotted hover:text-brand-color-01 cursor-pointer">Tekitool Solutions</a>.
                    </div>
                </div>
            </div>
        </footer>
    );
}
