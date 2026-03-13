import type { Metadata } from 'next';
import Link from 'next/link';
import {
    Globe,
    FileText,
    Plane,
    Home,
    ShieldCheck,
    Zap,
    Syringe,
    MapPin,
    Package,
    Clock,
    Star,
    ArrowRight,
    Check,
    Box,
} from 'lucide-react';
import NavBar from '@/components/layouts/NavBar';
import Footer from '@/components/layouts/Footer';

// ─────────────────────────────────────────────────────────────────────────────
// METADATA
// ─────────────────────────────────────────────────────────────────────────────
export const metadata: Metadata = {
    title: 'Products & Packages | Pawpaths',
    description:
        'Choose from our curated pet relocation packages and add-on services. Essentials to Elite — every journey covered.',
    alternates: { canonical: 'https://pawpathsae.com/products' },
    openGraph: {
        title: 'Pet Relocation Packages | Pawpaths UAE',
        description:
            'Flexible relocation packages for every pet owner in the UAE. Documentation, airline coordination, and door-to-door delivery.',
        url: 'https://pawpathsae.com/products',
    },
};

// ─────────────────────────────────────────────────────────────────────────────
// DATA
// ─────────────────────────────────────────────────────────────────────────────
const PACKAGES = [
    {
        id: 'essentials',
        name: 'Essentials',
        tagline: 'For the confident pet owner',
        price: 'From 799',
        currency: 'AED',
        badge: null,
        accent: 'border-brand-taupe/30',
        headerBg: 'bg-brand-cream',
        headerText: 'text-brand-brown',
        priceText: 'text-brand-brown',
        features: [
            'IATA crate size consultation',
            'Health certificate checklist',
            'Export documentation guide',
            'Microchip registration support',
            'Email support (48h response)',
        ],
        cta: 'Get Started',
        ctaStyle:
            'border-2 border-brand-brown text-brand-brown hover:bg-brand-brown hover:text-white',
    },
    {
        id: 'premium',
        name: 'Premium',
        tagline: 'Our most popular choice',
        price: 'From 2,499',
        currency: 'AED',
        badge: 'Most Popular',
        accent: 'border-brand-amber',
        headerBg: 'bg-brand-brown',
        headerText: 'text-white',
        priceText: 'text-brand-amber',
        features: [
            'Everything in Essentials',
            'Full document preparation & filing',
            'Airline booking & coordination',
            'Export permit application',
            'Pre-travel vet checklist',
            'WhatsApp support (24h response)',
        ],
        cta: 'Choose Premium',
        ctaStyle: 'bg-brand-amber text-white hover:bg-brand-amber-light',
    },
    {
        id: 'elite',
        name: 'Elite',
        tagline: 'White-glove VIP experience',
        price: 'From 4,999',
        currency: 'AED',
        badge: 'VIP',
        accent: 'border-brand-yellow',
        headerBg: 'bg-gradient-to-br from-brand-brown to-brand-taupe',
        headerText: 'text-white',
        priceText: 'text-brand-yellow',
        features: [
            'Everything in Premium',
            'Door-to-door pickup & delivery',
            'Live flight tracking',
            'Airport meet & greet (origin)',
            'Destination agent handover',
            'Post-arrival wellness check-in',
            'Dedicated account manager',
            'Priority 4h WhatsApp response',
        ],
        cta: 'Go Elite',
        ctaStyle:
            'bg-gradient-to-r from-brand-yellow to-brand-amber text-brand-brown font-bold hover:opacity-90',
    },
];

const ADDONS = [
    {
        icon: Box,
        name: 'IATA-Approved Travel Crate',
        desc: 'Airline-compliant crate sourced and delivered to your door. Sized precisely for your pet.',
        price: 'From 350 AED',
    },
    {
        icon: ShieldCheck,
        name: 'Pet Travel Insurance',
        desc: 'Comprehensive in-transit coverage for accidents, illness, and delays during relocation.',
        price: 'From 199 AED',
    },
    {
        icon: Syringe,
        name: 'Rabies Titer Test Coordination',
        desc: 'End-to-end arrangement with accredited UAE labs — critical for EU and many destinations.',
        price: 'From 450 AED',
    },
    {
        icon: MapPin,
        name: 'Airport Meet & Greet',
        desc: 'A Pawpaths agent meets you at the airport, handles check-in, and ensures smooth boarding.',
        price: 'From 500 AED',
    },
    {
        icon: Clock,
        name: 'Express Document Processing',
        desc: 'Rush processing on all permits and certificates — ideal for last-minute relocations.',
        price: 'From 299 AED',
    },
    {
        icon: Package,
        name: 'Custom Pet Travel Kit',
        desc: 'Curated kit with travel bowls, calming treats, absorbent mats, and ID tags for the journey.',
        price: 'From 149 AED',
    },
];

