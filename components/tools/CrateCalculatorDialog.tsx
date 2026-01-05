'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { X, Copy, Info, BoxSelect, Ruler } from 'lucide-react';
import { calculateCrateSize, PetMeasurements, CrateRecommendation } from '@/lib/utils/iata-calculator';
import { toast } from '@/hooks/use-toast';

interface CrateCalculatorDialogProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function CrateCalculatorDialog({ isOpen, onClose }: CrateCalculatorDialogProps) {
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

    if (!isOpen) return null;

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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col md:flex-row animate-in zoom-in-95 duration-200">

                {/* LEFT: INPUTS & DIAGRAM */}
                <div className="flex-1 p-8 bg-gray-50 border-r border-gray-100">
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-2 text-brand-color-01">
                            <Ruler className="w-6 h-6" />
                            <h2 className="text-xl font-bold text-gray-900">IATA Crate Calculator</h2>
                        </div>
                        <button onClick={onClose} className="md:hidden p-2 hover:bg-gray-200 rounded-full">
                            <X size={20} />
                        </button>
                    </div>

                    {/* Measurement Diagram - Full Bleed (No White Edges) */}
                    <div className="relative mb-8 rounded-xl border border-gray-200 overflow-hidden" style={{ aspectRatio: '16/9' }}>
                        <Image
                            src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/media/diagrams/pawpath-crate-diagram.webp`}
                            alt="IATA Pet Crate Measurement Guide - Shows how to measure Length (A), Elbow Height (B), Width (C), and Height (D)"
                            fill
                            sizes="(max-width: 768px) 100vw, 50vw"
                            className="object-cover"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 uppercase">A: Length (cm)</label>
                            <input
                                type="number"
                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-color-03/20 focus:border-brand-color-03 outline-none"
                                placeholder="Nose to Tail"
                                value={measurements.lengthA || ''}
                                onChange={(e) => setMeasurements({ ...measurements, lengthA: parseFloat(e.target.value) })}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 uppercase">B: Elbow Height (cm)</label>
                            <input
                                type="number"
                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-color-03/20 focus:border-brand-color-03 outline-none"
                                placeholder="Ground to Elbow"
                                value={measurements.elbowB || ''}
                                onChange={(e) => setMeasurements({ ...measurements, elbowB: parseFloat(e.target.value) })}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 uppercase">C: Width (cm)</label>
                            <input
                                type="number"
                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-color-03/20 focus:border-brand-color-03 outline-none"
                                placeholder="Shoulder Width"
                                value={measurements.widthC || ''}
                                onChange={(e) => setMeasurements({ ...measurements, widthC: parseFloat(e.target.value) })}
                            />
                            <p className="text-[10px] text-gray-400">Measure across shoulders at widest point.</p>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 uppercase">D: Height (Tip of Ears)</label>
                            <input
                                type="number"
                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-color-03/20 focus:border-brand-color-03 outline-none"
                                placeholder="Ground to Head"
                                value={measurements.heightD || ''}
                                onChange={(e) => setMeasurements({ ...measurements, heightD: parseFloat(e.target.value) })}
                            />
                        </div>
                    </div>

                    <div className="mt-6 flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="snub"
                            checked={measurements.isSnubNosed}
                            onChange={(e) => setMeasurements({ ...measurements, isSnubNosed: e.target.checked })}
                            className="w-4 h-4 text-brand-color-03 rounded border-gray-300 focus:ring-brand-color-03"
                        />
                        <label htmlFor="snub" className="text-sm font-medium text-gray-700">Is this a Snub-nosed breed? (+10% Buffer)</label>
                    </div>
                </div>

                {/* RIGHT: RESULTS */}
                <div className="w-full md:w-[380px] bg-white p-8 flex flex-col relative">
                    <button onClick={onClose} className="absolute right-4 top-4 hidden md:block p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors">
                        <X size={20} />
                    </button>

                    <div className="flex-1 flex flex-col justify-center">
                        {result ? (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold border ${result.crateType === 'standard' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-orange-50 text-orange-700 border-orange-200'}`}>
                                    <BoxSelect size={16} />
                                    {result.crateType === 'standard' ? 'Standard Fit' : 'Custom Build'}
                                </div>

                                <div>
                                    <h3 className="text-2xl font-bold text-gray-900 leading-tight mb-1">{result.recommendedCrate}</h3>
                                    <p className="text-sm text-gray-500">Recommended Container</p>
                                </div>

                                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                                    <p className="text-xs font-bold text-gray-400 uppercase mb-2">Minimum Internal Dimensions</p>
                                    <div className="flex items-end gap-2">
                                        <span className="text-3xl font-mono font-bold text-brand-color-01">{result.minInternalDims.length}</span>
                                        <span className="text-sm text-gray-400 mb-1">x</span>
                                        <span className="text-3xl font-mono font-bold text-brand-color-01">{result.minInternalDims.width}</span>
                                        <span className="text-sm text-gray-400 mb-1">x</span>
                                        <span className="text-3xl font-mono font-bold text-brand-color-01">{result.minInternalDims.height}</span>
                                        <span className="text-sm font-bold text-gray-500 mb-1 ml-1">cm</span>
                                    </div>
                                </div>

                                {result.seriesDims && (
                                    <div className="text-sm text-gray-600 flex items-center gap-1 font-medium">
                                        <Info size={16} />
                                        <span>External Dims: {result.seriesDims.length}x{result.seriesDims.width}x{result.seriesDims.height} cm</span>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="text-center text-gray-400">
                                <BoxSelect size={48} className="mx-auto mb-4 opacity-20" />
                                <p className="text-sm">Enter measurements to see crate recommendations.</p>
                            </div>
                        )}
                    </div>

                    <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col gap-3">
                        <button
                            onClick={handleCopy}
                            disabled={!result}
                            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-system-color-03 text-white rounded-xl font-bold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
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
                            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-system-color-02 text-white rounded-xl font-bold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
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
