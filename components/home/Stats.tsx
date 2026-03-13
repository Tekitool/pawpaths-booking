'use client';

import { motion } from 'framer-motion';
import CountUp from 'react-countup';
import { useInView } from 'react-intersection-observer';
import { fadeInUp, staggerContainer, scaleIn } from '@/lib/animations';

interface StatItem {
    value: number;
    suffix: string;
    label: string;
    delay: number;
}

const STATS: StatItem[] = [
    { value: 10, suffix: '+', label: 'Years Of\nExperience', delay: 0 },
    { value: 30, suffix: '+', label: 'Countries\nServed', delay: 0.1 },
    { value: 3600, suffix: '+', label: 'Successful\nRelocations', delay: 0.2 },
    { value: 8000, suffix: '+', label: 'Satisfied\nClients', delay: 0.3 },
];

export default function Stats() {
    const { ref, inView } = useInView({
        threshold: 0.3,
        triggerOnce: true,
    });

    return (
        <section
            aria-labelledby="stats-heading"
            className="relative w-full overflow-hidden pt-8 lg:pt-12 pb-16 lg:pb-24 bg-[#FFD700]" // Pawpaths yellow matching the image
        >
            {/* ── Randomized Background Paw Pattern ─────────────────────────── */}
            <div
                className="absolute inset-[-10%] w-[120%] h-[120%] pointer-events-none overflow-hidden"
                aria-hidden="true"
            >
                {/* 
                    Statically generated random placement to avoid hydration mismatch
                    Using percentages to scatter them across the entire section.
                */}
                {[...Array(60)].map((_, i) => {
                    // Pre-calculate pseudo-random values based on index to ensure consistent rendering between server/client
                    const top = ((i * 17) % 100);
                    const left = ((i * 23) % 100);
                    const rotate = -30 + ((i * 11) % 60); // Random rotation between -30deg and +30deg
                    const scale = 0.6 + ((i * 7) % 8) / 10; // Random scale between 0.6 and 1.3
                    const baseOpacity = 0.1 + ((i * 13) % 20) / 100; // Random opacity between 0.10 and 0.29

                    // Animation config for individual organic breathing
                    const animDuration = 4 + ((i * 5) % 4); // 4 to 8 seconds
                    const animDelay = ((i * 3) % 5); // 0 to 4 seconds delay

                    return (
                        <motion.div
                            key={i}
                            className="absolute"
                            style={{
                                top: `${top}%`,
                                left: `${left}%`,
                                opacity: baseOpacity,
                            }}
                            animate={{
                                scale: [scale, scale * 1.15, scale],
                                rotate: [rotate, rotate + 10, rotate],
                            }}
                            transition={{
                                duration: animDuration,
                                delay: animDelay,
                                ease: "easeInOut",
                                repeat: Infinity,
                            }}
                        >
                            <img
                                src="/ppicon.svg"
                                alt=""
                                className="w-8 h-8"
                                aria-hidden="true"
                            />
                        </motion.div>
                    );
                })}
            </div>

            {/* ── Glare / Glass Effect Overlays ─────────────────────────────────── */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent pointer-events-none" />
            <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-white/20 to-transparent blur-3xl opacity-50 pointer-events-none" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

                {/* ── Screen Reader Heading ────────────────────────────────────── */}
                <h2 id="stats-heading" className="sr-only">
                    Our Impact in Numbers
                </h2>

                <motion.div
                    ref={ref}
                    variants={staggerContainer}
                    initial="initial"
                    animate={inView ? 'animate' : 'initial'}
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8"
                >
                    {STATS.map((stat, i) => (
                        <motion.div
                            key={i}
                            variants={scaleIn}
                            whileHover={{ y: -8, scale: 1.02 }}
                            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                            className="
                                relative group overflow-hidden
                                bg-white/95 backdrop-blur-md
                                border border-white/40
                                rounded-3xl p-8 sm:p-10
                                shadow-[0_8px_32px_rgba(0,0,0,0.06)]
                                hover:shadow-[0_16px_48px_rgba(255,255,255,0.4)]
                                flex flex-col items-center justify-center text-center
                                transition-all duration-300
                            "
                        >
                            {/* Inner ambient glow on hover */}
                            <div className="absolute inset-0 bg-gradient-to-b from-white/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                            {/* Number wrapper */}
                            <div className="relative z-10 flex items-baseline justify-center mb-3">
                                <span
                                    className="text-5xl lg:text-6xl font-black text-[#1F2937] tracking-tighter" // Dark slate color 
                                    style={{ fontFamily: 'var(--font-baloo), sans-serif' }}
                                >
                                    {inView ? (
                                        <CountUp
                                            start={0}
                                            end={stat.value}
                                            duration={3}
                                            useEasing={true}
                                            separator=","
                                        />
                                    ) : (
                                        '0'
                                    )}
                                </span>
                                <span
                                    className="text-4xl lg:text-5xl font-bold text-[#F6921E] ml-1"
                                    style={{ fontFamily: 'var(--font-baloo), sans-serif' }}
                                >
                                    {stat.suffix}
                                </span>
                            </div>

                            {/* Label */}
                            <p
                                className="relative z-10 text-sm sm:text-base font-bold text-[#4B5563] uppercase tracking-wider whitespace-pre-line"
                                style={{ fontFamily: 'var(--font-jakarta), sans-serif' }}
                            >
                                {stat.label}
                            </p>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
