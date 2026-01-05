import React from 'react';
import Link from 'next/link';
import {
    Calculator,
    CircleDollarSign,
    ScanFace,
    Globe2,
    CalendarClock,
    Plane,
    ThermometerSun,
    ScanBarcode,
    FileCheck,
    GraduationCap,
    PieChart,
    Crop,
    ArrowRight
} from 'lucide-react';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Tools Hub | Pawpaths',
    description: 'Essential Pet Relocation Tools',
};

const tools = [
    {
        id: 'crate-calculator',
        title: 'Crate Size Calculator',
        icon: Calculator,
        href: '/tools/crate',
        hook: 'Perfect Fit Guarantee',
        caption: "Calculate the exact airline-approved crate size for your pet's flight.",
        status: 'Active',
        bgClass: 'bg-surface-warm',
    },
    {
        id: 'breed-scanner',
        title: 'Breed Scanner',
        icon: ScanFace,
        href: '/tools/breed',
        hook: 'Identify Your Breed',
        caption: "AI-powered scan to identify breeds for accurate paperwork and ban checks.",
        status: 'Active',
        bgClass: 'bg-surface-silk',
    },
    {
        id: 'smart-quote',
        title: 'Smart Quote Engine',
        icon: CircleDollarSign,
        href: '/tools/quote',
        hook: 'Instant Price Estimate',
        caption: "Get a real-time cost range breakdown for your global relocation.",
        status: 'Coming Soon',
        bgClass: 'bg-surface-mint',
    },
    {
        id: 'global-rules',
        title: 'Global Rules Wizard',
        icon: Globe2,
        href: '/tools/rules',
        hook: 'Visa & Entry Rules',
        caption: "Instant check for vaccines, quarantine, and permits for any country.",
        status: 'Coming Soon',
        bgClass: 'bg-surface-sky',
    },
    {
        id: 'travel-planner',
        title: 'Smart Travel Planner',
        icon: CalendarClock,
        href: '/tools/timeline',
        hook: 'Timeline Generator',
        caption: "Auto-generate your vet visits and vaccination schedule backwards from flight day.",
        status: 'Coming Soon',
        bgClass: 'bg-surface-fresh',
    },
    {
        id: 'breed-eligibility',
        title: 'Breed Eligibility Checker',
        icon: Plane,
        href: '/tools/eligibility',
        hook: 'Can My Pet Fly?',
        caption: "Instantly check airline breed restrictions and cargo policies.",
        status: 'Coming Soon',
        bgClass: 'bg-surface-cool',
    },
    {
        id: 'heat-risk',
        title: 'Heat Risk Forecaster',
        icon: ThermometerSun,
        href: '/tools/weather',
        hook: 'Weather Embargo Check',
        caption: "Avoid flight rejections by predicting seasonal temperature embargoes.",
        status: 'Coming Soon',
        bgClass: 'bg-surface-peach',
    },
    {
        id: 'iso-chip',
        title: 'ISO Chip Validator',
        icon: ScanBarcode,
        href: '/tools/microchip',
        hook: 'Microchip Compliance',
        caption: "Verify your pet's microchip meets international ISO travel standards.",
        status: 'Coming Soon',
        bgClass: 'bg-surface-pearl',
    },
    {
        id: 'auto-doc',
        title: 'Auto-Doc Generator',
        icon: FileCheck,
        href: '/tools/docs',
        hook: 'Paperwork Assistant',
        caption: "Create customized PDF checklists for your specific route and airline.",
        status: 'Coming Soon',
        bgClass: 'bg-surface-ivory',
    },
    {
        id: 'crate-training',
        title: 'Crate Training Coach',
        icon: GraduationCap,
        href: '/tools/training',
        hook: 'Stress-Free Training',
        caption: "A 4-week interactive guide to prepare your pet for the crate.",
        status: 'Coming Soon',
        bgClass: 'bg-surface-warm',
    },
    {
        id: 'total-cost',
        title: 'Total Cost Planner',
        icon: PieChart,
        href: '/tools/budget',
        hook: 'Hidden Cost Finder',
        caption: "Budget for crates, vet bills, airline fees, and airport parking.",
        status: 'Coming Soon',
        bgClass: 'bg-surface-mint',
    },
    {
        id: 'passport-photo',
        title: 'Pet Passport Photo Maker',
        icon: Crop,
        href: '/tools/petphoto',
        hook: 'Official Photo Creator',
        caption: "Crop and format your pet's photo to meet official airline and customs standards.",
        status: 'Coming Soon',
        bgClass: 'bg-surface-silk',
    },
];

export default function ToolsHubPage() {
    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            {/* Header */}
            <div className="text-center mb-16">
                <h1 className="text-4xl md:text-5xl font-bold text-brand-text-02 mb-6 tracking-tight">
                    Essential Pet Relocation Tools
                </h1>
                <p className="text-xl text-brand-text-02/60 max-w-3xl mx-auto leading-relaxed">
                    Everything you need to plan your pet&apos;s journey, from crate sizing to budget planning.
                </p>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {tools.map((tool) => (
                    <Link
                        key={tool.id}
                        href={tool.href}
                        className={`
                group relative ${tool.bgClass} backdrop-blur-sm rounded-3xl p-6 
                border border-brand-text-02/10 shadow-sm 
                hover:shadow-lg hover:-translate-y-1
                transition-all duration-300 flex flex-col h-full
                overflow-hidden
              `}
                    >
                        {/* Hover Gradient Background */}
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                        <div className="relative z-10 flex flex-col h-full">
                            <div className="flex justify-between items-start mb-6">
                            </div>

                            <div className="mb-auto">
                                <div className="text-[10px] font-bold text-primary uppercase tracking-wider mb-2 opacity-80">
                                    {tool.hook}
                                </div>
                                <h3 className="text-base font-bold text-brand-text-02 mb-2 leading-tight group-hover:text-primary transition-colors">
                                    {tool.title}
                                </h3>
                                <p className="text-xs text-brand-text-02/60 leading-relaxed">
                                    {tool.caption}
                                </p>
                            </div>

                            <div className="mt-6 flex items-center text-[10px] font-bold text-brand-text-02/40 group-hover:text-primary transition-colors uppercase tracking-wide">
                                {tool.status === 'Active' ? 'Open Tool' : 'Notify Me'}
                                <ArrowRight size={14} className="ml-2 group-hover:translate-x-1 transition-transform" />
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
