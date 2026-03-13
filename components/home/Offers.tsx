'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { fadeInUp, staggerContainer } from '@/lib/animations';

const FEATURES = [
    {
        title: 'We love pets',
        description: 'We understand that your furry companion is a treasured member of your family and deserves the best care and attention throughout their journey.',
        icon: '/icon-paw2.svg',
    },
    {
        title: 'Peace of mind',
        description: 'Relocating a pet can be stressful; we ensure they receive premium care, safety monitoring, and professional handling every step of the way.',
        icon: '/icon-paw2.svg',
    },
    {
        title: 'Convenience',
        description: 'From door-to-door transport to handling complex documentation and customs, we make international pet relocation effortless for you.',
        icon: '/icon-paw2.svg',
    },
    {
        title: 'Transparency',
        description: 'We want you to feel confident in the care we provide with clear communication and trust that we have your pet\'s best interests at heart.',
        icon: '/icon-paw2.svg',
    },
    {
        title: 'Personalized care',
        description: 'Every pet is unique. Our specialists develop customized travel plans tailored specifically to your companion\'s breed, age, and comfort needs.',
        icon: '/icon-paw2.svg',
    },
    {
        title: 'Expert Teamwork',
        description: 'Our global network of relocation specialists, vets, and handlers work together to ensure your pet receives a smooth, IATA-compliant transition.',
    },
];

export default function Offers() {
    return (
        <section className="relative w-full py-20 lg:py-28 bg-white overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-yellow/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-brand-amber/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                {/* Header */}
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={fadeInUp}
                    className="text-center mb-16 lg:mb-20"
                >
                    <h2
                        className="text-4xl sm:text-5xl lg:text-6xl text-[#4D2A00] font-extrabold mb-4"
                        style={{ fontFamily: 'var(--font-baloo), sans-serif' }}
                    >
                        Why rely on us?
                    </h2>
                    <div className="w-24 h-1.5 bg-brand-amber mx-auto rounded-full" />
                </motion.div>

                {/* Grid */}
                <motion.div
                    variants={staggerContainer}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    className="grid md:grid-cols-2 gap-x-12 gap-y-12 lg:gap-x-24 lg:gap-y-16"
                >
                    {FEATURES.map((feature, index) => (
                        <motion.div
                            key={index}
                            variants={fadeInUp}
                            className="flex items-start gap-5 lg:gap-6 group"
                        >
                            {/* Icon Container */}
                            <div className="shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white shadow-lg border border-gray-100 flex items-center justify-center relative overflow-hidden transition-transform duration-300 group-hover:scale-110">
                                <div className="absolute inset-0 bg-brand-yellow/5 scale-0 group-hover:scale-100 transition-transform duration-300 rounded-full" />
                                <Image
                                    src={feature.icon || '/icon-paw2.svg'}
                                    alt=""
                                    width={28}
                                    height={28}
                                    className="w-7 h-7 sm:w-8 sm:h-8 object-contain relative z-10"
                                />
                            </div>

                            {/* Text Content */}
                            <div className="flex flex-col gap-2">
                                <h3
                                    className="text-xl sm:text-2xl font-bold text-[#4D2A00]"
                                    style={{ fontFamily: 'var(--font-baloo), sans-serif' }}
                                >
                                    {feature.title}
                                </h3>
                                <p
                                    className="text-[#665136] text-[15px] sm:text-base leading-relaxed"
                                    style={{ fontFamily: 'var(--font-jakarta), sans-serif' }}
                                >
                                    {feature.description}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
