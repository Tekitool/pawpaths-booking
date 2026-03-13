import Link from 'next/link';
import Image from 'next/image';
import {
    FileText,
    PlaneTakeoff,
    Package,
    Stethoscope,
    Plane,
    FileCheck,
    ShieldCheck,
    ClipboardList,
    HeartPulse,
    Truck,
    Globe,
    ArrowRight,
    CheckCircle2,
    Phone,
    ClipboardCheck,
    Sparkles,
    MapPinned,
    Star,
} from 'lucide-react';
import NavBar from '@/components/layouts/NavBar';
import Footer from '@/components/layouts/Footer';

// ─────────────────────────────────────────────────────────────────────────────
// METADATA
// ─────────────────────────────────────────────────────────────────────────────
export const metadata = {
    title: 'Services | Pawpaths',
    description:
        'Comprehensive pet relocation services from Dubai, UAE — documentation, flight booking, IATA crate supply, vet coordination, door-to-door delivery & more.',
    alternates: { canonical: 'https://pawpathsae.com/services' },
    openGraph: {
        title: 'Pet Relocation Services | Pawpaths UAE',
        description:
            'Expert international pet relocation from the UAE. Full-service documentation, airline booking, crate supply, and veterinary support.',
        url: 'https://pawpathsae.com/services',
    },
};

// ─────────────────────────────────────────────────────────────────────────────
// DATA
// ─────────────────────────────────────────────────────────────────────────────

// Section 2 — blob cards (exact text from screenshot)
const BLOB_SERVICES = [
    {
        Icon: FileText,
        title: 'Documentation',
        desc: 'Expert handling of complete IATA compliance travel documentation.',
        href: '/enquiry',
    },
    {
        Icon: PlaneTakeoff,
        title: 'Flight Booking',
        desc: 'Professional pet flight coordination with trusted airline partnerships.',
        href: '/enquiry',
    },
    {
        Icon: Package,
        title: 'Crate Service',
        desc: 'IATA-approved custom pet crates ensuring comfort and safety in flight.',
        href: '/enquiry',
    },
    {
        Icon: Stethoscope,
        title: 'Vet Support',
        desc: 'Complete health assessments with certified vets for travel compliance.',
        href: '/enquiry',
    },
];

// Section 4 — Full services grid
const ALL_SERVICES = [
    {
        Icon: Globe,
        title: 'International Transport',
        desc: 'Safe, reliable pet transport from the UAE to any destination worldwide with full airline coordination and real-time tracking.',
        features: ['Door-to-door handling', 'Route optimisation', 'Cargo & cabin options'],
        accent: '#F6921E',
        bg: '#FFF7ED',
    },
    {
        Icon: FileCheck,
        title: 'Document Processing',
        desc: 'Complete handling of health certificates, export permits, pet passports, and all destination-country requirements.',
        features: ['Export permits', 'Health certificates', 'Country-specific docs'],
        accent: '#7B5EA7',
        bg: '#F5F0FF',
    },
    {
        Icon: Stethoscope,
        title: 'Veterinary Coordination',
        desc: 'Pre-travel vet visits, vaccinations, microchipping, rabies titer tests, and health checks organised for your pet.',
        features: ['USDA/EU-endorsed vets', 'Microchip registration', 'Rabies titer testing'],
        accent: '#3D9970',
        bg: '#EDFAF4',
    },
    {
        Icon: Package,
        title: 'IATA Crate Supply',
        desc: 'Airline-approved travel crates sized precisely for your pet using our AI crate calculator. Delivered to your door.',
        features: ['AI-sized to your pet', 'Airline compliant', 'Home delivery'],
        accent: '#665136',
        bg: '#F5F0E8',
    },
    {
        Icon: ShieldCheck,
        title: 'Pet Travel Insurance',
        desc: 'Comprehensive in-transit coverage protecting your pet against accidents, illness, and travel delays throughout the journey.',
        features: ['In-transit coverage', 'Accident & illness', 'Delay protection'],
        accent: '#E6890C',
        bg: '#FFFBEA',
    },
    {
        Icon: ClipboardList,
        title: 'Customs Clearance',
        desc: 'Expert handling of import and export customs procedures ensuring smooth border crossings without bureaucratic delays.',
        features: ['Import/export permits', 'Destination compliance', 'Zero hidden fees'],
        accent: '#4A6FA5',
        bg: '#EEF3FB',
    },
    {
        Icon: HeartPulse,
        title: 'Wellness Boarding',
        desc: 'Pre-departure boarding with full veterinary supervision ensuring your pet is travel-ready, calm, and stress-free.',
        features: ['Vet-supervised stay', 'Stress reduction care', 'Travel acclimatisation'],
        accent: '#D04848',
        bg: '#FEF0F0',
    },
    {
        Icon: Truck,
        title: 'Door-to-Door Pickup',
        desc: 'Convenient collection from your home in the UAE and delivery to your pet\'s final destination with dedicated care.',
        features: ['UAE-wide pickup', 'Airport handover', 'Destination delivery'],
        accent: '#4D8DAD',
        bg: '#EEF6FB',
    },
];

