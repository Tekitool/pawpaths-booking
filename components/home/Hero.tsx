// components/home/HeroSection.tsx
'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Heart } from 'lucide-react';
import { fadeInUp, staggerContainer, floatAnimation, scaleIn } from '@/lib/animations';

export default function Hero() {
    return (
        <section
            aria-labelledby="hero-heading"
            className="relative w-full bg-brand-cream-light overflow-hidden flex items-center pt-28 pb-0 lg:pt-32 lg:pb-0"
        >
            {/* ── BACKGROUND GLOWS ──────────────────────────────────────────────── */}
            <div
                aria-hidden="true"
                className="absolute inset-0 z-0 pointer-events-none"
            >
                {/* Main Yellow Glow behind the image */}
                <div className="absolute top-1/2 right-0 -translate-y-1/2 w-[300px] sm:w-[500px] lg:w-[800px] h-[300px] sm:h-[500px] lg:h-[800px] bg-brand-yellow/30 rounded-full blur-[120px] opacity-70" />
                {/* Subtle left glow */}
                <div className="absolute top-[20%] left-0 w-[250px] sm:w-[350px] lg:w-[500px] h-[250px] sm:h-[350px] lg:h-[500px] bg-brand-cream/50 rounded-full blur-[80px] opacity-60" />
            </div>

            {/* ── FLOATING ICONS (DECORATIVE) ───────────────────────────────────── */}
            <div aria-hidden="true" className="absolute inset-0 z-0 pointer-events-none">
                <motion.div
                    variants={floatAnimation(0.5)} initial="hidden" animate="visible"
                    className="absolute top-[15%] left-[10%] rotate-12 opacity-[0.6]"
                >
                    <Image src="/icon-paw2.svg" alt="" width={56} height={56} className="w-12 h-12 lg:w-14 lg:h-14" />
                </motion.div>

                <motion.div
                    variants={floatAnimation(1.2)} initial="hidden" animate="visible"
                    className="absolute top-[20%] left-[45%] -rotate-45 opacity-[0.6]"
                >
                    <Image src="/icon-bone1.svg" alt="" width={48} height={48} className="w-10 h-10 lg:w-12 lg:h-12" />
                </motion.div>

                <motion.div
                    variants={floatAnimation(0.8)} initial="hidden" animate="visible"
                    className="absolute bottom-[2%] left-[8%] opacity-[0.6]"
                >
                    <Image src="/icon-yarn2.svg" alt="" width={64} height={64} className="w-14 h-14 lg:w-16 lg:h-16" />
                </motion.div>

                <motion.div
                    variants={floatAnimation(1.5)} initial="hidden" animate="visible"
                    className="absolute bottom-[25%] left-[45%] rotate-[15deg] opacity-[0.6]"
                >
                    <Image src="/icon-candy1.svg" alt="" width={48} height={48} className="w-10 h-10 lg:w-12 lg:h-12" />
                </motion.div>
            </div>

            {/* ── MAIN CONTENT CONTAINER ────────────────────────────────────────── */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10 grid lg:grid-cols-2 gap-12 lg:gap-8 items-center h-full">

                {/* ── LEFT COLUMN (TEXT) ────────────────────────────────────────── */}
                <motion.div
                    variants={staggerContainer}
                    initial="hidden"
                    animate="visible"
                    className="flex flex-col items-start max-w-[620px] xl:max-w-[700px] z-20"
                >
                    {/* Headline */}
                    <motion.h1
                        variants={fadeInUp}
                        id="hero-heading"
                        className="text-[32px] sm:text-[48px] md:text-[54px] lg:text-[60px] font-bold text-[#4D2A00] tracking-normal leading-[1.2]"
                    >
                        <div className="flex flex-wrap items-center gap-x-2 lg:gap-x-3 mb-1 lg:mb-2">
                            <span className="translate-y-1">Safe Journeys</span>
                            {/* Dog Image replacement for pill decoration */}
                            <motion.div
                                variants={scaleIn}
                                animate={{
                                    y: [0, -8, 0],
                                }}
                                transition={{
                                    duration: 6,
                                    repeat: Infinity,
                                    ease: "easeInOut",
                                }}
                                className="relative w-[130px] h-[65px] flex items-center justify-center -ml-1 lg:-ml-2 -translate-y-5"
                            >
                                {/* Larger dog bounding box */}
                                <div className="absolute bottom-0 w-[90px] h-[100px]">
                                    <Image
                                        src="/home/hero-dog.png"
                                        alt="Happy dog looking out window"
                                        fill
                                        priority
                                        className="object-contain object-bottom drop-shadow-sm"
                                    />
                                </div>
                            </motion.div>
                        </div>

                        <div className="flex items-center flex-wrap gap-x-3 gap-y-2 lg:gap-x-3 mb-1 lg:mb-2">
                            <span className="translate-y-1">For Your</span>
                            {/* The Heart inline element with gradient, 3D glass, and breathing glow */}
                            <motion.span
                                animate={{
                                    boxShadow: [
                                        "0px 4px 15px rgba(255, 0, 80, 0.4), inset 2px 2px 6px rgba(255, 255, 255, 0.6), inset -2px -4px 8px rgba(180, 0, 40, 0.5)",
                                        "0px 4px 25px rgba(255, 0, 80, 0.8), inset 2px 2px 8px rgba(255, 255, 255, 0.8), inset -2px -4px 10px rgba(180, 0, 40, 0.6)",
                                        "0px 4px 15px rgba(255, 0, 80, 0.4), inset 2px 2px 6px rgba(255, 255, 255, 0.6), inset -2px -4px 8px rgba(180, 0, 40, 0.5)",
                                    ],
                                }}
                                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                                className="relative inline-flex items-center justify-center w-[50px] h-[50px] sm:w-[54px] sm:h-[54px] align-middle ml-1 mr-1 rounded-full overflow-hidden backdrop-blur-md bg-gradient-to-br from-[#ff4d4d]/80 via-[#e60045]/60 to-[#b30036]/80 border border-white/40"
                            >
                                {/* Diagonal top-left glare to enhance glass dimension */}
                                <div className="absolute top-0 left-0 w-[150%] h-[150%] bg-gradient-to-br from-white/60 via-transparent to-transparent -translate-x-1/4 -translate-y-1/4 pointer-events-none rounded-full blur-[2px]" />

                                {/* Inner glow / specular highlight */}
                                <div className="absolute top-[5%] left-[10%] w-[30%] h-[30%] bg-white rounded-full blur-[4px] opacity-70 mix-blend-overlay pointer-events-none" />

                                {/* Rhythmically Pulsating Inner Heart Shape */}
                                <motion.div
                                    animate={{ scale: [1, 1.15, 1, 1.15, 1] }}
                                    transition={{
                                        duration: 2.5,
                                        repeat: Infinity,
                                        ease: "easeInOut",
                                        times: [0, 0.15, 0.3, 0.45, 1] // Double heartbeat timing
                                    }}
                                    className="flex items-center justify-center z-10"
                                >
                                    <Heart className="text-white w-5 h-5 sm:w-6 sm:h-6 drop-shadow-md" fill="currentColor" strokeWidth={0} />
                                </motion.div>
                            </motion.span>
                            <span className="translate-y-1">Furry</span>
                        </div>

                        <div>
                            <span className="translate-y-1 inline-block">Family</span>
                        </div>
                    </motion.h1>

                    {/* Invisible SEO Layer */}
                    <div className="sr-only">
                        {/* Context from REFERENCE.md */}
                        Pawpaths is the UAE&apos;s leading pet relocation service, offering stress-free international dog and cat transport from Dubai, Abu Dhabi, Sharjah, and Al Ain.
                    </div>

                    {/* Subheadline */}
                    <motion.p
                        variants={fadeInUp}
                        className="mt-6 text-[16px] sm:text-[18px] text-[#4D2A00]/80 max-w-[540px] leading-[1.6] font-medium"
                    >
                        With over 10 years of expertise, PawPaths delivers affordable, complaint-free pet relocation in Dubai, ensuring every move is safe and stress free.
                    </motion.p>

                    {/* CTA */}
                    <motion.div variants={fadeInUp} className="mt-8 sm:mt-10">
                        <div className="button-warm-shine rounded-full p-[2px] hover:scale-105 transition duration-300 active:scale-100 inline-block">
                            <Link
                                href="/enquiry"
                                className="relative inline-flex items-center justify-center min-h-[52px] px-8 py-3 text-[17px] font-bold text-white rounded-full touch-manipulation group overflow-hidden backdrop-blur-md bg-gradient-to-br from-[#FFB74D]/90 via-[#F18D23]/85 to-[#E65100]/90 border border-white/30 shadow-[0_4px_15px_rgba(241,141,35,0.4),inset_2px_2px_6px_rgba(255,255,255,0.5),inset_-2px_-3px_6px_rgba(180,80,10,0.4)] hover:shadow-[0_6px_25px_rgba(241,141,35,0.6),inset_2px_2px_8px_rgba(255,255,255,0.6),inset_-2px_-3px_8px_rgba(180,80,10,0.5)] transition-shadow duration-300"
                                aria-label="Get Your Free Quote"
                            >
                                {/* Top glare highlight */}
                                <span className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/40 to-transparent rounded-t-full pointer-events-none" />
                                {/* Specular dot */}
                                <span className="absolute top-[6px] left-[15%] w-[20%] h-[8px] bg-white/50 rounded-full blur-[3px] pointer-events-none" />
                                <span className="relative z-10 flex items-center drop-shadow-sm">
                                    Get Your Free Quote
                                    <ArrowRight className="ml-2.5 w-5 h-5 stroke-[2.5px] group-hover:translate-x-1 transition-transform" />
                                </span>
                            </Link>
                        </div>
                    </motion.div>
                </motion.div>

                {/* ── RIGHT COLUMN (IMAGE) ──────────────────────────────────────── */}
                <motion.div
                    variants={scaleIn}
                    initial="hidden"
                    animate="visible"
                    className="relative w-full h-[350px] sm:h-[450px] lg:h-[650px] flex items-end justify-center lg:justify-end mt-8 lg:mt-0"
                >
                    {/* Main Hero Image */}
                    <div className="relative w-full h-full lg:w-[120%] lg:h-[120%] lg:-mr-20 z-10 flex items-end justify-center pointer-events-none">
                        {/* The image should be transparent WebP/AVIF. Using priority since it's LCP. */}
                        <Image
                            src="/home/hero-banner.png"
                            alt="Pawpaths hero banner image"
                            fill
                            className="object-contain object-bottom drop-shadow-2xl"
                            priority
                            sizes="(max-width: 1024px) 100vw, 50vw"
                        />
                    </div>
                </motion.div>

            </div>
        </section>
    );
}
