'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plane,
    FileCheck,
    Stethoscope,
    Package,
    ShieldCheck,
    ClipboardList,
    HeartPulse,
    Truck,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { fadeInUp } from '@/lib/animations';

// ─────────────────────────────────────────────────────────────────────────────
// SERVICE DATA
// ─────────────────────────────────────────────────────────────────────────────
interface Service {
    icon: LucideIcon;
    title: string;
    description: string;
    image?: string;                      // swap in real images later
    blobColor: string;
    iconColor: string;
    gradientBack: string;                // animated gradient for back face
}

const SERVICES: Service[] = [
    {
        icon: Plane,
        title: 'International Transport',
        description:
            'Safe, reliable pet transport from the UAE to any destination worldwide with full airline coordination.',
        blobColor: 'bg-[#FFF3D0]',
        iconColor: 'text-[#F6921E]',
        gradientBack:
            'from-[#4D2A00] via-[#F6921E] to-[#F6B500]',
    },
    {
        icon: FileCheck,
        title: 'Document Processing',
        description:
            'Complete handling of health certificates, export permits, and all required travel documentation.',
        blobColor: 'bg-[#F0EAF8]',
        iconColor: 'text-[#7B5EA7]',
        gradientBack:
            'from-[#4D2A00] via-[#7B5EA7] to-[#C4A8E0]',
    },
    {
        icon: Stethoscope,
        title: 'Veterinary Coordination',
        description:
            'Pre-travel vet visits, vaccinations, microchipping, and health checks organized for your pet.',
        blobColor: 'bg-[#E8F5EE]',
        iconColor: 'text-[#3D9970]',
        gradientBack:
            'from-[#4D2A00] via-[#3D9970] to-[#8FCFAD]',
    },
    {
        icon: Package,
        title: 'IATA Crate Supply',
        description:
            'Airline-approved crates sized precisely for your pet using our AI crate calculator.',
        blobColor: 'bg-[#F0F0F0]',
        iconColor: 'text-[#665136]',
        gradientBack:
            'from-[#4D2A00] via-[#665136] to-[#A08B6E]',
    },
    {
        icon: ShieldCheck,
        title: 'Pet Insurance',
        description:
            'Travel insurance options to protect your pet throughout the entire relocation journey.',
        blobColor: 'bg-[#FEEEA1]/40',
        iconColor: 'text-[#E6890C]',
        gradientBack:
            'from-[#4D2A00] via-[#E6890C] to-[#FEEEA1]',
    },
    {
        icon: ClipboardList,
        title: 'Customs Clearance',
        description:
            'Expert handling of import/export customs procedures for smooth border crossings.',
        blobColor: 'bg-[#E8EEF8]',
        iconColor: 'text-[#4A6FA5]',
        gradientBack:
            'from-[#4D2A00] via-[#4A6FA5] to-[#A3C4E8]',
    },
    {
        icon: HeartPulse,
        title: 'Wellness Boarding',
        description:
            'Pre-departure boarding with vet supervision ensuring your pet is travel-ready and stress-free.',
        blobColor: 'bg-[#FDE8E8]',
        iconColor: 'text-[#D04848]',
        gradientBack:
            'from-[#4D2A00] via-[#D04848] to-[#F5A3A3]',
    },
    {
        icon: Truck,
        title: 'Door-to-Door Pickup',
        description:
            'Convenient collection from your home and delivery to your pet\u2019s destination with care.',
        blobColor: 'bg-[#E8F0F5]',
        iconColor: 'text-[#4D8DAD]',
        gradientBack:
            'from-[#4D2A00] via-[#4D8DAD] to-[#A8D4E8]',
    },
];

const CARDS_PER_PAGE = 4;
const TOTAL_PAGES = Math.ceil(SERVICES.length / CARDS_PER_PAGE);

