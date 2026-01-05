'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Copy, Info, BoxSelect, Ruler } from 'lucide-react';
import { calculateCrateSize, PetMeasurements, CrateRecommendation } from '@/lib/utils/iata-calculator';
import { toast } from '@/hooks/use-toast';
import WhatsAppShareBtn from '@/components/WhatsAppShareBtn';

export default function CrateCalculatorPage() {
    const [measurements, setMeasurements] = useState<PetMeasurements>({
        lengthA: 0,
        elbowB: 0,
        widthC: 0,
        heightD: 0,
        isSnubNosed: false
    });

    const result = (measurements.lengthA > 0 && measurements.elbowB > 0 && measurements.widthC > 0 && measurements.heightD > 0)
        ? calculateCrateSize(measurements)
        : null;

    const handleCopy = () => {
        if (!result) return;
        const text = `IATA Crate Requirement:
Rec: ${result.recommendedCrate}
Min Internal Dims: ${result.minInternalDims.length}x${result.minInternalDims.width}x${result.minInternalDims.height} cm
External Dims: ${result.seriesDims ? `${result.seriesDims.length}x${result.seriesDims.width}x${result.seriesDims.height} cm` : 'N/A'}`;
        navigator.clipboard.writeText(text);
        toast({ title: "Copied", description: "Crate dimensions copied to clipboard." });
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="bg-white rounded-3xl shadow-level-1 overflow-hidden flex flex-col lg:flex-row border border-brand-text-02/10">

                {/* LEFT: INPUTS & DIAGRAM */}
                <div className="flex-1 p-8 lg:p-12 bg-surface-warm border-r border-brand-text-02/10">
                    <div className="flex justify-between items-center mb-8">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                            {/* Logo */}
                            <div className="relative h-9 w-32">
                                <Image
                                    src="/pawpaths.svg"
                                    alt="Pawpaths"
                                    fill
                                    className="object-contain object-left"
                                />
                            </div>

                            <div className="h-8 w-px bg-brand-text-02/10 hidden sm:block"></div>

                            <div>
                                <h1 className="text-2xl font-bold text-brand-color-01">Crate Size Calculator</h1>
                                <p className="text-sm text-brand-text-02/60">Calculate the perfect crate size for your pet</p>
                            </div>
                        </div>
                        <div className="hidden sm:block">
                            <WhatsAppShareBtn
                                title="IATA Crate Calculator"
                                text="Check out this useful tool to calculate pet crate sizes!"
                            />
                        </div>
                    </div>

                    {/* Measurement Diagram - Full Bleed */}
                    <div className="relative mb-8 rounded-2xl border border-brand-text-02/10 overflow-hidden shadow-sm" style={{ aspectRatio: '16/9' }}>
                        <Image
                            src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/media/diagrams/pawpath-crate-diagram.webp`}
                            alt="IATA Pet Crate Measurement Guide"
                            fill
                            sizes="(max-width: 768px) 100vw, 50vw"
                            className="object-cover"
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-brand-text-02/60 uppercase tracking-wider">A: Length (cm)</label>
                            <input
                                type="number"
                                className="w-full p-3 bg-white border border-brand-text-02/20 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-brand-text-02 placeholder:text-brand-text-02/30"
                                placeholder="Nose to Tail"
                                value={measurements.lengthA || ''}
                                onChange={(e) => setMeasurements({ ...measurements, lengthA: parseFloat(e.target.value) })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-brand-text-02/60 uppercase tracking-wider">B: Elbow Height (cm)</label>
                            <input
                                type="number"
                                className="w-full p-3 bg-white border border-brand-text-02/20 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-brand-text-02 placeholder:text-brand-text-02/30"
                                placeholder="Ground to Elbow"
                                value={measurements.elbowB || ''}
                                onChange={(e) => setMeasurements({ ...measurements, elbowB: parseFloat(e.target.value) })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-brand-text-02/60 uppercase tracking-wider">C: Width (cm)</label>
                            <input
                                type="number"
                                className="w-full p-3 bg-white border border-brand-text-02/20 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-brand-text-02 placeholder:text-brand-text-02/30"
                                placeholder="Shoulder Width"
                                value={measurements.widthC || ''}
                                onChange={(e) => setMeasurements({ ...measurements, widthC: parseFloat(e.target.value) })}
                            />
                            <p className="text-[10px] text-brand-text-02/50">Measure across shoulders at widest point.</p>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-brand-text-02/60 uppercase tracking-wider">D: Height (Tip of Ears)</label>
                            <input
                                type="number"
                                className="w-full p-3 bg-white border border-brand-text-02/20 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-brand-text-02 placeholder:text-brand-text-02/30"
                                placeholder="Ground to Head"
                                value={measurements.heightD || ''}
                                onChange={(e) => setMeasurements({ ...measurements, heightD: parseFloat(e.target.value) })}
                            />
                        </div>
                    </div>

                    <div className="mt-8 flex items-center gap-3 p-4 bg-white rounded-xl border border-brand-text-02/10">
                        <input
                            type="checkbox"
                            id="snub"
                            checked={measurements.isSnubNosed}
                            onChange={(e) => setMeasurements({ ...measurements, isSnubNosed: e.target.checked })}
                            className="w-5 h-5 text-primary rounded border-brand-text-02/30 focus:ring-primary"
                        />
                        <label htmlFor="snub" className="text-sm font-medium text-brand-text-02 cursor-pointer select-none">
                            Is this a Snub-nosed breed? <span className="text-brand-text-02/50">(+10% Buffer)</span>
                        </label>
                    </div>

                    <div className="mt-6 sm:hidden">
                        <WhatsAppShareBtn
                            title="IATA Crate Calculator"
                            text="Check out this useful tool to calculate pet crate sizes!"
                        />
                    </div>
                </div>

                {/* RIGHT: RESULTS */}
                <div className="w-full lg:w-[420px] bg-white p-8 lg:p-12 flex flex-col border-t lg:border-t-0 lg:border-l border-brand-text-02/10 relative">
                    <div className="flex-1 flex flex-col justify-center">
                        {result ? (
                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold border ${result.crateType === 'standard' ? 'bg-success/10 text-success border-success/20' : 'bg-warning/10 text-warning border-warning/20'}`}>
                                    <BoxSelect size={18} />
                                    {result.crateType === 'standard' ? 'Standard Fit' : 'Custom Build'}
                                </div>

                                <div>
                                    <h3 className="text-3xl font-bold text-brand-text-02 leading-tight mb-2">{result.recommendedCrate}</h3>
                                    <p className="text-sm text-brand-text-02/60 font-medium">Recommended Container</p>
                                </div>

                                <div className="bg-surface-warm rounded-2xl p-6 border border-brand-text-02/10">
                                    <p className="text-xs font-bold text-brand-text-02/40 uppercase mb-3 tracking-wider">Minimum Internal Dimensions</p>
                                    <div className="flex items-end gap-2 text-brand-text-02">
                                        <span className="text-4xl font-mono font-bold text-primary">{result.minInternalDims.length}</span>
                                        <span className="text-sm text-brand-text-02/40 mb-2 font-medium">x</span>
                                        <span className="text-4xl font-mono font-bold text-primary">{result.minInternalDims.width}</span>
                                        <span className="text-sm text-brand-text-02/40 mb-2 font-medium">x</span>
                                        <span className="text-4xl font-mono font-bold text-primary">{result.minInternalDims.height}</span>
                                        <span className="text-sm font-bold text-brand-text-02/40 mb-2 ml-1">cm</span>
                                    </div>
                                </div>

                                {result.seriesDims && (
                                    <div className="text-sm text-brand-text-02/70 flex items-center gap-2 font-medium bg-surface-cool/50 p-3 rounded-xl border border-brand-text-02/5">
                                        <Info size={16} className="text-primary" />
                                        <span>External Dims: {result.seriesDims.length}x{result.seriesDims.width}x{result.seriesDims.height} cm</span>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="text-center text-brand-text-02/30 py-12">
                                <div className="w-24 h-24 bg-surface-warm rounded-full flex items-center justify-center mx-auto mb-6">
                                    <BoxSelect size={48} className="opacity-50" />
                                </div>
                                <p className="text-base font-medium">Enter measurements to see<br />crate recommendations.</p>
                            </div>
                        )}
                    </div>

                    <div className="mt-12 pt-8 border-t border-brand-text-02/10 flex flex-col gap-3">
                        <button
                            onClick={handleCopy}
                            disabled={!result}
                            className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-system-color-03 text-white rounded-xl font-bold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-brand-text-02/20 active:scale-95"
                        >
                            <Copy size={18} /> Copy the Crate Size
                        </button>
                        <button
                            onClick={() => {
                                if (!result) return;
                                const text = `Hi Pawpaths, I calculated a crate size:%0A%0ARec: ${result.recommendedCrate}%0AMin Internal Dims: ${result.minInternalDims.length}x${result.minInternalDims.width}x${result.minInternalDims.height} cm%0AExternal Dims: ${result.seriesDims ? `${result.seriesDims.length}x${result.seriesDims.width}x${result.seriesDims.height} cm` : 'N/A'}`;
                                window.open(`https://wa.me/971586947755?text=${text}`, '_blank');
                            }}
                            disabled={!result}
                            className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-system-color-02 text-white rounded-xl font-bold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-success/20 active:scale-95"
                        >
                            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" /></svg>
                            Share with Pawpaths
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
