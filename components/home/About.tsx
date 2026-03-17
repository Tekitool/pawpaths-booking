'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { Play } from 'lucide-react';
import { staggerContainer, fadeInUp, scaleIn } from '@/lib/animations';

export default function About() {
    return (
        <section className="relative w-full bg-white overflow-hidden py-16 lg:py-24">

            {/* ── BACKGROUND DETAILS (Pale Yellow Smudges & Floating Arts) ────── */}
            <div aria-hidden="true" className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute top-[10%] left-[5%] w-[400px] h-[400px] bg-[#FFFBEA] rounded-full blur-[80px] opacity-80" />
                <div className="absolute bottom-[10%] right-[10%] w-[300px] h-[300px] bg-[#FFFBEA] rounded-full blur-[60px] opacity-60" />

                {/* 1. Line-art Cat (Bottom Left) */}
                <motion.div
                    animate={{ y: [0, -10, 0], rotate: [0, 2, -2, 0] }}
                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute bottom-12 left-4 md:left-12 lg:left-[5%] w-[60px] h-[60px] md:w-[80px] md:h-[80px]"
                >
                    <Image src="/home/about-shape01.png" alt="Decorative cat illustration" fill className="object-contain opacity-80" />
                </motion.div>

                {/* 2. Yellow Bone (Top Right) */}
                <motion.div
                    animate={{ y: [0, 8, 0], rotate: [0, -5, 5, 0] }}
                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                    className="absolute top-12 right-8 md:right-16 lg:right-[15%] w-[70px] h-[70px] md:w-[90px] md:h-[90px]"
                >
                    <Image src="/icon-bone1.svg" alt="" width={90} height={90} className="w-full h-full object-contain" />
                </motion.div>

                {/* 3. Yellow Yarn (Bottom Right) */}
                <motion.div
                    animate={{ y: [0, -5, 0], rotate: [0, 10, 0] }}
                    transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                    className="absolute bottom-8 right-8 md:right-24 lg:right-[10%] w-[50px] h-[50px] md:w-[65px] md:h-[65px]"
                >
                    <Image src="/home/about-shape03.png" alt="Decorative yarn illustration" fill className="object-contain" />
                </motion.div>
            </div>

            {/* ── MAIN GRID ───────────────────────────────────────────────────── */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 grid lg:grid-cols-2 gap-16 lg:gap-12 items-center">

                {/* ── LEFT COLUMN (Visuals) ────────────────────────────────────── */}
                <motion.div
                    variants={staggerContainer}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    className="relative flex justify-center lg:justify-start overflow-hidden"
                >
                    {/* The Yellow Blob Background Shape */}
                    <motion.div
                        variants={scaleIn}
                        className="relative w-full  max-w-[450px] sm:max-w-[550px] lg:max-w-none flex flex-col justify-center h-full"
                    >
                        {/* The Dog Image */}
                        <div className="relative w-full h-[450px] sm:h-[550px] lg:h-[600px] pointer-events-none z-10">
                            <Image
                                src="/home/about-dog.png"
                                alt="Happy golden retriever"
                                fill
                                className="object-contain object-center drop-shadow-xl"
                                priority
                            />
                        </div>

                        {/* Watch Video CTA Badge */}
                        <motion.div
                            variants={fadeInUp}
                            className="absolute bottom-[8%] right-[8%] sm:bottom-[10%] sm:right-[10%] w-[90px] h-[90px] sm:w-[110px] sm:h-[110px] bg-[#4D2A00] rounded-full flex flex-col items-center justify-center p-3 sm:p-4 shadow-xl z-20"
                        >
                            <span className="text-white text-[10px] sm:text-xs font-semibold text-center leading-tight mb-2">
                                Watch Our<br />Working Video
                            </span>
                            <button
                                className="w-8 h-8 sm:w-10 sm:h-10 bg-[#FF0033] rounded-full flex items-center justify-center shadow-[0_4px_15px_rgba(255,0,51,0.4)] hover:scale-110 transition-transform cursor-pointer"
                                aria-label="Play working video"
                            >
                                <Play className="w-4 h-4 sm:w-5 sm:h-5 text-white ml-0.5" fill="currentColor" strokeWidth={0} />
                            </button>
                        </motion.div>
                    </motion.div>
                </motion.div>

                {/* ── RIGHT COLUMN (Content) ───────────────────────────────────── */}
                <motion.div
                    variants={staggerContainer}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    className="flex flex-col items-start"
                >
                    {/* Tagline */}
                    <motion.div variants={fadeInUp} className="flex items-center gap-2 mb-3">
                        <span className="text-[#FF9900] text-sm font-extrabold tracking-wider uppercase">About Pawpaths</span>
                        <Image src="/icon-paw2.svg" alt="" width={20} height={20} className="w-5 h-5" />
                    </motion.div>

                    {/* Heading */}
                    <motion.div variants={fadeInUp} className="mb-8">
                        <h3 className="text-3xl sm:text-4xl text-[#4D2A00] leading-[1.15] font-extrabold" style={{ fontFamily: 'var(--font-laila), sans-serif' }}>
                            Your Trusted Partner
                        </h3>
                        {/* We use h5 but boost its margin to look cohesive and lower the contrast slightly per design */}
                        <h5 className="text-xl sm:text-2xl text-[#665136] leading-[1.2] mt-1 font-extrabold" style={{ fontFamily: 'var(--font-laila), sans-serif' }}>
                            For Fast, Affordable Relocation
                        </h5>
                    </motion.div>

                    {/* Highlight Box (10 Yrs Experience) */}
                    <motion.div variants={fadeInUp} className="flex items-center gap-4 sm:gap-6 mb-8 w-full max-w-xl">
                        {/* 3D Glass Orange Squircle Badge with Rotating Border */}
                        <div className="glass-border-rotate w-[85px] h-[85px] sm:w-[100px] sm:h-[100px] shrink-0 rounded-[24px] sm:rounded-[30px] bg-gradient-to-br from-[#FFB74D]/90 via-[#F6921E]/80 to-[#E65100]/90">
                            <motion.div
                                animate={{
                                    boxShadow: [
                                        "0px 4px 15px rgba(246, 146, 30, 0.4), inset 2px 2px 6px rgba(255, 255, 255, 0.6), inset -2px -4px 8px rgba(200, 100, 10, 0.5)",
                                        "0px 4px 25px rgba(246, 146, 30, 0.8), inset 2px 2px 8px rgba(255, 255, 255, 0.8), inset -2px -4px 10px rgba(200, 100, 10, 0.6)",
                                        "0px 4px 15px rgba(246, 146, 30, 0.4), inset 2px 2px 6px rgba(255, 255, 255, 0.6), inset -2px -4px 8px rgba(200, 100, 10, 0.5)",
                                    ],
                                }}
                                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                                className="w-full h-full rounded-[23px] sm:rounded-[29px] flex flex-col items-center justify-center text-white relative z-10 overflow-hidden backdrop-blur-md bg-gradient-to-br from-[#FFB74D]/90 via-[#F6921E]/80 to-[#E65100]/90"
                            >
                                {/* Glass Glare */}
                                <div className="absolute top-0 left-0 w-[150%] h-[150%] bg-gradient-to-br from-white/60 via-transparent to-transparent -translate-x-1/4 -translate-y-1/4 pointer-events-none blur-[2px]" />
                                <div className="absolute top-[5%] left-[10%] w-[30%] h-[30%] bg-white rounded-full blur-[4px] opacity-70 mix-blend-overlay pointer-events-none" />

                                <div className="flex flex-col items-center justify-center pt-2 z-10 w-full h-full">
                                    <div className="flex items-end font-bold leading-none" style={{ fontFamily: 'var(--font-baloo), sans-serif' }}>
                                        <span className="text-[2.5rem] sm:text-[3rem] drop-shadow-md leading-[0.85]">10</span>
                                        <motion.span
                                            animate={{ scale: [0.6, 0.8, 0.6] }}
                                            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                                            className="text-[2.625rem] sm:text-[3.125rem] drop-shadow-md leading-[0.85] ml-0.5 origin-center inline-block"
                                        >+</motion.span>
                                    </div>
                                    <span className="text-[9px] sm:text-[10px] font-bold tracking-widest uppercase text-white drop-shadow-md text-center leading-[1.2] mt-[0.2rem] w-full">
                                        Years Of<br />Experience
                                    </span>
                                </div>
                            </motion.div>
                        </div>

                        {/* Vertical Divider */}
                        <div className="w-[3px] h-[60px] bg-[#F6921E] rounded-full shrink-0" />

                        {/* Brief Bold Text */}
                        <p className="text-[#4D2A00] font-semibold text-sm sm:text-base leading-snug">
                            Relocate your beloved pets from Dubai to anywhere worldwide with PawPaths - stress-free international pet transport that prioritizes safety and comfort!
                        </p>
                    </motion.div>

                    {/* Body Paragraph */}
                    <motion.p
                        variants={fadeInUp}
                        className="text-[#665136] text-[15px] sm:text-base leading-[1.7] mb-8 max-w-xl"
                        style={{ fontFamily: 'var(--font-jakarta), sans-serif' }}
                    >
                        With 10+ years expertise, We work with you to develop personalized pet relocation plans from Dubai, including complete documentation, vet coordination, and IATA-compliant transport. PawPath is UAE&apos;s premier pet relocation company providing door-to-door care that ensures your companion&apos;s safety and comfort throughout.
                    </motion.p>

                    {/* Trust/Review Element */}
                    <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row sm:items-center gap-4 border-t border-slate-200 pt-6 mt-2 w-full max-w-xl">
                        <div className="flex items-center gap-4">
                            <div className="w-[3px] h-[40px] bg-slate-200" />
                            {/* Avatars Stack */}
                            <div className="flex -space-x-3">
                                <div className="w-10 h-10 rounded-full border-2 border-white bg-slate-200" />
                                <div className="w-10 h-10 rounded-full border-2 border-white bg-slate-300" />
                                <div className="w-10 h-10 rounded-full border-2 border-white bg-slate-400" />
                                <div className="w-10 h-10 rounded-full border-2 border-white bg-slate-500" />
                            </div>
                        </div>
                        <div className="flex flex-col">
                            <div className="flex gap-1 text-[#F6B500] mb-0.5">
                                {[1, 2, 3, 4, 5].map(i => (
                                    <svg key={i} className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                                ))}
                            </div>
                            <span className="text-sm font-semibold text-[#665136]" style={{ fontFamily: 'var(--font-jakarta), sans-serif' }}>5 (70+ Google Reviews)</span>
                        </div>
                    </motion.div>

                </motion.div>

            </div>
        </section>
    );
}