const WHY_ITEMS = [
    { icon: Globe,      label: '50+ Countries',    desc: 'Destinations served worldwide' },
    { icon: Zap,        label: 'AI-Powered Tools', desc: 'Crate calculator & breed scanner' },
    { icon: FileText,   label: 'All Docs Handled', desc: 'Permits, certs & passports' },
    { icon: Plane,      label: 'Airline Partners',  desc: 'Vetted pet-friendly carriers' },
    { icon: Home,       label: 'Door-to-Door',      desc: 'UAE pickup to world delivery' },
    { icon: Star,       label: '4.9 / 5 Rating',   desc: 'From 200+ happy pet families' },
];

// ─────────────────────────────────────────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────────────────────────────────────────
export default function ProductsPage() {
    return (
        <div className="min-h-screen flex flex-col bg-surface-ivory">

            {/* ── NAVBAR ──────────────────────────────────────────────── */}
            <NavBar />

            <main className="flex-1">

                {/* ── HERO ─────────────────────────────────────────────── */}
                <section className="relative bg-brand-brown overflow-hidden pt-20 pb-24 px-4 sm:px-6 lg:px-8">
                    {/* Background glows */}
                    <div aria-hidden className="absolute inset-0 pointer-events-none">
                        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-amber/10 rounded-full blur-[120px]" />
                        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-brand-yellow/8 rounded-full blur-[100px]" />
                    </div>

                    <div className="relative z-10 max-w-4xl mx-auto text-center">
                        {/* Eyebrow */}
                        <span className="inline-flex items-center gap-2 bg-brand-amber/15 border border-brand-amber/30 text-brand-amber text-xs font-semibold uppercase tracking-widest px-4 py-1.5 rounded-full mb-6">
                            <Star size={12} fill="currentColor" />
                            Tailored for every pet family
                        </span>

                        <h1 className="text-white text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight tracking-tight mb-6" style={{ fontFamily: 'var(--font-baloo), sans-serif' }}>
                            Products &amp;{' '}
                            <span className="text-brand-yellow">Packages</span>
                        </h1>

                        <p className="text-white/70 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed mb-10">
                            Whether you need essential guidance or a full white-glove relocation,
                            we have a package built for your pet&apos;s journey. All packages are
                            fully customisable.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link
                                href="/enquiry"
                                className="inline-flex items-center gap-2 bg-brand-amber text-white font-semibold px-7 py-3.5 rounded-xl shadow-glow-amber hover:bg-brand-amber-light transition-all duration-200"
                            >
                                Get a Custom Quote <ArrowRight size={16} />
                            </Link>
                            <Link
                                href="/tools"
                                className="inline-flex items-center gap-2 border border-white/20 text-white/80 hover:text-white hover:border-white/40 font-medium px-7 py-3.5 rounded-xl transition-all duration-200"
                            >
                                Try Free Tools
                            </Link>
                        </div>
                    </div>
                </section>

                {/* ── PACKAGES ─────────────────────────────────────────── */}
                <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                    <div className="text-center mb-14">
                        <h2 className="text-brand-brown text-3xl sm:text-4xl font-bold mb-3" style={{ fontFamily: 'var(--font-baloo), sans-serif' }}>
                            Relocation Packages
                        </h2>
                        <p className="text-brand-taupe text-base max-w-xl mx-auto">
                            Three tiers designed to match every budget and journey complexity.
                        </p>
                        <div className="w-12 h-1 bg-brand-amber rounded-full mx-auto mt-4" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-start">
                        {PACKAGES.map((pkg) => (
                            <div
                                key={pkg.id}
                                className={`relative flex flex-col rounded-3xl border-2 ${pkg.accent} overflow-hidden shadow-soft hover:shadow-medium transition-shadow duration-300`}
                            >
                                {/* Badge */}
                                {pkg.badge && (
                                    <div className="absolute top-4 right-4 z-10">
                                        <span className="bg-brand-amber text-white text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">
                                            {pkg.badge}
                                        </span>
                                    </div>
                                )}

                                {/* Card header */}
                                <div className={`${pkg.headerBg} px-7 pt-8 pb-7`}>
                                    <h3 className={`${pkg.headerText} text-2xl font-bold mb-1`} style={{ fontFamily: 'var(--font-baloo), sans-serif' }}>
                                        {pkg.name}
                                    </h3>
                                    <p className={`${pkg.headerText} opacity-70 text-sm`}>
                                        {pkg.tagline}
                                    </p>
                                    <div className="mt-5 flex items-baseline gap-1">
                                        <span className={`${pkg.priceText} text-3xl font-bold`}>
                                            {pkg.price}
                                        </span>
                                        <span className={`${pkg.headerText} opacity-60 text-sm`}>
                                            {pkg.currency}
                                        </span>
                                    </div>
                                </div>

                                {/* Features */}
                                <div className="bg-white flex-1 px-7 py-6 flex flex-col gap-6">
                                    <ul className="space-y-3">
                                        {pkg.features.map((f) => (
                                            <li key={f} className="flex items-start gap-3 text-sm text-brand-taupe">
                                                <Check size={16} className="text-success mt-0.5 shrink-0" />
                                                {f}
                                            </li>
                                        ))}
                                    </ul>

                                    <Link
                                        href="/enquiry"
                                        className={`mt-auto block text-center text-sm font-semibold py-3 px-5 rounded-xl transition-all duration-200 ${pkg.ctaStyle}`}
                                    >
                                        {pkg.cta}
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>

                    <p className="text-center text-brand-taupe/60 text-xs mt-8">
                        All prices are indicative. Final pricing depends on destination, pet size, and selected services.{' '}
                        <Link href="/enquiry" className="text-brand-amber hover:underline">Contact us</Link> for a precise quote.
                    </p>
                </section>

                {/* ── WHY PAWPATHS STRIP ───────────────────────────────── */}
                <section className="bg-brand-cream py-16 px-4 sm:px-6 lg:px-8">
                    <div className="max-w-5xl mx-auto">
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
                            {WHY_ITEMS.map(({ icon: Icon, label, desc }) => (
                                <div key={label} className="flex flex-col items-center text-center gap-2">
                                    <div className="w-11 h-11 rounded-2xl bg-brand-brown/10 flex items-center justify-center mb-1">
                                        <Icon size={20} className="text-brand-brown" />
                                    </div>
                                    <span className="text-brand-brown font-bold text-sm">{label}</span>
                                    <span className="text-brand-taupe text-xs leading-snug">{desc}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── ADD-ONS ──────────────────────────────────────────── */}
                <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                    <div className="text-center mb-14">
                        <h2 className="text-brand-brown text-3xl sm:text-4xl font-bold mb-3" style={{ fontFamily: 'var(--font-baloo), sans-serif' }}>
                            Individual Add-ons
                        </h2>
                        <p className="text-brand-taupe text-base max-w-xl mx-auto">
                            Customise any package or purchase standalone services à la carte.
                        </p>
                        <div className="w-12 h-1 bg-brand-yellow rounded-full mx-auto mt-4" />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {ADDONS.map(({ icon: Icon, name, desc, price }) => (
                            <div
                                key={name}
                                className="group bg-white border border-brand-taupe/10 rounded-2xl p-6 shadow-soft hover:shadow-medium hover:-translate-y-1 transition-all duration-300 flex flex-col gap-4"
                            >
                                <div className="w-10 h-10 rounded-xl bg-brand-cream flex items-center justify-center shrink-0">
                                    <Icon size={20} className="text-brand-brown group-hover:text-brand-amber transition-colors duration-200" />
                                </div>
                                <div>
                                    <h3 className="text-brand-brown font-bold text-base mb-1" style={{ fontFamily: 'var(--font-baloo), sans-serif' }}>
                                        {name}
                                    </h3>
                                    <p className="text-brand-taupe text-sm leading-relaxed">{desc}</p>
                                </div>
                                <div className="flex items-center justify-between mt-auto pt-4 border-t border-brand-taupe/10">
                                    <span className="text-brand-amber font-semibold text-sm">{price}</span>
                                    <Link
                                        href="/enquiry"
                                        className="text-xs font-semibold text-brand-brown hover:text-brand-amber transition-colors flex items-center gap-1"
                                    >
                                        Add to order <ArrowRight size={12} />
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* ── CTA BANNER ───────────────────────────────────────── */}
                <section className="bg-brand-brown mx-4 sm:mx-6 lg:mx-8 mb-20 rounded-3xl overflow-hidden relative">
                    <div aria-hidden className="absolute inset-0 pointer-events-none">
                        <div className="absolute -top-20 -right-20 w-72 h-72 bg-brand-yellow/10 rounded-full blur-[80px]" />
                        <div className="absolute -bottom-10 -left-10 w-56 h-56 bg-brand-amber/10 rounded-full blur-[60px]" />
                    </div>
                    <div className="relative z-10 max-w-3xl mx-auto text-center px-6 py-16">
                        <h2 className="text-white text-3xl sm:text-4xl font-bold mb-4" style={{ fontFamily: 'var(--font-baloo), sans-serif' }}>
                            Not sure which package is right?
                        </h2>
                        <p className="text-white/70 text-base mb-8 max-w-lg mx-auto">
                            Tell us about your pet, your destination, and your timeline — we&apos;ll
                            recommend the perfect solution at no obligation.
                        </p>
                        <Link
                            href="/enquiry"
                            className="inline-flex items-center gap-2 bg-brand-amber text-white font-semibold px-8 py-4 rounded-xl shadow-glow-amber hover:bg-brand-amber-light transition-all duration-200 text-sm"
                        >
                            Start Your Journey <ArrowRight size={16} />
                        </Link>
                    </div>
                </section>

            </main>

            {/* ── FOOTER ───────────────────────────────────────────────── */}
            <Footer />

        </div>
    );
}
