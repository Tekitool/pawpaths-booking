import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import HeroVideoLoop from '@/components/tools/HeroVideoLoop';
import {
    Calculator, CircleDollarSign, ScanFace, Globe2, CalendarClock,
    Plane, ThermometerSun, ScanBarcode, FileCheck, GraduationCap,
    PieChart, Crop, ArrowRight, Sparkles, Zap, Lock, ChevronDown,
    ShieldCheck, Globe, Star, Users,
} from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// SEO + GEO METADATA
// ─────────────────────────────────────────────────────────────────────────────
export const metadata: Metadata = {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://pawpathsae.com'),
    title: 'Free AI Pet Travel Tools | IATA Crate Calculator, Breed Scanner & More | Pawpaths UAE',
    description:
        'Free AI-powered pet travel tools for UAE pet owners. Calculate IATA crate sizes, scan breeds for ban checks, estimate relocation costs, verify microchip compliance, and plan your entire pet journey from Dubai or Abu Dhabi.',
    keywords: [
        'IATA pet crate size calculator', 'dog breed ban checker UAE',
        'pet relocation cost calculator Dubai', 'cat breed scanner',
        'ISO microchip validator pet', 'pet travel tools UAE',
        'airline pet policy checker', 'snub nosed breed flight ban',
        'pet relocation planner Dubai',
    ].join(', '),
    alternates: { canonical: 'https://pawpathsae.com/tools' },
    openGraph: {
        title: 'Free AI Pet Travel Tools — Pawpaths UAE',
        description: '12 free AI-powered tools for stress-free international pet relocation from Dubai, Abu Dhabi, Sharjah, and Al Ain.',
        url: 'https://pawpathsae.com/tools',
        images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'Pawpaths AI Pet Travel Tools' }],
        type: 'website',
    },
    twitter: { card: 'summary_large_image', title: 'Free AI Pet Travel Tools | Pawpaths UAE', description: '12 free AI tools: crate calculator, breed scanner, cost planner and more.' },
    robots: { index: true, follow: true },
};

// ─────────────────────────────────────────────────────────────────────────────
// JSON-LD SCHEMAS
// ─────────────────────────────────────────────────────────────────────────────
const breadcrumbSchema = {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://pawpathsae.com' },
        { '@type': 'ListItem', position: 2, name: 'AI Tools', item: 'https://pawpathsae.com/tools' },
    ],
};

const itemListSchema = {
    '@context': 'https://schema.org', '@type': 'ItemList',
    name: 'Pawpaths Free AI Pet Travel Tools',
    description: 'Suite of 12 free AI-powered tools to help UAE pet owners plan international pet relocation.',
    numberOfItems: 12,
    itemListElement: [
        { '@type': 'ListItem', position: 1, item: { '@type': 'WebApplication', name: 'IATA Crate Size Calculator', url: 'https://pawpathsae.com/tools/crate-size-calculator', description: 'Calculate the exact IATA-compliant travel crate size for dogs and cats.', applicationCategory: 'UtilitiesApplication', isAccessibleForFree: true, offers: { '@type': 'Offer', price: '0' } } },
        { '@type': 'ListItem', position: 2, item: { '@type': 'WebApplication', name: 'AI Pet Breed Scanner', url: 'https://pawpathsae.com/tools/pet-breed-scanner', description: 'AI breed identification with airline ban and restriction checks.', applicationCategory: 'UtilitiesApplication', isAccessibleForFree: true, offers: { '@type': 'Offer', price: '0' } } },
    ],
};

