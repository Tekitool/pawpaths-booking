'use client';

import { motion } from 'framer-motion';

const RIBBON_TEXTS = [
    '10+ YEARS OF RELOCATION EXPERTISE',
    'IPATA & ATA MEMBER | VERIFIED EXCELLENCE',
    'IATA & LAR CERTIFIED | COMPLETE PROTECTION',
    'EXPERT PET RELOCATION ACROSS ALL CONTINENTS',
    'COMPLETE DOCUMENTATION & COMPLIANCE MANAGEMENT',
    'STRESS-FREE JOURNEYS WITH MAXIMUM SAFETY',
];

export default function Ribbon() {
    // Duplicate the array to create a seamless infinite loop
    const displayTexts = [...RIBBON_TEXTS, ...RIBBON_TEXTS];

    return (
        <div className="w-full bg-[#4D2A00] overflow-hidden flex items-center h-[50px] lg:h-[60px]">
            <motion.div
                className="flex items-center whitespace-nowrap"
                animate={{
                    x: ['0%', '-50%'],
                }}
                transition={{
                    ease: 'linear',
                    duration: 40,
                    repeat: Infinity,
                }}
            >
                {displayTexts.map((text, i) => (
                    <div key={i} className="flex items-center">
                        <span
                            className="text-white text-sm lg:text-base font-semibold tracking-[0.08em] uppercase mx-8 lg:mx-12"
                            style={{ fontFamily: 'var(--font-laila), sans-serif' }}
                        >
                            {text}
                        </span>

                        {/* ── Paw Separator ───────────────────────────────────── */}
                        <img
                            src="/paw01.svg"
                            alt=""
                            className="w-4 h-4 opacity-80"
                            style={{
                                filter: 'brightness(0) saturate(100%) invert(84%) sepia(35%) saturate(1096%) hue-rotate(345deg) brightness(101%) contrast(100%)'
                                // CSS filter to turn the black paw to Pawpaths Yellow (#FFD700 / #F6921E approximate)
                            }}
                            aria-hidden="true"
                        />
                    </div>
                ))}
            </motion.div>
        </div>
    );
}
