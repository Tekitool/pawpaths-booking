'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X } from 'lucide-react';
import Image from 'next/image';
import Button from '@/components/ui/Button';

export default function ServiceLimitationModal({ isOpen, onClose }) {
    if (!isOpen) return null;

    const whatsappMessage = encodeURIComponent("Hi Pawpath, I am looking for pet relocation assistance for a route outside the UAE.");
    const whatsappLink = `https://wa.me/971586947755?text=${whatsappMessage}`;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ duration: 0.4, type: "spring", bounce: 0.3 }}
                        className="relative w-full max-w-lg bg-white/80 backdrop-blur-xl border border-white/50 shadow-2xl rounded-3xl overflow-hidden z-10"
                    >
                        {/* Decorative Elements */}
                        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary to-primary" />
                        <div className="absolute -top-20 -right-20 w-64 h-64 bg-brand-color-01/10 rounded-full blur-3xl" />
                        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-brand-color-01/10 rounded-full blur-3xl" />

                        <div className="p-8 relative">
                            {/* Icon */}
                            <div className="flex justify-center mb-8">
                                <div className="relative w-32 h-32 flex items-center justify-center">
                                    {/* Rotating Ring */}
                                    <div className="absolute inset-0 rounded-full bg-[conic-gradient(from_0deg,oklch(var(--status-success)),#FFFFFF,#000000,oklch(var(--status-error)),oklch(var(--status-success)))] animate-[spin_4s_linear_infinite] blur-[2px] opacity-80"></div>

                                    {/* Sharp Hairline Ring (on top of blur) */}
                                    <div className="absolute inset-0 rounded-full bg-[conic-gradient(from_0deg,oklch(var(--status-success)),#FFFFFF,#000000,oklch(var(--status-error)),oklch(var(--status-success)))] animate-[spin_4s_linear_infinite]"></div>

                                    {/* Inner Mask/Container (creates the hollow ring effect) */}
                                    <div className="absolute inset-[2px] rounded-full bg-white/90 backdrop-blur-xl flex items-center justify-center z-10 shadow-[inset_0_0_20px_rgba(0,0,0,0.05)]">
                                        <Image
                                            src="/ppicon.svg"
                                            alt="Pawpaths Icon"
                                            width={64}
                                            height={64}
                                            className="object-contain"
                                        />
                                    </div>

                                    {/* Outer Glow */}
                                    <div className="absolute inset-0 rounded-full shadow-glow-success z-0"></div>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="text-center space-y-4 mb-8">
                                <h3 className="text-brand-text-02 tracking-tight">
                                    Keeping Our Focus on the Emirates
                                </h3>
                                <div className="space-y-4 text-brand-text-02 leading-relaxed">
                                    <p>
                                        Thank you for choosing Pawpath for your pet&apos;s journey! We proudly specialize only in relocations to and from the <span className="font-semibold text-brand-color-01">United Arab Emirates</span>.
                                    </p>
                                    <div className="p-4 rounded-2xl bg-success/15/30 border border-system-color-02/50 backdrop-blur-sm shadow-sm">
                                        <p className="text-sm text-system-color-02 font-medium">
                                            If your journey is beyond the UAE, we&apos;d still love to guide you with expert advice or trusted solutions for your pet&apos;s travel.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="space-y-3">
                                <motion.a
                                    href={whatsappLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="group relative block w-full"
                                    whileHover="hover"
                                    whileTap="tap"
                                    initial="initial"
                                >
                                    {/* Pulsing Glow Container */}
                                    <motion.div
                                        variants={{
                                            initial: { opacity: 0.6, scale: 1 },
                                            hover: { opacity: 0.9, scale: 1.02 },
                                        }}
                                        animate={{
                                            boxShadow: [
                                                "0 0 0px rgba(37, 211, 102, 0)",
                                                "0 0 20px rgba(37, 211, 102, 0.5)",
                                                "0 0 0px rgba(37, 211, 102, 0)"
                                            ],
                                        }}
                                        transition={{
                                            boxShadow: { duration: 3, repeat: Infinity, ease: "easeInOut" }
                                        }}
                                        className="absolute inset-0 rounded-xl bg-system-color-02 blur-lg"
                                    />

                                    {/* Main Button */}
                                    <motion.div
                                        variants={{
                                            initial: { y: 0 },
                                            hover: { y: -1 },
                                            tap: { y: 2, scale: 0.99 },
                                        }}
                                        className="relative w-full py-4 px-6 rounded-xl bg-gradient-to-b from-system-color-02/80 to-system-color-02 border-t border-white/50 border-b border-system-color-02/30 shadow-[0_8px_20px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.4)] flex items-center justify-center gap-3 overflow-hidden z-10"
                                    >
                                        {/* Glass/Gloss Overlay */}
                                        <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent opacity-50 pointer-events-none" />

                                        {/* Shimmer Effect */}
                                        <motion.div
                                            animate={{ x: ["-150%", "150%"] }}
                                            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", repeatDelay: 3 }}
                                            className="absolute inset-0 -skew-x-12 bg-gradient-to-r from-transparent via-white/25 to-transparent w-2/3 h-full pointer-events-none"
                                        />

                                        {/* Icon & Text */}
                                        <MessageCircle size={24} className="text-white drop-shadow-md relative z-10" />
                                        <span className="text-white font-bold text-lg tracking-wide drop-shadow-md relative z-10">
                                            Chat with our Travel Specialists
                                        </span>
                                    </motion.div>
                                </motion.a>

                                <button
                                    onClick={onClose}
                                    className="w-full py-3 text-brand-text-02/60 hover:text-brand-text-02 text-sm font-medium transition-colors"
                                >
                                    Adjust Travel Details
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