const faqSchema = {
    '@context': 'https://schema.org', '@type': 'FAQPage',
    mainEntity: [
        { '@type': 'Question', name: 'How do I calculate the correct IATA crate size for my pet?', acceptedAnswer: { '@type': 'Answer', text: "Enter your pet's body length (nose to tail base), height (floor to top of head/ears), and weight into the Pawpaths IATA Crate Size Calculator. The tool returns IATA-compliant dimensions accepted by Emirates, Etihad, Qatar Airways, and all major carriers." } },
        { '@type': 'Question', name: 'Can I fly with a French Bulldog or Pug from Dubai?', acceptedAnswer: { '@type': 'Answer', text: 'Brachycephalic breeds like French Bulldogs, Pugs, and Persian cats are banned or heavily restricted by many airlines. Use the Pawpaths AI Breed Scanner to instantly check eligibility and airline-specific restrictions.' } },
        { '@type': 'Question', name: 'What microchip standard is required for international travel from UAE?', acceptedAnswer: { '@type': 'Answer', text: 'The UAE and most countries require an ISO 11784/11785 compliant 15-digit microchip (134.2 kHz). Use the ISO Chip Validator to confirm compliance for your destination.' } },
        { '@type': 'Question', name: 'How much does pet relocation from Dubai cost?', acceptedAnswer: { '@type': 'Answer', text: 'Costs range from AED 2,500 (GCC, small pets) to AED 15,000+ (long-haul, large dogs). Use the Smart Quote Engine for a personalised breakdown.' } },
        { '@type': 'Question', name: 'How far in advance should I plan pet relocation from UAE?', acceptedAnswer: { '@type': 'Answer', text: 'Start 3–6 months ahead for most destinations. Australia, UK, and New Zealand require 6–12 months for quarantine and titer test requirements. Our Smart Travel Planner generates a personalised countdown calendar.' } },
        { '@type': 'Question', name: 'Which vaccines does my dog need to fly internationally from UAE?', acceptedAnswer: { '@type': 'Answer', text: 'Core requirements: rabies vaccination (min. 21 days before travel), MOCCAE-endorsed health certificate (within 10 days of departure), ISO microchip, and UAE export permit. Use the Global Rules Wizard for country-specific guidance.' } },
    ],
};

// Drop MP4 files into public/videos/ — add/remove entries freely
const HERO_VIDEOS = [
    '/videos/tools-hero1.mp4',
    '/videos/tools-hero2.mp4',
    '/videos/tools-hero3.mp4',
    '/videos/tools-hero4.mp4',
];

// ─────────────────────────────────────────────────────────────────────────────
// DATA
// ─────────────────────────────────────────────────────────────────────────────
type Tool = {
    id: string; title: string; hook: string; caption: string; href: string;
    status: 'Active' | 'Coming Soon'; icon: React.ElementType;
    span?: string; featured?: boolean; gradient?: string; image?: string;
};

