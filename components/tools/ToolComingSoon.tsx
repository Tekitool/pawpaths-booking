'use client';

import React from 'react';
import {
    LucideIcon,
    Construction,
    Bell,
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
    Crop
} from 'lucide-react';

const iconMap: Record<string, LucideIcon> = {
    'Calculator': Calculator,
    'CircleDollarSign': CircleDollarSign,
    'ScanFace': ScanFace,
    'Globe2': Globe2,
    'CalendarClock': CalendarClock,
    'Plane': Plane,
    'ThermometerSun': ThermometerSun,
    'ScanBarcode': ScanBarcode,
    'FileCheck': FileCheck,
    'GraduationCap': GraduationCap,
    'PieChart': PieChart,
    'Crop': Crop,
    'Construction': Construction
};

interface ToolComingSoonProps {
    title: string;
    description: string;
    iconName: string;
}

export default function ToolComingSoon({ title, description, iconName }: ToolComingSoonProps) {
    const Icon = iconMap[iconName] || Construction;

    return (
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
            <div className="mb-8 flex justify-center">
                <div className="p-6 bg-primary/5 rounded-3xl border border-primary/10 shadow-glow-accent">
                    <Icon size={64} className="text-primary" strokeWidth={1.5} />
                </div>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-brand-text-02 mb-4 tracking-tight">
                {title}
            </h1>

            <p className="text-xl text-brand-text-02/60 mb-12 max-w-2xl mx-auto leading-relaxed">
                {description}
            </p>

            <div className="bg-white/60 backdrop-blur-xl rounded-3xl p-8 md:p-12 border border-white/50 shadow-level-3 max-w-2xl mx-auto relative overflow-hidden">
                {/* Decorative background elements */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-50" />
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/5 rounded-full blur-3xl" />
                <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-secondary/5 rounded-full blur-3xl" />

                <div className="relative z-10">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-surface-warm border border-brand-text-02/5 text-sm font-medium text-brand-text-02/60 mb-6">
                        <Construction size={16} />
                        <span>Work in Progress</span>
                    </div>

                    <h2 className="text-2xl font-bold text-brand-text-02 mb-2">Coming Soon</h2>
                    <p className="text-brand-text-02/60 mb-8">
                        We&apos;re putting the finishing touches on this tool. Get notified when it&apos;s ready!
                    </p>

                    <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                        <input
                            type="email"
                            placeholder="Enter your email address"
                            className="flex-1 px-5 py-3 rounded-xl bg-white border border-brand-text-02/10 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                        />
                        <button className="px-6 py-3 bg-brand-color-03 text-white font-bold rounded-xl hover:bg-brand-color-03/90 transition-all shadow-lg shadow-brand-color-03/20 active:scale-95 flex items-center justify-center gap-2">
                            <Bell size={18} />
                            Notify Me
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
