'use client';

import React, { useState } from 'react';
import { PawPrint, Globe, FileText, Users, Settings, Ruler } from 'lucide-react';
import TaxonomyManagerModal from '../master-data/TaxonomyManagerModal';
import CountryManagerModal from '../master-data/CountryManagerModal';
import CrateCalculatorDialog from '../tools/CrateCalculatorDialog';

export default function QuickActions() {
    const [showTaxonomyModal, setShowTaxonomyModal] = useState(false);
    const [showCountryModal, setShowCountryModal] = useState(false);
    const [showCrateCalculator, setShowCrateCalculator] = useState(false);

    const actions = [
        {
            label: 'Manage Taxonomy',
            description: 'Species & Breeds',
            icon: PawPrint,
            onClick: () => setShowTaxonomyModal(true),
            borderColorVar: 'var(--border-stats-blue)',
            bgColorStyle: { backgroundColor: 'color-mix(in srgb, var(--border-stats-blue), transparent 80%)', color: '#1e40af' } // Blue-800 text
        },
        {
            label: 'Manage Locations',
            description: 'Countries & Regulations',
            icon: Globe,
            onClick: () => setShowCountryModal(true),
            borderColorVar: 'var(--border-stats-emerald)',
            bgColorStyle: { backgroundColor: 'color-mix(in srgb, var(--border-stats-emerald), transparent 80%)', color: '#047857' } // Emerald-700 text
        },
        {
            label: 'Crate Calculator',
            description: 'IATA Size Check',
            icon: Ruler,
            onClick: () => setShowCrateCalculator(true),
            borderColorVar: 'var(--border-stats-orange)',
            bgColorStyle: { backgroundColor: 'color-mix(in srgb, var(--border-stats-orange), transparent 80%)', color: '#c2410c' } // Orange-700 text
        },
        {
            label: 'View Bookings',
            description: 'Recent Requests',
            icon: FileText,
            onClick: () => window.location.href = '/admin/relocations',
            borderColorVar: 'var(--border-stats-orange)',
            bgColorStyle: { backgroundColor: 'color-mix(in srgb, var(--border-stats-orange), transparent 80%)', color: '#c2410c' } // Orange-700 text
        },
        {
            label: 'System Settings',
            description: 'Configuration',
            icon: Settings,
            onClick: () => window.location.href = '/admin/settings',
            borderColorVar: 'var(--border-stats-purple)',
            bgColorStyle: { backgroundColor: 'color-mix(in srgb, var(--border-stats-purple), transparent 80%)', color: '#7e22ce' } // Purple-700 text
        }
    ];

    return (
        <>
            <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-level-1 border border-brand-text-02/10 p-6">
                <h3 className="text-gray-900 mb-4 flex items-center gap-2">
                    <span className="w-1 h-6 bg-gradient-to-b from-accent to-brand-secondary rounded-full"></span>
                    Quick Actions
                </h3>
                <div className="flex flex-col space-y-3">
                    {actions.map((action, index) => (
                        <button
                            key={index}
                            onClick={action.onClick}
                            className={`
                                relative overflow-hidden
                                p-4 rounded-2xl transition-all duration-300
                                text-left flex items-center gap-4 group
                                border
                                hover:shadow-lg hover:-translate-y-0.5
                                hover:bg-opacity-60
                            `}
                            style={{
                                borderColor: action.borderColorVar,
                                ...action.bgColorStyle
                            }}
                        >
                            <div className="absolute inset-0 bg-white/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                            <div className="relative z-10 p-2.5 bg-white/80 backdrop-blur-sm rounded-xl group-hover:scale-110 transition-transform shadow-sm">
                                <action.icon size={20} strokeWidth={2} />
                            </div>
                            <div className="relative z-10">
                                <div className="font-bold text-sm text-brand-text-02">{action.label}</div>
                                <div className="text-xs text-brand-text-02/80 font-medium">{action.description}</div>
                            </div>

                            {/* Arrow indicator on hover */}
                            <div className="absolute right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-brand-text-02/60">
                                    <path d="M5 12h14M12 5l7 7-7 7" />
                                </svg>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Modals */}
            <TaxonomyManagerModal
                isOpen={showTaxonomyModal}
                onClose={() => setShowTaxonomyModal(false)}
            />

            <CountryManagerModal
                isOpen={showCountryModal}
                onClose={() => setShowCountryModal(false)}
            />

            <CrateCalculatorDialog
                isOpen={showCrateCalculator}
                onClose={() => setShowCrateCalculator(false)}
            />
        </>
    );
}