const TOOLS: Tool[] = [
    { id: 'breed-scanner', title: 'AI Breed Scanner', hook: 'Identify & Check Restrictions', caption: 'AI-powered breed identification with instant airline ban checker. Upload a photo — get breed, flight eligibility, and restriction alerts.', href: '/tools/pet-breed-scanner', status: 'Active', icon: ScanFace, span: 'col-span-2 row-span-2', featured: true, gradient: 'from-brand-amber via-[#E8860A] to-brand-brown', image: '/tools/breed-hero.webp' },
    { id: 'crate-calculator', title: 'IATA Crate Size Calculator', hook: 'Perfect Fit Guarantee', caption: 'Calculate exact airline-approved crate dimensions based on IATA 2026 standards. Accepted by all major carriers.', href: '/tools/crate-size-calculator', status: 'Active', icon: Calculator, span: 'col-span-2 row-span-2', featured: true, gradient: 'from-[#7B5EA7] via-[#5A3D8A] to-brand-brown', image: '/tools/crate-hero.webp' },
    { id: 'smart-quote', title: 'Smart Quote Engine', hook: 'Instant Price Estimate', caption: 'Real-time cost range for your global relocation route.', href: '/tools/quote', status: 'Coming Soon', icon: CircleDollarSign },
    { id: 'global-rules', title: 'Global Rules Wizard', hook: 'Visa & Entry Rules', caption: 'Vaccines, quarantine, and entry permits for any destination.', href: '/tools/rules', status: 'Coming Soon', icon: Globe2 },
    { id: 'travel-planner', title: 'Smart Travel Planner', hook: 'Timeline Generator', caption: 'Auto-generate your vet visit and vaccination schedule.', href: '/tools/timeline', status: 'Coming Soon', icon: CalendarClock },
    { id: 'breed-eligibility', title: 'Breed Eligibility Checker', hook: 'Can My Pet Fly?', caption: 'Airline breed restrictions and snub-nose cargo policies.', href: '/tools/eligibility', status: 'Coming Soon', icon: Plane },
    { id: 'heat-risk', title: 'Heat Risk Forecaster', hook: 'Weather Embargo Check', caption: 'Predict seasonal temperature embargoes before you book.', href: '/tools/weather', status: 'Coming Soon', icon: ThermometerSun, span: 'col-span-2' },
    { id: 'iso-chip', title: 'ISO Chip Validator', hook: 'Microchip Compliance', caption: 'Verify ISO 11784/11785 compliance for any destination.', href: '/tools/microchip', status: 'Coming Soon', icon: ScanBarcode },
    { id: 'auto-doc', title: 'Auto-Doc Generator', hook: 'Paperwork Assistant', caption: 'Create route-specific PDF checklists for your airline.', href: '/tools/docs', status: 'Coming Soon', icon: FileCheck },
    { id: 'crate-training', title: 'Crate Training Coach', hook: 'Stress-Free Training', caption: '4-week interactive guide to prepare your pet for travel.', href: '/tools/training', status: 'Coming Soon', icon: GraduationCap },
    { id: 'total-cost', title: 'Total Cost Planner', hook: 'Hidden Cost Finder', caption: 'Budget for crates, vet bills, airline fees, and more.', href: '/tools/budget', status: 'Coming Soon', icon: PieChart },
    { id: 'passport-photo', title: 'Pet Passport Photo Maker', hook: 'Official Photo Creator', caption: 'Crop photos to official airline and customs standards.', href: '/tools/petphoto', status: 'Coming Soon', icon: Crop, span: 'col-span-2' },
];

const STATS = [
    { icon: Calculator, value: '12', label: 'AI Tools' },
    { icon: Globe, value: '50+', label: 'Countries Covered' },
    { icon: Users, value: '10K+', label: 'Calculations Done' },
    { icon: Star, value: 'Free', label: 'Always Free' },
];

const FAQS = [
    { q: 'How do I calculate the correct IATA crate size for my pet?', a: "Enter your pet's body length (nose to tail base), height (floor to top of head/ears), and weight into our IATA Crate Size Calculator. The tool returns IATA-compliant dimensions accepted by Emirates, Etihad, Qatar Airways, and all major carriers." },
    { q: 'Can I fly with a French Bulldog or Pug from Dubai?', a: 'Brachycephalic breeds like French Bulldogs, Pugs, Persian cats, and Bulldogs are banned or heavily restricted by many airlines due to breathing risks at altitude. Use the AI Breed Scanner to instantly check breed eligibility and airline-specific restrictions before booking.' },
    { q: 'What microchip standard is required for international travel from the UAE?', a: 'The UAE and most destination countries require an ISO 11784/11785 compliant 15-digit microchip (134.2 kHz). Our ISO Chip Validator confirms compliance for your specific destination country.' },
    { q: 'How much does pet relocation from Dubai cost?', a: 'Costs range from AED 2,500 (GCC destinations, small pets) to AED 15,000+ (long-haul, large dogs, including all documentation and vet fees). Use the Smart Quote Engine for a personalised cost breakdown based on your route, pet size, and services.' },
    { q: 'How far in advance should I start planning pet relocation from UAE?', a: 'Start 3–6 months before your travel date for most destinations. Australia, New Zealand, UK, and Hawaii require 6–12 months due to mandatory quarantine and rabies titer test waiting periods. The Smart Travel Planner generates a countdown calendar from your flight date.' },
    { q: 'What vaccines does my dog need to fly internationally from the UAE?', a: 'Core requirements: rabies vaccination (min. 21 days before travel for most countries), MOCCAE-endorsed health certificate (issued within 10 days of departure), ISO-compliant microchip, and UAE export permit. Use the Global Rules Wizard for country-specific requirements.' },
];