// Section 3 — How It Works steps
const STEPS = [
    { num: '01', Icon: Phone, title: 'Initial Enquiry', desc: 'Tell us about your pet, destination, and timeline. We respond within 24 hours.' },
    { num: '02', Icon: ClipboardCheck, title: 'Custom Travel Plan', desc: 'We prepare a tailored relocation plan with all required steps and documentation.' },
    { num: '03', Icon: FileText, title: 'Document Preparation', desc: 'Our team handles every permit, health certificate, and compliance form end-to-end.' },
    { num: '04', Icon: Plane, title: 'Travel Day', desc: 'We coordinate pickup, airline check-in, and ensure smooth onward handling.' },
    { num: '05', Icon: MapPinned, title: 'Safe Arrival', desc: 'Your pet arrives safely at the destination. We follow up with a wellness check-in.' },
];

// ─────────────────────────────────────────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────────────────────────────────────────
export default function ServicesPage() {
    return (
        <div className="min-h-screen flex flex-col bg-surface-ivory">

            {/* ── NAVBAR ─────────────────────────────────────────────── */}
            <NavBar />

            <main className="flex-1">

                {/* ════════════════════════════════════════════════════════
                    1. HERO
                   ════════════════════════════════════════════════════════ */}
                <section className="relative bg-brand-brown overflow-hidden pt-20 pb-24 px-4 sm:px-6 lg:px-8">
                    <div aria-hidden className="absolute inset-0 pointer-events-none">
                        <div className="absolute top-0 right-1/3 w-[500px] h-[500px] bg-brand-amber/10 rounded-full blur-[120px]" />
                        <div className="absolute bottom-0 left-0 w-[350px] h-[350px] bg-brand-yellow/8 rounded-full blur-[90px]" />
                    </div>

                    <div className="relative z-10 max-w-4xl mx-auto text-center">
                        <span className="inline-flex items-center gap-2 bg-brand-amber/15 border border-brand-amber/30 text-brand-amber text-xs font-semibold uppercase tracking-widest px-4 py-1.5 rounded-full mb-6">
                            <Sparkles size={12} />
                            UAE&apos;s Premier Pet Relocation Specialists
                        </span>
                        <h1
                            className="text-white text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight tracking-tight mb-6"
                            style={{ fontFamily: 'var(--font-baloo), sans-serif' }}
                        >
                            Every Service Your<br />
                            <span className="text-brand-yellow">Pet Deserves</span>
                        </h1>
                        <p className="text-white/65 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed mb-10">
                            From documentation to door-to-door delivery — Pawpaths provides every
                            service needed for a safe, stress-free international pet relocation.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link
                                href="/enquiry"
                                className="inline-flex items-center gap-2 bg-brand-amber text-white font-semibold px-7 py-3.5 rounded-xl shadow-glow-amber hover:bg-brand-amber-light transition-all duration-200 text-sm"
                            >
                                Get a Free Quote <ArrowRight size={16} />
                            </Link>
                            <Link
                                href="/tools"
                                className="inline-flex items-center gap-2 border border-white/20 text-white/80 hover:text-white hover:border-white/40 font-medium px-7 py-3.5 rounded-xl transition-all duration-200 text-sm"
                            >
                                Try AI Tools
                            </Link>
                        </div>
                    </div>
                </section>

                {/* ════════════════════════════════════════════════════════
                    2. BLOB CARD SECTION — matches reference screenshot
                   ════════════════════════════════════════════════════════ */}
                <section className="relative bg-brand-cream-light overflow-hidden py-20 px-4 sm:px-6 lg:px-8">

                    {/* Decorative floating elements */}
                    <div aria-hidden className="absolute inset-0 pointer-events-none select-none">
                        <img
                            src="/icon-bone1.svg" alt=""
                            className="absolute bottom-10 left-6 w-14 h-14 opacity-50"
                            style={{ animation: 'float1 6s ease-in-out infinite' }}
                        />
                        <Image
                            src="/icon-cat.png" alt=""
                            width={80} height={80}
                            className="absolute top-8 right-[38%] opacity-30"
                            style={{ animation: 'float2 7s ease-in-out infinite' }}
                        />
                        <img
                            src="/icon-paw2.svg" alt=""
                            className="absolute top-16 right-6 w-16 h-16 opacity-30"
                            style={{ animation: 'float1 5s ease-in-out infinite 1s' }}
                        />
                    </div>

                    <style>{`
                        @keyframes float1 {
                            0%, 100% { transform: translateY(0px) rotate(0deg); }
                            50% { transform: translateY(-12px) rotate(4deg); }
                        }
                        @keyframes float2 {
                            0%, 100% { transform: translateY(0px) rotate(-3deg); }
                            50% { transform: translateY(-8px) rotate(3deg); }
                        }
                    `}</style>

                    <div className="max-w-6xl mx-auto">

                        {/* Header row — left heading + right button */}
                        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-14">
                            <div>
                                <span className="inline-flex items-center gap-2 text-brand-amber text-xs font-extrabold uppercase tracking-widest mb-3">
                                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M12 2c-5.33 0-8 6-8 6h16s-2.67-6-8-6zm-6 8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3zm12 0c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3zm-6 2c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4z" />
                                    </svg>
                                    Complete Pet Travel Solutions
                                </span>
                                <h2
                                    className="text-brand-brown text-3xl sm:text-4xl lg:text-[42px] font-bold leading-tight max-w-xl"
                                    style={{ fontFamily: 'var(--font-baloo), sans-serif' }}
                                >
                                    Comprehensive Pet Relocation:<br />
                                    Now Fast And Affordable.
                                </h2>
                            </div>

                            <Link
                                href="/enquiry"
                                className="shrink-0 inline-flex items-center gap-2 border-2 border-brand-brown text-brand-brown text-sm font-semibold px-6 py-3 rounded-full hover:bg-brand-brown hover:text-white transition-all duration-200"
                            >
                                Explore All Our Pet Relocation Services <ArrowRight size={15} />
                            </Link>
                        </div>

                        {/* Blob cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
                            {BLOB_SERVICES.map(({ Icon, title, desc, href }) => (
                                <div key={title} className="flex flex-col items-center group">
                                    {/* The blob card */}
                                    <div
                                        className="relative w-full bg-white border-2 border-dashed border-brand-taupe/25 flex flex-col items-center justify-between pt-10 pb-7 px-6 shadow-soft hover:shadow-medium transition-all duration-300 hover:-translate-y-1"
                                        style={{ borderRadius: '55% 45% 50% 50% / 50% 50% 55% 45%', minHeight: '260px' }}
                                    >
                                        {/* Sticky note tab */}
                                        <div
                                            className="absolute -top-3 left-1/2 w-10 h-3.5 bg-brand-cream rounded-sm shadow-sm"
                                            style={{ transform: 'translateX(-50%) rotate(-3deg)' }}
                                        />

                                        {/* Icon */}
                                        <div className="w-14 h-14 rounded-full bg-brand-cream flex items-center justify-center mb-4 group-hover:bg-brand-amber/10 transition-colors duration-200">
                                            <Icon
                                                size={26}
                                                className="text-brand-brown group-hover:text-brand-amber transition-colors duration-200"
                                                strokeWidth={1.6}
                                            />
                                        </div>

                                        {/* Text */}
                                        <div className="text-center flex-1 flex flex-col justify-center gap-2 px-2">
                                            <h3
                                                className="text-brand-brown font-bold text-lg"
                                                style={{ fontFamily: 'var(--font-baloo), sans-serif' }}
                                            >
                                                {title}
                                            </h3>
                                            <p className="text-brand-taupe text-sm leading-relaxed">
                                                {desc}
                                            </p>
                                        </div>

                                        {/* Read More button */}
                                        <Link
                                            href={href}
                                            className="mt-5 inline-flex items-center gap-1.5 border border-brand-brown text-brand-brown text-xs font-semibold px-5 py-2 rounded-full hover:bg-brand-brown hover:text-white transition-all duration-200"
                                        >
                                            Read More <ArrowRight size={12} />
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ════════════════════════════════════════════════════════
                    3. HOW IT WORKS
                   ════════════════════════════════════════════════════════ */}
                <section className="bg-white py-20 px-4 sm:px-6 lg:px-8">
                    <div className="max-w-5xl mx-auto">
                        <div className="text-center mb-14">
                            <span className="text-brand-amber text-xs font-bold uppercase tracking-widest">Step By Step</span>
                            <h2
                                className="text-brand-brown text-3xl sm:text-4xl font-bold mt-2 mb-3"
                                style={{ fontFamily: 'var(--font-baloo), sans-serif' }}
                            >
                                How It Works
                            </h2>
                            <div className="w-10 h-1 bg-brand-amber rounded-full mx-auto" />
                        </div>

                        {/* Desktop timeline */}
                        <div className="hidden lg:flex items-start gap-0">
                            {STEPS.map(({ num, Icon, title, desc }, i) => (
                                <div key={num} className="flex-1 flex flex-col items-center text-center relative">
                                    {/* Connector line (not on last item) */}
                                    {i < STEPS.length - 1 && (
                                        <div className="absolute top-7 left-[calc(50%+28px)] w-[calc(100%-56px)] h-px border-t-2 border-dashed border-brand-taupe/25 z-0" />
                                    )}
                                    {/* Step circle */}
                                    <div className="relative z-10 w-14 h-14 rounded-full bg-brand-brown flex items-center justify-center shadow-soft mb-4 shrink-0">
                                        <Icon size={22} className="text-white" strokeWidth={1.6} />
                                    </div>
                                    <span className="text-brand-amber text-xs font-extrabold uppercase tracking-widest mb-1">{num}</span>
                                    <h4
                                        className="text-brand-brown font-bold text-base mb-2"
                                        style={{ fontFamily: 'var(--font-baloo), sans-serif' }}
                                    >
                                        {title}
                                    </h4>
                                    <p className="text-brand-taupe text-xs leading-relaxed max-w-[150px]">{desc}</p>
                                </div>
                            ))}
                        </div>

                        {/* Mobile stacked */}
                        <div className="flex lg:hidden flex-col gap-0">
                            {STEPS.map(({ num, Icon, title, desc }, i) => (
                                <div key={num} className="flex gap-5 items-start">
                                    <div className="flex flex-col items-center shrink-0">
                                        <div className="w-12 h-12 rounded-full bg-brand-brown flex items-center justify-center shadow-soft">
                                            <Icon size={18} className="text-white" strokeWidth={1.6} />
                                        </div>
                                        {i < STEPS.length - 1 && (
                                            <div className="w-px flex-1 min-h-[40px] border-l-2 border-dashed border-brand-taupe/25 my-1" />
                                        )}
                                    </div>
                                    <div className="pb-8 pt-2">
                                        <span className="text-brand-amber text-[10px] font-extrabold uppercase tracking-widest">{num}</span>
                                        <h4
                                            className="text-brand-brown font-bold text-base mt-0.5 mb-1"
                                            style={{ fontFamily: 'var(--font-baloo), sans-serif' }}
                                        >
                                            {title}
                                        </h4>
                                        <p className="text-brand-taupe text-sm leading-relaxed">{desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ════════════════════════════════════════════════════════
                    4. FULL SERVICES GRID
                   ════════════════════════════════════════════════════════ */}
                <section className="py-20 px-4 sm:px-6 lg:px-8 bg-brand-cream-light">
                    <div className="max-w-6xl mx-auto">
                        <div className="text-center mb-14">
                            <span className="text-brand-amber text-xs font-bold uppercase tracking-widest">Everything Included</span>
                            <h2
                                className="text-brand-brown text-3xl sm:text-4xl font-bold mt-2 mb-3"
                                style={{ fontFamily: 'var(--font-baloo), sans-serif' }}
                            >
                                All Our Services
                            </h2>
                            <div className="w-10 h-1 bg-brand-yellow rounded-full mx-auto" />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
                            {ALL_SERVICES.map(({ Icon, title, desc, features, accent, bg }) => (
                                <div
                                    key={title}
                                    className="group bg-white rounded-2xl border border-brand-taupe/8 p-6 shadow-soft hover:shadow-medium hover:-translate-y-1 transition-all duration-300 flex flex-col gap-4"
                                >
                                    {/* Icon chip */}
                                    <div
                                        className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                                        style={{ backgroundColor: bg }}
                                    >
                                        <Icon size={22} style={{ color: accent }} strokeWidth={1.6} />
                                    </div>

                                    {/* Title + desc */}
                                    <div>
                                        <h3
                                            className="text-brand-brown font-bold text-lg mb-2"
                                            style={{ fontFamily: 'var(--font-baloo), sans-serif' }}
                                        >
                                            {title}
                                        </h3>
                                        <p className="text-brand-taupe text-sm leading-relaxed">{desc}</p>
                                    </div>

                                    {/* Feature bullets */}
                                    <ul className="flex flex-col gap-1.5 mt-auto pt-4 border-t border-brand-taupe/8">
                                        {features.map((f) => (
                                            <li key={f} className="flex items-center gap-2 text-xs text-brand-taupe">
                                                <CheckCircle2 size={13} style={{ color: accent }} className="shrink-0" />
                                                {f}
                                            </li>
                                        ))}
                                    </ul>

                                    {/* CTA */}
                                    <Link
                                        href="/enquiry"
                                        className="inline-flex items-center gap-1 text-xs font-semibold transition-colors mt-1"
                                        style={{ color: accent }}
                                    >
                                        Enquire Now <ArrowRight size={12} />
                                    </Link>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ════════════════════════════════════════════════════════
                    5. TRUST BADGES
                   ════════════════════════════════════════════════════════ */}
                <section className="bg-brand-cream py-14 px-4 sm:px-6 lg:px-8">
                    <div className="max-w-5xl mx-auto">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
                            {[
                                { Icon: Star, label: '4.9 / 5 Rating', sub: '200+ pet families' },
                                { Icon: Globe, label: '50+ Countries', sub: 'Destinations served' },
                                { Icon: ShieldCheck, label: 'IATA Certified', sub: 'Compliant crates & docs' },
                                { Icon: HeartPulse, label: '100% Safe Arrivals', sub: 'Zero incident record' },
                            ].map(({ Icon, label, sub }) => (
                                <div key={label} className="flex flex-col items-center gap-2">
                                    <div className="w-12 h-12 rounded-2xl bg-brand-brown/8 flex items-center justify-center">
                                        <Icon size={20} className="text-brand-brown" />
                                    </div>
                                    <span className="text-brand-brown font-bold text-sm">{label}</span>
                                    <span className="text-brand-taupe text-xs">{sub}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ════════════════════════════════════════════════════════
                    6. CTA BANNER
                   ════════════════════════════════════════════════════════ */}
                <section className="bg-brand-brown mx-4 sm:mx-6 lg:mx-8 mb-20 rounded-3xl overflow-hidden relative">
                    <div aria-hidden className="absolute inset-0 pointer-events-none">
                        <div className="absolute -top-20 -right-20 w-72 h-72 bg-brand-yellow/10 rounded-full blur-[80px]" />
                        <div className="absolute -bottom-10 -left-10 w-56 h-56 bg-brand-amber/10 rounded-full blur-[60px]" />
                    </div>
                    <div className="relative z-10 max-w-3xl mx-auto text-center px-6 py-16">
                        <h2
                            className="text-white text-3xl sm:text-4xl font-bold mb-4"
                            style={{ fontFamily: 'var(--font-baloo), sans-serif' }}
                        >
                            Ready to start your pet&apos;s journey?
                        </h2>
                        <p className="text-white/65 text-base mb-8 max-w-lg mx-auto">
                            Get a personalised relocation plan and quote from our Dubai team — no
                            obligation, fast response guaranteed.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link
                                href="/enquiry"
                                className="inline-flex items-center gap-2 bg-brand-amber text-white font-semibold px-8 py-4 rounded-xl shadow-glow-amber hover:bg-brand-amber-light transition-all duration-200 text-sm"
                            >
                                Start Your Enquiry <ArrowRight size={16} />
                            </Link>
                            <Link
                                href="/contact"
                                className="inline-flex items-center gap-2 border border-white/25 text-white/80 hover:text-white hover:border-white/50 font-medium px-8 py-4 rounded-xl transition-all duration-200 text-sm"
                            >
                                Contact Us
                            </Link>
                        </div>
                    </div>
                </section>

            </main>

            {/* ── FOOTER ─────────────────────────────────────────────── */}
            <Footer />

        </div>
    );
}