// ─────────────────────────────────────────────────────────────────────────────
// 3D FLIP CARD
// ─────────────────────────────────────────────────────────────────────────────
function FlipCard({ service }: { service: Service }) {
    const Icon = service.icon;

    return (
        <motion.div variants={fadeInUp} className="group [perspective:1000px]">
            <div
                className="
                    relative h-[320px] w-full rounded-[20px]
                    shadow-[0_4px_20px_rgba(77,42,0,0.08)]
                    transition-all duration-700 ease-[cubic-bezier(0.4,0.2,0.2,1)]
                    [transform-style:preserve-3d]
                    group-hover:[transform:rotateY(180deg)]
                "
            >
                {/* ═══════════════════════════════════════════════════════════
                    FRONT FACE — Icon + Title on white
                   ═══════════════════════════════════════════════════════════ */}
                <div
                    className="
                        absolute inset-0 h-full w-full rounded-[20px]
                        [backface-visibility:hidden]
                        bg-white overflow-hidden
                        flex flex-col items-center justify-center p-8
                        border border-white/80
                    "
                >
                    {/* Icon blob */}
                    <div className="relative w-[110px] h-[110px] flex items-center justify-center mb-5">
                        <div className={`absolute inset-0 ${service.blobColor} rounded-full blur-[2px] scale-90`} />
                        <Icon
                            className={`relative z-10 w-12 h-12 ${service.iconColor}`}
                            strokeWidth={1.4}
                        />
                    </div>

                    {/* Title */}
                    <h4
                        className="text-xl font-bold text-[#4D2A00] text-center leading-tight"
                        style={{ fontFamily: 'var(--font-baloo), sans-serif' }}
                    >
                        {service.title}
                    </h4>

                    {/* Subtle "Hover me" hint */}
                    <span className="mt-4 text-[11px] text-[#665136]/40 uppercase tracking-[0.15em] font-medium">
                        Hover to explore
                    </span>
                </div>

                {/* ═══════════════════════════════════════════════════════════
                    BACK FACE — Animated gradient + Title + Description
                   ═══════════════════════════════════════════════════════════ */}
                <div
                    className={`
                        absolute inset-0 h-full w-full rounded-[20px]
                        [backface-visibility:hidden]
                        [transform:rotateY(180deg)]
                        overflow-hidden
                    `}
                >
                    {/* ── Animated gradient background ──────────────────────── */}
                    <div
                        className={`
                            absolute inset-0
                            bg-gradient-to-br ${service.gradientBack}
                            bg-[length:200%_200%]
                            animate-[gradient-shift_4s_ease_infinite]
                        `}
                    />

                    {/* ── Glass overlay for depth ───────────────────────────── */}
                    <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px]" />

                    {/* ── Glare highlight (top-left) ────────────────────────── */}
                    <div className="absolute top-0 left-0 w-[60%] h-[60%] bg-gradient-to-br from-white/20 via-transparent to-transparent rounded-tl-[20px] pointer-events-none" />

                    {/* ── Content ────────────────────────────────────────────── */}
                    <div className="relative z-10 flex flex-col items-center justify-center h-full px-8 text-center">
                        {/* Icon (smaller, white) */}
                        <div className="w-14 h-14 rounded-full bg-white/15 backdrop-blur-sm flex items-center justify-center mb-5 border border-white/20">
                            <Icon className="w-7 h-7 text-white" strokeWidth={1.5} />
                        </div>

                        {/* Title */}
                        <h4
                            className="text-xl font-bold text-white mb-3 leading-tight drop-shadow-md"
                            style={{ fontFamily: 'var(--font-baloo), sans-serif' }}
                        >
                            {service.title}
                        </h4>

                        {/* Description */}
                        <p
                            className="text-sm text-white/90 leading-relaxed max-w-[240px]"
                            style={{ fontFamily: 'var(--font-jakarta), sans-serif' }}
                        >
                            {service.description}
                        </p>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// PAN VARIANTS — horizontal slide based on direction
// ─────────────────────────────────────────────────────────────────────────────
const PAN_DISTANCE = 800;

const panVariants = {
    enter: (direction: number) => ({
        x: direction > 0 ? PAN_DISTANCE : -PAN_DISTANCE,
        opacity: 0,
    }),
    center: {
        x: 0,
        opacity: 1,
        transition: {
            x: { type: 'spring' as const, stiffness: 400, damping: 35 },
            opacity: { duration: 0.2 },
        },
    },
    exit: (direction: number) => ({
        x: direction > 0 ? -PAN_DISTANCE : PAN_DISTANCE,
        opacity: 0,
        transition: {
            x: { type: 'spring' as const, stiffness: 400, damping: 35 },
            opacity: { duration: 0.15 },
        },
    }),
};

// ─────────────────────────────────────────────────────────────────────────────
// PUSH CARD — wraps FlipCard, pushes left/right on click to change page
// ─────────────────────────────────────────────────────────────────────────────
function PushCard({
    service,
    cardIndex,
    totalVisible,
    onPush,
}: {
    service: Service;
    cardIndex: number;
    totalVisible: number;
    onPush: (direction: number) => void;
}) {
    const [pushX, setPushX] = useState(0);

    const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const isLeftHalf = clickX < rect.width / 2;

        // Push visual feedback
        setPushX(isLeftHalf ? -30 : 30);
        setTimeout(() => setPushX(0), 150);

        // Instant pan to load the next 4 cards whether left or right
        onPush(isLeftHalf ? -1 : 1);
    };

    return (
        <motion.div
            animate={{ x: pushX }}
            transition={{ type: 'spring', stiffness: 500, damping: 25 }}
            onClick={handleClick}
            className="cursor-pointer select-none"
        >
            <FlipCard service={service} />
        </motion.div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN SECTION
// ─────────────────────────────────────────────────────────────────────────────
export default function Services() {
    // [[page, direction]]  direction: +1 = forward, -1 = backward
    const [[activePage, direction], setPage] = useState([0, 0]);

    const paginate = (newDirection: number) => {
        setPage(([prev]) => {
            let next = prev + newDirection;
            // Wrap around
            if (next < 0) next = TOTAL_PAGES - 1;
            if (next >= TOTAL_PAGES) next = 0;
            return [next, newDirection];
        });
    };

    const currentCards = SERVICES.slice(
        activePage * CARDS_PER_PAGE,
        activePage * CARDS_PER_PAGE + CARDS_PER_PAGE,
    );

    return (
        <section
            aria-labelledby="services-heading"
            className="relative w-full bg-[#F7F4F0] overflow-hidden pt-20 lg:pt-28 pb-20 lg:pb-28"
        >
            {/* ── Decorative Background Blurs ──────────────────────────── */}
            <div aria-hidden="true" className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute top-[5%] right-[5%] w-[350px] h-[350px] bg-[#FEEEA1]/30 rounded-full blur-[100px]" />
                <div className="absolute bottom-[10%] left-[5%] w-[300px] h-[300px] bg-[#F6921E]/10 rounded-full blur-[80px]" />
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                {/* ── Tagline Badge ─────────────────────────────────────── */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-80px' }}
                    transition={{ duration: 0.6 }}
                    className="flex items-center justify-center gap-3 mb-4"
                >
                    <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-[#F6921E] to-[#E65100] shadow-[0_4px_12px_rgba(246,146,30,0.35)]">
                        <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2c-5.33 0-8 6-8 6h16s-2.67-6-8-6zm-6 8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3zm12 0c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3zm-6 2c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4z" />
                        </svg>
                    </span>
                    <span
                        className="text-[#F6921E] text-sm font-extrabold tracking-wider uppercase"
                        style={{ fontFamily: 'var(--font-jakarta), sans-serif' }}
                    >
                        We love animals
                    </span>
                </motion.div>

                {/* ── Heading ───────────────────────────────────────────── */}
                <motion.h2
                    id="services-heading"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-80px' }}
                    transition={{ duration: 0.7, delay: 0.1 }}
                    className="text-center text-3xl sm:text-4xl lg:text-[44px] text-[#4D2A00] mb-14 lg:mb-16 leading-tight"
                    style={{ fontFamily: 'var(--font-baloo), sans-serif' }}
                >
                    Our Pet Relocation Services
                </motion.h2>

                {/* ── Cards Grid — Horizontal Pan Carousel ─────────────── */}
                <div className="relative min-h-[340px]">
                    <AnimatePresence initial={false} custom={direction} mode="popLayout">
                        <motion.div
                            key={activePage}
                            custom={direction}
                            variants={panVariants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            drag="x"
                            dragConstraints={{ left: 0, right: 0 }}
                            dragElastic={0.2}
                            onDragEnd={(e, { offset, velocity }) => {
                                if (offset.x < -50 || velocity.x < -200) paginate(1);
                                else if (offset.x > 50 || velocity.x > 200) paginate(-1);
                            }}
                            className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 cursor-grab active:cursor-grabbing"
                        >
                            {currentCards.map((service, i) => (
                                <PushCard
                                    key={service.title}
                                    service={service}
                                    cardIndex={i}
                                    totalVisible={currentCards.length}
                                    onPush={paginate}
                                />
                            ))}
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* ── Pagination Dots ──────────────────────────────────── */}
                <div className="flex items-center justify-center gap-3 mt-12">
                    {Array.from({ length: TOTAL_PAGES }).map((_, i) => (
                        <button
                            key={i}
                            onClick={() => setPage([i, i > activePage ? 1 : -1])}
                            aria-label={`Go to page ${i + 1}`}
                            className="relative rounded-full transition-all duration-300"
                        >
                            {/* Background dot */}
                            <span
                                className={`
                                    block rounded-full transition-all duration-300
                                    ${activePage === i
                                        ? 'w-[28px] h-[10px] bg-[#4D2A00]'
                                        : 'w-[10px] h-[10px] bg-[#4D2A00]/20 hover:bg-[#4D2A00]/40'
                                    }
                                `}
                            />
                        </button>
                    ))}
                </div>

                {/* ── LLM Context Block ────────────────────────────────── */}
                <div className="sr-only" aria-hidden="false">
                    Pawpaths offers comprehensive pet relocation services from the UAE
                    including international pet transport, document processing, veterinary
                    coordination, IATA crate supply, pet insurance, customs clearance,
                    wellness boarding, and door-to-door pickup from Dubai, Abu Dhabi,
                    Sharjah, and Al Ain.
                </div>
            </div>
        </section>
    );
}