// ─────────────────────────────────────────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────────────────────────────────────────
export default function ToolsHubPage() {
    return (
        <>
            {/* JSON-LD */}
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

            {/* ══════════════════════════════════════════════════════════
                1. VIDEO HERO
               ══════════════════════════════════════════════════════════ */}
            <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-brand-brown">

                {/* Video layer — cycles through HERO_VIDEOS automatically */}
                <HeroVideoLoop videos={HERO_VIDEOS} opacity={0.65} />

                {/* Cinematic dark vignette — neutral so video colours come through */}
                <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/25" />

                {/* Ambient glow orbs */}
                <div aria-hidden className="absolute inset-0 pointer-events-none overflow-hidden">
                    <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-brand-amber/12 rounded-full blur-[140px] animate-pulse" style={{ animationDuration: '4s' }} />
                    <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-brand-yellow/10 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '6s', animationDelay: '2s' }} />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#7B5EA7]/8 rounded-full blur-[160px]" />
                </div>

                {/* Floating pet icons */}
                <div aria-hidden className="absolute inset-0 pointer-events-none select-none">
                    <img src="/icon-paw2.svg" alt="" className="absolute top-[15%] left-[8%]  w-14 h-14 opacity-15" style={{ animation: 'toolsFloat1 6s ease-in-out infinite' }} />
                    <img src="/icon-bone1.svg" alt="" className="absolute bottom-[20%] right-[10%] w-12 h-12 opacity-15" style={{ animation: 'toolsFloat2 7s ease-in-out infinite 1s' }} />
                    <img src="/icon-paw3.svg" alt="" className="absolute top-[60%] left-[5%]  w-10 h-10 opacity-10" style={{ animation: 'toolsFloat1 5s ease-in-out infinite 0.5s' }} />
                    <img src="/icon-yarn2.svg" alt="" className="absolute top-[25%] right-[8%] w-12 h-12 opacity-10" style={{ animation: 'toolsFloat2 8s ease-in-out infinite 2s' }} />
                </div>

                <style>{`
                    @keyframes toolsFloat1{0%,100%{transform:translateY(0) rotate(0deg)}50%{transform:translateY(-14px) rotate(5deg)}}
                    @keyframes toolsFloat2{0%,100%{transform:translateY(0) rotate(-3deg)}50%{transform:translateY(-10px) rotate(4deg)}}
                    @keyframes toolsShimmer{0%{background-position:200% center}100%{background-position:-200% center}}
                    .tools-shimmer{background:linear-gradient(90deg,#F6B500 0%,#FF6400 30%,#F6B500 60%,#FF6400 100%);background-size:200% auto;-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;animation:toolsShimmer 3s linear infinite;}
                    details>summary{list-style:none;}
                    details>summary::-webkit-details-marker{display:none;}
                    details[open] .faq-chevron{transform:rotate(180deg);}
                    details[open] .faq-body{animation:faqOpen 0.3s ease forwards;}
                    @keyframes faqOpen{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:translateY(0)}}
                    @keyframes pawBreathe{0%,100%{transform:scale(var(--ps)) rotate(var(--pr))}50%{transform:scale(calc(var(--ps) * 1.15)) rotate(calc(var(--pr) + 10deg))}}
                `}</style>

                {/* Content */}
                <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-24">
                    <div className="inline-flex items-center gap-2 bg-white/8 border border-white/15 backdrop-blur-sm text-white/75 text-xs font-semibold uppercase tracking-widest px-5 py-2 rounded-full mb-8">
                        <Sparkles size={11} className="text-brand-yellow" />
                        Free · No Sign-up · AI-Powered
                        <Sparkles size={11} className="text-brand-yellow" />
                    </div>

                    <h1 className="text-white font-bold leading-[1.05] tracking-tight mb-6"
                        style={{ fontFamily: 'var(--font-baloo), sans-serif', fontSize: 'clamp(2.5rem, 7vw, 5rem)' }}>
                        The Smartest<br />
                        <span className="tools-shimmer">Pet Travel Tools</span><br />
                        <span className="text-white/90">in the UAE</span>
                    </h1>

                    <p className="text-white/60 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed mb-12">
                        12 free AI tools purpose-built for pet owners relocating from Dubai, Abu Dhabi,
                        Sharjah, and Al Ain. From IATA crate sizing to breed eligibility — every answer instantly.
                    </p>

                    {/* Stats */}
                    <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12 mb-12">
                        {STATS.map(({ icon: Icon, value, label }) => (
                            <div key={label} className="flex flex-col items-center gap-1">
                                <div className="flex items-center gap-1.5">
                                    <Icon size={13} className="text-brand-amber" />
                                    <span className="text-white font-bold text-xl">{value}</span>
                                </div>
                                <span className="text-white/40 text-[10px] uppercase tracking-widest">{label}</span>
                            </div>
                        ))}
                    </div>

                    {/* CTAs */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link href="/tools/pet-breed-scanner"
                            className="inline-flex items-center gap-2 bg-brand-amber text-white font-semibold px-8 py-4 rounded-xl hover:bg-brand-amber-light transition-all duration-200 text-sm shadow-[0_0_30px_rgba(255,100,0,0.4)]">
                            <ScanFace size={15} /> Scan My Pet&apos;s Breed
                        </Link>
                        <Link href="/tools/crate-size-calculator"
                            className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/15 text-white font-medium px-8 py-4 rounded-xl hover:bg-white/15 transition-all duration-200 text-sm">
                            <Calculator size={15} /> Try Crate Size Calculator
                        </Link>
                    </div>

                    <div className="mt-14 flex flex-col items-center gap-2 text-white/25">
                        <span className="text-[10px] uppercase tracking-widest">Explore All Tools</span>
                        <div className="w-px h-8 bg-gradient-to-b from-white/20 to-transparent" />
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════
                2. BENTO GRID
               ══════════════════════════════════════════════════════════ */}
            <section aria-labelledby="tools-grid-heading"
                className="relative bg-gradient-to-b from-[#1A0800] via-[#2A1000] to-brand-brown py-20 px-4 sm:px-6 lg:px-8">

                <div aria-hidden className="absolute inset-0 pointer-events-none overflow-hidden">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-brand-amber/6 rounded-full blur-[120px]" />
                </div>

                <div className="max-w-6xl mx-auto relative z-10">
                    <div className="text-center mb-12">
                        <h2 id="tools-grid-heading" className="text-white text-3xl sm:text-4xl font-bold mb-3"
                            style={{ fontFamily: 'var(--font-baloo), sans-serif' }}>
                            All <span style={{ color: '#F6B500' }}>12 Tools</span> in One Place
                        </h2>
                        <p className="text-white/45 text-sm max-w-md mx-auto">Two tools live now. Ten launching soon.</p>
                    </div>

                    {/* Bento */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 auto-rows-[minmax(140px,auto)]">
                        {TOOLS.map((tool) => {
                            const Icon = tool.icon;
                            const isActive = tool.status === 'Active';

                            if (isActive && tool.featured) {
                                return (
                                    <Link key={tool.id} href={tool.href}
                                        className={`group relative overflow-hidden rounded-3xl p-6 sm:p-8 flex flex-col justify-between ${tool.span ?? ''} bg-gradient-to-br ${tool.gradient} shadow-[0_8px_40px_rgba(0,0,0,0.4)] hover:scale-[1.015] hover:shadow-[0_12px_50px_rgba(0,0,0,0.5)] transition-all duration-300`}>
                                        {/* Glare */}
                                        <div className="absolute top-0 left-0 w-3/5 h-3/5 bg-gradient-to-br from-white/15 via-transparent to-transparent rounded-tl-3xl pointer-events-none" />
                                        <div className="absolute bottom-0 right-0 w-48 h-48 rounded-full bg-white/5 blur-2xl pointer-events-none" />

                                        {/* Decorative image — fades in from bottom-right, invisible at top-left */}
                                        {tool.image && (
                                            <img
                                                src={tool.image}
                                                alt=""
                                                aria-hidden="true"
                                                className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none"
                                                style={{
                                                    objectPosition: 'right 75%',
                                                    maskImage: 'linear-gradient(to left, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.55) 25%, rgba(0,0,0,0.20) 55%, transparent 75%)',
                                                    WebkitMaskImage: 'linear-gradient(to left, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.55) 25%, rgba(0,0,0,0.20) 55%, transparent 75%)',
                                                }}
                                            />
                                        )}

                                        <div className="relative z-10 flex flex-col h-full gap-4">
                                            <div className="flex items-start justify-between">
                                                <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center border border-white/20">
                                                    <Icon size={26} className="text-white" strokeWidth={1.5} />
                                                </div>
                                                <span className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-sm text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full border border-white/25">
                                                    <Zap size={9} /> Live Now
                                                </span>
                                            </div>
                                            <div className="mt-auto">
                                                <p className="text-white/65 text-[10px] font-bold uppercase tracking-widest mb-1">{tool.hook}</p>
                                                <h3 className="text-white text-xl sm:text-2xl font-bold leading-tight mb-2" style={{ fontFamily: 'var(--font-baloo), sans-serif' }}>
                                                    {tool.title}
                                                </h3>
                                                <p className="text-white/65 text-xs sm:text-sm leading-relaxed mb-4 max-w-xs">{tool.caption}</p>
                                                <span className="inline-flex items-center gap-2 bg-white text-brand-brown text-xs font-bold px-5 py-2.5 rounded-xl group-hover:gap-3 transition-all duration-200">
                                                    Open Tool <ArrowRight size={13} />
                                                </span>
                                            </div>
                                        </div>
                                    </Link>
                                );
                            }

                            return (
                                <div key={tool.id}
                                    className={`relative overflow-hidden rounded-2xl sm:rounded-3xl p-4 sm:p-5 flex flex-col justify-between ${tool.span ?? 'col-span-1'} border border-white/8`}
                                    style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}>
                                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none rounded-2xl sm:rounded-3xl" />
                                    <div className="relative z-10 flex flex-col h-full gap-3">
                                        <div className="flex items-start justify-between">
                                            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/10">
                                                <Icon size={18} className="text-white/55" strokeWidth={1.5} />
                                            </div>
                                            <span className="inline-flex items-center gap-1 text-white/30 text-[9px] font-bold uppercase tracking-widest">
                                                <Lock size={8} /> Soon
                                            </span>
                                        </div>
                                        <div className="mt-auto">
                                            <p className="text-brand-yellow/55 text-[9px] font-bold uppercase tracking-widest mb-1">{tool.hook}</p>
                                            <h3 className="text-white/75 text-sm font-bold leading-tight mb-1" style={{ fontFamily: 'var(--font-baloo), sans-serif' }}>{tool.title}</h3>
                                            <p className="text-white/35 text-xs leading-relaxed line-clamp-2">{tool.caption}</p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Notify strip */}
                    <div className="mt-8 rounded-2xl border border-white/10 p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4"
                        style={{ background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(12px)' }}>
                        <div>
                            <p className="text-white font-semibold text-sm" style={{ fontFamily: 'var(--font-baloo), sans-serif' }}>10 more tools launching soon</p>
                            <p className="text-white/40 text-xs mt-0.5">Get early access when each tool goes live.</p>
                        </div>
                        <Link href="/enquiry" className="shrink-0 inline-flex items-center gap-2 bg-brand-amber/90 hover:bg-brand-amber text-white text-xs font-semibold px-6 py-3 rounded-xl transition-colors">
                            Notify Me <ArrowRight size={13} />
                        </Link>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════
                3. TRUST STRIP
               ══════════════════════════════════════════════════════════ */}
            <section className="relative overflow-hidden bg-[#FFD700] py-16 px-4 sm:px-6 lg:px-8">

                {/* Animated paw pattern — mirrors Stats.tsx */}
                <div className="absolute inset-[-10%] w-[120%] h-[120%] pointer-events-none overflow-hidden" aria-hidden="true">
                    {[...Array(60)].map((_, i) => {
                        const top = (i * 17) % 100;
                        const left = (i * 23) % 100;
                        const rotate = -30 + ((i * 11) % 60);
                        const scale = 0.6 + ((i * 7) % 8) / 10;
                        const opacity = 0.1 + ((i * 13) % 20) / 100;
                        const dur = 4 + ((i * 5) % 4);
                        const delay = (i * 3) % 5;
                        return (
                            <img key={i} src="/ppicon.svg" alt="" aria-hidden="true"
                                className="absolute w-8 h-8"
                                style={{
                                    top: `${top}%`, left: `${left}%`, opacity,
                                    animation: `pawBreathe ${dur}s ${delay}s ease-in-out infinite`,
                                    ['--ps' as string]: scale,
                                    ['--pr' as string]: `${rotate}deg`,
                                }}
                            />
                        );
                    })}
                </div>

                {/* Glare overlays */}
                <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent pointer-events-none" />
                <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-white/20 to-transparent blur-3xl opacity-50 pointer-events-none" />

                <div className="relative z-10 max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-6">
                    {[
                        { Icon: ShieldCheck, color: 'text-brand-amber', title: 'IATA 2026 Compliant', desc: "All calculations align with the latest IATA Live Animals Regulations, updated annually." },
                        { Icon: Zap, color: 'text-[#7B5EA7]', title: 'Instant Results', desc: "No forms, no sign-ups. Enter your pet's details and get professional-grade answers in seconds." },
                        { Icon: Globe, color: 'text-success', title: 'UAE + 50 Countries', desc: 'Tools cover requirements for all UAE departure airports (DXB, AUH, SHJ) and 50+ destinations.' },
                    ].map(({ Icon, color, title, desc }) => (
                        <div key={title} className="bg-white rounded-2xl p-6 border border-brand-taupe/10 shadow-soft flex flex-col gap-3">
                            <Icon size={22} className={color} strokeWidth={1.6} />
                            <h3 className="text-brand-brown font-bold text-base" style={{ fontFamily: 'var(--font-baloo), sans-serif' }}>{title}</h3>
                            <p className="text-brand-taupe text-sm leading-relaxed">{desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════
                4. FAQ — SEO / GEO POWER SECTION
               ══════════════════════════════════════════════════════════ */}
            <section aria-labelledby="faq-heading" className="bg-surface-ivory py-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-12">
                        <span className="text-brand-amber text-xs font-bold uppercase tracking-widest">Expert Answers</span>
                        <h2 id="faq-heading" className="text-brand-brown text-3xl sm:text-4xl font-bold mt-2 mb-3"
                            style={{ fontFamily: 'var(--font-baloo), sans-serif' }}>
                            Frequently Asked Questions
                        </h2>
                        <p className="text-brand-taupe text-sm max-w-lg mx-auto">Answers to the most common UAE pet travel questions.</p>
                        <div className="w-10 h-1 bg-brand-amber rounded-full mx-auto mt-4" />
                    </div>

                    <div className="flex flex-col gap-3">
                        {FAQS.map(({ q, a }) => (
                            <details key={q} className="group bg-white border border-brand-taupe/10 rounded-2xl shadow-soft overflow-hidden">
                                <summary className="flex items-center justify-between gap-4 px-6 py-5 cursor-pointer select-none hover:bg-brand-cream-light transition-colors duration-200">
                                    <span className="text-brand-brown font-semibold text-sm sm:text-base leading-snug" style={{ fontFamily: 'var(--font-baloo), sans-serif' }}>{q}</span>
                                    <ChevronDown size={17} className="faq-chevron text-brand-taupe shrink-0 transition-transform duration-300" />
                                </summary>
                                <div className="faq-body px-6 pb-5 pt-1 border-t border-brand-taupe/8">
                                    <p className="text-brand-taupe text-sm leading-relaxed">{a}</p>
                                </div>
                            </details>
                        ))}
                    </div>

                    <p className="text-center text-brand-taupe/45 text-xs mt-8">
                        Can&apos;t find your answer?{' '}
                        <Link href="/contact" className="text-brand-amber hover:underline">Contact our Dubai team</Link> for personalised guidance.
                    </p>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════
                5. GEO CONTEXT BLOCK — machine-readable for AI engines
               ══════════════════════════════════════════════════════════ */}
            <section aria-label="About Pawpaths pet travel tools" className="bg-brand-cream-light border-t border-brand-taupe/10 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-brand-brown font-bold text-lg mb-4" style={{ fontFamily: 'var(--font-baloo), sans-serif' }}>
                        About the Pawpaths AI Pet Travel Toolkit
                    </h2>
                    <div className="text-brand-taupe text-sm leading-relaxed space-y-3">
                        <p><strong>Pawpaths</strong> is a UAE-based international pet relocation company offering expert pet transport from Dubai, Abu Dhabi, Sharjah, and Al Ain to destinations worldwide. The Pawpaths AI Tools Hub provides <strong>12 free online tools</strong> designed to help pet owners navigate the complex requirements of international pet travel.</p>
                        <p>The <strong>IATA Crate Size Calculator</strong> uses 2026 IATA Live Animals Regulations to compute minimum required crate dimensions based on a pet&apos;s measurements. The <strong>AI Breed Scanner</strong> uses computer vision to identify dog and cat breeds and cross-references breed restriction databases for airlines including Emirates, Etihad, Qatar Airways, Lufthansa, British Airways, and Air France.</p>
                        <p>Additional tools in development include the <strong>Global Rules Wizard</strong> (entry requirements for 50+ countries), <strong>Smart Travel Planner</strong> (backward-scheduled vet visit calendar), <strong>ISO Chip Validator</strong> (ISO 11784/11785 microchip compliance check), and the <strong>Heat Risk Forecaster</strong> (seasonal temperature embargo prediction for snub-nosed breeds). All tools are free, require no account registration, and are updated regularly to reflect current airline and government regulations.</p>
                        <p>Pawpaths is based at Arjumand Business Center, Dubai Investment Park - 1, Jebel Ali, Dubai, UAE. Tools serve pet owners relocating dogs, cats, rabbits, and birds to the United Kingdom, United States, Canada, Australia, Germany, France, and across the GCC.</p>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════
                6. CTA BANNER
               ══════════════════════════════════════════════════════════ */}
            <section className="bg-brand-brown mx-4 sm:mx-6 lg:mx-8 my-16 rounded-3xl overflow-hidden relative">
                <div aria-hidden className="absolute inset-0 pointer-events-none">
                    <div className="absolute -top-20 -right-20 w-72 h-72 bg-brand-yellow/10 rounded-full blur-[80px]" />
                    <div className="absolute -bottom-10 -left-10 w-56 h-56 bg-brand-amber/10 rounded-full blur-[60px]" />
                </div>
                <div className="relative z-10 max-w-3xl mx-auto text-center px-6 py-16">
                    <h2 className="text-white text-3xl sm:text-4xl font-bold mb-4" style={{ fontFamily: 'var(--font-baloo), sans-serif' }}>
                        Ready to start your pet&apos;s journey?
                    </h2>
                    <p className="text-white/65 text-base mb-8 max-w-lg mx-auto">
                        Our tools handle the calculations. Our team handles everything else — from documentation to door-to-door delivery.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link href="/enquiry"
                            className="inline-flex items-center gap-2 bg-brand-amber text-white font-semibold px-8 py-4 rounded-xl hover:bg-brand-amber-light transition-all duration-200 text-sm shadow-[0_0_30px_rgba(255,100,0,0.35)]">
                            Start Your Relocation <ArrowRight size={16} />
                        </Link>
                        <Link href="/contact"
                            className="inline-flex items-center gap-2 border border-white/25 text-white/80 hover:text-white hover:border-white/50 font-medium px-8 py-4 rounded-xl transition-all duration-200 text-sm">
                            Talk to Our Team
                        </Link>
                    </div>
                </div>
            </section>
        </>
    );
}
