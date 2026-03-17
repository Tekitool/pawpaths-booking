'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { staggerContainer, fadeInUp, scaleIn } from '@/lib/animations';

// ─────────────────────────────────────────────────────────────────────────────
// FEATURE DATA
// ─────────────────────────────────────────────────────────────────────────────
interface Feature {
    title: string;
    description: string;
}

const FEATURES: Feature[] = [
    {
        title: '10+ Years Expertise',
        description:
            'Decade of pet relocation success. Proven track record in pet transport regulations of UAE.',
    },
    {
        title: 'Affordable & Fast',
        description:
            'Offering premium pet relocation and expert care. Competitive, clear pricing with no hidden fees.',
    },
    {
        title: 'IATA Compliance',
        description:
            'Mastery of global regulations and IATA standards to ensure full import/export compliance.',
    },
    {
        title: 'Seamless Support',
        description:
            'Complete Door-to-Door management from your home to any destination worldwide.',
    },
];

// ─────────────────────────────────────────────────────────────────────────────
// DOUBLE-CHECKMARK ICON
// ─────────────────────────────────────────────────────────────────────────────
function DoubleCheck({ className = '' }: { className?: string }) {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            className={className}
            aria-hidden="true"
        >
            {/* Back check (lighter) */}
            <path
                d="M1.5 12.5l5 5L18 6"
                stroke="#F6B500"
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            {/* Front check (darker) */}
            <path
                d="M7 12.5l5 5L23.5 6"
                stroke="#F6921E"
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// SOLUTIONS SECTION
// ─────────────────────────────────────────────────────────────────────────────
export default function Solutions() {
    return (
        <section
            aria-labelledby="solutions-heading"
            className="relative w-full bg-white pt-12 lg:pt-16 pb-0 overflow-hidden"
        >
            {/* ── BACKGROUND GLOWS ──────────────────────────────────────────── */}
            <div aria-hidden="true" className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute top-[10%] left-[5%] w-[400px] h-[400px] bg-[#FFFBEA] rounded-full blur-[80px] opacity-80" />
                <div className="absolute bottom-[15%] right-[10%] w-[300px] h-[300px] bg-[#FFFBEA] rounded-full blur-[60px] opacity-50" />
            </div>

            {/* ── MAIN GRID ─────────────────────────────────────────────────── */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 grid lg:grid-cols-2 gap-12 lg:gap-4 items-end">

                {/* ── LEFT COLUMN (Image + Decorations) ──────────────────────── */}
                <motion.div
                    variants={staggerContainer}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: '-100px' }}
                    className="relative flex items-end justify-center lg:justify-end"
                >
                    <motion.div
                        variants={scaleIn}
                        className="relative w-full max-w-[480px] lg:max-w-none"
                    >
                        {/* Yellow glow behind cat */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-[#F6B500]/20 rounded-full blur-[60px] pointer-events-none" />

                        {/* Cat Image — flipped to face right, anchored to bottom, touching baseline, moved right closer to text */}
                        <div className="relative w-full h-[450px] sm:h-[550px] lg:h-[700px] pointer-events-none z-20 lg:translate-x-12">
                            <Image
                                src="/home/solutions.png"
                                alt="Persian cat — trusted pet relocation expert"
                                fill
                                className="object-contain object-bottom drop-shadow-xl -scale-x-100"
                                sizes="(max-width: 1024px) 100vw, 50vw"
                                priority
                            />
                        </div>
                    </motion.div>
                </motion.div>

                {/* ── RIGHT COLUMN (Content) ──────────────────────────────────── */}
                <motion.div
                    variants={staggerContainer}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: '-100px' }}
                    className="flex flex-col items-start pb-12 lg:pb-20"
                >
                    {/* Tagline */}
                    <motion.div variants={fadeInUp} className="flex items-center gap-2 mb-3">
                        <span className="text-[#FF9900] text-sm font-extrabold tracking-wider uppercase">
                            Why We&apos;re Your Trusted Expert?
                        </span>
                        <Image src="/icon-paw2.svg" alt="" width={20} height={20} className="w-5 h-5" />
                    </motion.div>

                    {/* Heading */}
                    <motion.h2
                        variants={fadeInUp}
                        id="solutions-heading"
                        className="text-3xl sm:text-4xl lg:text-[42px] text-[#4D2A00] leading-[1.15] font-extrabold mb-6"
                        style={{ fontFamily: 'var(--font-laila), sans-serif' }}
                    >
                        Complete Travel Solutions<br />
                        With Expert Care.
                    </motion.h2>

                    {/* Paragraph */}
                    <motion.p
                        variants={fadeInUp}
                        className="text-[#665136] text-[15px] sm:text-base leading-[1.7] mb-10 max-w-xl"
                        style={{ fontFamily: 'var(--font-jakarta), sans-serif' }}
                    >
                        As your trusted pet relocation company in Dubai, we know your furry friend
                        is family. With 10+ years of compliant service, we provide the care and
                        attention your beloved companion deserves for a hassle-free move.
                    </motion.p>

                    {/* ── 2×2 Feature Grid ────────────────────────────────────── */}
                    <motion.div
                        variants={fadeInUp}
                        className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-8 w-full"
                    >
                        {FEATURES.map((feature, i) => (
                            <motion.div
                                key={feature.title}
                                variants={fadeInUp}
                                className="flex flex-col"
                            >
                                {/* Title with double-check icon */}
                                <div className="flex items-center gap-2 mb-2">
                                    <DoubleCheck className="w-6 h-6 shrink-0" />
                                    <h3
                                        className="text-[#4D2A00] font-bold text-base sm:text-lg"
                                        style={{ fontFamily: 'var(--font-laila), sans-serif' }}
                                    >
                                        {feature.title}
                                    </h3>
                                </div>
                                {/* Description */}
                                <p
                                    className="text-[#665136] text-sm leading-[1.65] pl-8"
                                    style={{ fontFamily: 'var(--font-jakarta), sans-serif' }}
                                >
                                    {feature.description}
                                </p>
                            </motion.div>
                        ))}
                    </motion.div>

                    {/* Hidden SEO context */}
                    <div className="sr-only">
                        Pawpaths offers complete pet travel solutions from Dubai with 10+ years
                        of IATA-compliant expertise. Affordable door-to-door pet relocation
                        services across the UAE and worldwide.
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
