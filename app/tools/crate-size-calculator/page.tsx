'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import { Copy, Info, BoxSelect, Ruler, Sparkles, AlertTriangle, CheckCircle2, MessageCircle, X, Dog, Cat, Scale } from 'lucide-react';
import { useCrateCalculator, PetMeasurements } from '@/hooks/useCrateCalculator';
import { toast } from '@/hooks/use-toast';
import WhatsAppShareBtn from '@/components/WhatsAppShareBtn';
import { SmartBreedCombobox, Breed } from '@/components/ui/smart-breed-combobox';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export default function CrateCalculatorPage() {
    const [measurements, setMeasurements] = useState<PetMeasurements>({
        lengthA: 0,
        elbowB: 0,
        widthC: 0,
        heightD: 0,
        isSnubNosed: false
    });

    const [unit, setUnit] = useState<'cm' | 'inch'>('cm');
    const [species, setSpecies] = useState<'Dog' | 'Cat'>('Dog');
    const [breedName, setBreedName] = useState('');
    const [weight, setWeight] = useState<number | undefined>(undefined);
    const [aiResult, setAiResult] = useState<any>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    // Convert measurements to CM for the hook logic
    const measurementsInCm = useMemo(() => {
        if (unit === 'cm') return measurements;
        return {
            ...measurements,
            lengthA: measurements.lengthA * 2.54,
            elbowB: measurements.elbowB * 2.54,
            widthC: measurements.widthC * 2.54,
            heightD: measurements.heightD * 2.54
        };
    }, [measurements, unit]);

    const result = useCrateCalculator(measurementsInCm);

    const handleUnitChange = (newUnit: 'cm' | 'inch') => {
        if (unit === newUnit) return;

        const factor = newUnit === 'cm' ? 2.54 : 1 / 2.54;

        setMeasurements(prev => ({
            ...prev,
            lengthA: parseFloat((prev.lengthA * factor).toFixed(1)) || 0,
            elbowB: parseFloat((prev.elbowB * factor).toFixed(1)) || 0,
            widthC: parseFloat((prev.widthC * factor).toFixed(1)) || 0,
            heightD: parseFloat((prev.heightD * factor).toFixed(1)) || 0,
        }));

        setUnit(newUnit);
    };

    const handleBreedSelect = (selectedBreed: Breed) => {
        setBreedName(selectedBreed.name);
        if (selectedBreed.is_snub_nosed) {
            setMeasurements(prev => ({ ...prev, isSnubNosed: true }));
            toast({
                title: "Safety Alert: Snub-nosed Breed",
                description: "We've automatically added a 10% safety buffer to the dimensions.",
                variant: "warning"
            });
        } else {
            // Optional: reset snub-nosed if switching to a non-snub breed? 
            // Usually safer to leave it unless explicitly unchecked, but for UX let's reset if it was auto-set.
            // For now, we'll just set it to false if the user hadn't manually checked it? 
            // Let's just update it to match the breed's risk profile for convenience.
            setMeasurements(prev => ({ ...prev, isSnubNosed: false }));
        }
    };

    const handleCopy = () => {
        if (!result) return;
        const text = `IATA Crate Requirement:
Rec: ${result.recommendedCrate?.name || 'Custom Build Required'}
Min Internal Dims: ${result.minInternalDims.length}x${result.minInternalDims.width}x${result.minInternalDims.height} cm`;
        navigator.clipboard.writeText(text);
        toast({ title: "Copied", description: "Crate dimensions copied to clipboard." });
    };

    const handleAiAudit = async () => {
        if (!result) return;
        setIsAnalyzing(true);
        try {
            const response = await fetch('/api/ai-crate-audit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    dimensions: result.minInternalDims,
                    breed: breedName || 'Unknown Breed',
                    weight: weight,
                    destination: 'UAE' // Defaulting for now
                })
            });
            const data = await response.json();
            setAiResult(data);
        } catch (error) {
            toast({ title: "Error", description: "Failed to perform AI audit.", variant: "destructive" });
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <>
            {/* JSON-LD Structured Data for Rich Results */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "WebApplication",
                        "name": "Pawpaths IATA Crate Calculator",
                        "url": "https://booking.pawpathsae.com/tools/crate-size-calculator",
                        "applicationCategory": "UtilityApplication",
                        "operatingSystem": "Any",
                        "description": "Calculates IATA-compliant travel crate dimensions for pets based on 2026 Live Animals Regulations.",
                        "offers": {
                            "@type": "Offer",
                            "price": "0",
                            "priceCurrency": "AED"
                        },
                        "featureList": "IATA Compliance Check, Snub-Nose Breed Logic, Airline Inventory Matching"
                    })
                }}
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="bg-white rounded-3xl shadow-level-1 overflow-hidden flex flex-col lg:flex-row border border-brand-text-02/10">

                    {/* LEFT: INPUTS & DIAGRAM */}
                    <div className="flex-1 p-8 lg:p-12 bg-surface-warm border-r border-brand-text-02/10">
                        <div className="flex justify-between items-center mb-6">
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
                                <button
                                    onClick={() => window.open('https://wa.me/971586947755?text=Check%20out%20this%20useful%20tool%20to%20calculate%20pet%20crate%20sizes!', '_blank')}
                                    className="w-10 h-10 rounded-full bg-[#25D366] flex items-center justify-center text-white shadow-md hover:opacity-90 transition-all hover:scale-105"
                                    aria-label="Share on WhatsApp"
                                >
                                    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" /></svg>
                                </button>
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

                        {/* Toggles Row */}
                        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                            {/* Species Toggle */}
                            <div className="flex items-center gap-2 bg-white p-1 rounded-full border border-gray-200 shadow-sm">
                                <button
                                    onClick={() => setSpecies('Dog')}
                                    className={cn(
                                        "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all",
                                        species === 'Dog'
                                            ? "bg-brand-color-01 text-white shadow-md"
                                            : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                                    )}
                                >
                                    <Dog size={16} /> Dog
                                </button>
                                <button
                                    onClick={() => setSpecies('Cat')}
                                    className={cn(
                                        "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all",
                                        species === 'Cat'
                                            ? "bg-brand-color-01 text-white shadow-md"
                                            : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                                    )}
                                >
                                    <Cat size={16} /> Cat
                                </button>
                            </div>

                            {/* Unit Toggle */}
                            <div className="flex items-center gap-2 bg-white p-1 rounded-full border border-gray-200 shadow-sm">
                                <button
                                    onClick={() => handleUnitChange('cm')}
                                    className={cn(
                                        "px-4 py-2 rounded-full text-sm font-bold transition-all",
                                        unit === 'cm'
                                            ? "bg-[#8B5E3C] text-white shadow-md"
                                            : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                                    )}
                                >
                                    CM
                                </button>
                                <button
                                    onClick={() => handleUnitChange('inch')}
                                    className={cn(
                                        "px-4 py-2 rounded-full text-sm font-bold transition-all",
                                        unit === 'inch'
                                            ? "bg-[#8B5E3C] text-white shadow-md"
                                            : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                                    )}
                                >
                                    Inch
                                </button>
                            </div>
                        </div>

                        {/* Inputs Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-brand-text-02/60 uppercase tracking-wider">A: Length ({unit})</label>
                                <input
                                    type="number"
                                    className="w-full p-2 bg-white border border-brand-text-02/20 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-brand-text-02 placeholder:text-brand-text-02/30"
                                    placeholder="Nose to Tail"
                                    value={measurements.lengthA || ''}
                                    onChange={(e) => setMeasurements({ ...measurements, lengthA: parseFloat(e.target.value) })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-brand-text-02/60 uppercase tracking-wider">B: Elbow Height ({unit})</label>
                                <input
                                    type="number"
                                    className="w-full p-2 bg-white border border-brand-text-02/20 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-brand-text-02 placeholder:text-brand-text-02/30"
                                    placeholder="Ground to Elbow"
                                    value={measurements.elbowB || ''}
                                    onChange={(e) => setMeasurements({ ...measurements, elbowB: parseFloat(e.target.value) })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-brand-text-02/60 uppercase tracking-wider">C: Width ({unit})</label>
                                <input
                                    type="number"
                                    className="w-full p-2 bg-white border border-brand-text-02/20 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-brand-text-02 placeholder:text-brand-text-02/30"
                                    placeholder="Shoulder Width"
                                    value={measurements.widthC || ''}
                                    onChange={(e) => setMeasurements({ ...measurements, widthC: parseFloat(e.target.value) })}
                                />
                                <p className="text-xs text-brand-text-02/50">Measure across shoulders at widest point.</p>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-brand-text-02/60 uppercase tracking-wider">D: Height ({unit})</label>
                                <input
                                    type="number"
                                    className="w-full p-2 bg-white border border-brand-text-02/20 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-brand-text-02 placeholder:text-brand-text-02/30"
                                    placeholder="Ground to Head"
                                    value={measurements.heightD || ''}
                                    onChange={(e) => setMeasurements({ ...measurements, heightD: parseFloat(e.target.value) })}
                                />
                            </div>
                        </div>

                        {/* Optional Fields for AI Audit */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 pt-4 border-t border-brand-text-02/10">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-brand-text-02/60 uppercase tracking-wider">Breed (Optional)</label>
                                <SmartBreedCombobox
                                    selectedSpecies={species}
                                    onSelect={handleBreedSelect}
                                    selectedBreedName={breedName}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-brand-text-02/60 uppercase tracking-wider">Weight (kg) (Optional)</label>
                                <input
                                    type="number"
                                    className="w-full p-2 bg-white border border-brand-text-02/20 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-brand-text-02 placeholder:text-brand-text-02/30"
                                    placeholder="e.g. 25"
                                    value={weight || ''}
                                    onChange={(e) => setWeight(parseFloat(e.target.value))}
                                />
                            </div>
                        </div>

                        <div className="mt-4 flex items-center gap-3 p-4 bg-white rounded-xl border border-brand-text-02/10">
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
                    <div className="w-full lg:w-[420px] bg-white p-8 lg:p-12 flex flex-col border-t lg:border-t-0 lg:border-l border-brand-text-02/10 relative overflow-y-auto">
                        <div className="flex-1 flex flex-col justify-center">
                            {result ? (
                                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold border ${!result.isCustomBuildNeeded ? 'bg-success/10 text-success border-success/20' : 'bg-warning/10 text-warning border-warning/20'}`}>
                                        <BoxSelect size={18} />
                                        {!result.isCustomBuildNeeded ? 'Standard Fit' : 'Custom Build Required'}
                                    </div>

                                    <div>
                                        <h3 className="text-3xl font-bold text-brand-text-02 leading-tight mb-2">{result.recommendedCrate?.name || 'Custom Wooden Crate'}</h3>
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

                                    {/* AI Audit Button */}
                                    {!aiResult && (
                                        <button
                                            onClick={handleAiAudit}
                                            disabled={isAnalyzing}
                                            className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl font-bold hover:opacity-90 disabled:opacity-70 transition-all shadow-lg shadow-indigo-500/20 active:scale-95 group"
                                        >
                                            {isAnalyzing ? (
                                                <>
                                                    <Sparkles className="animate-spin" size={18} />
                                                    Checking Airline Regulations...
                                                </>
                                            ) : (
                                                <>
                                                    <Sparkles size={18} className="group-hover:scale-110 transition-transform" />
                                                    Analyze with AI Safety Check
                                                </>
                                            )}
                                        </button>
                                    )}

                                    {/* AI Safety Card */}
                                    {aiResult && (
                                        <div className="rounded-2xl border-2 border-amber-400/50 overflow-hidden shadow-xl animate-in zoom-in-95 duration-500">
                                            {/* Header */}
                                            <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-4 text-white flex justify-between items-center">
                                                <div className="flex items-center gap-2">
                                                    <CheckCircle2 className="text-green-400" size={20} />
                                                    <span className="font-bold">Safety Audit Complete</span>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <div className="relative w-10 h-10 flex items-center justify-center">
                                                        <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                                                            <path className="text-slate-700" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4" />
                                                            <path className={`${aiResult.safety_score >= 85 ? 'text-green-500' : aiResult.safety_score >= 70 ? 'text-amber-500' : 'text-red-500'}`} strokeDasharray={`${aiResult.safety_score}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4" />
                                                        </svg>
                                                        <span className="absolute text-[10px] font-bold">{aiResult.safety_score}</span>
                                                    </div>
                                                    <button
                                                        onClick={() => setAiResult(null)}
                                                        className="text-slate-400 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-full"
                                                        aria-label="Close Audit"
                                                    >
                                                        <X size={20} />
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Content */}
                                            <div className="bg-white p-5 space-y-4">
                                                <div>
                                                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Comfort Verdict</div>
                                                    <p className="text-sm font-medium text-slate-700 leading-relaxed">{aiResult.comfort_analysis}</p>
                                                </div>

                                                {aiResult.airline_warning && (
                                                    <div className="bg-amber-50 p-3 rounded-lg border border-amber-100 flex gap-2 items-start">
                                                        <AlertTriangle className="text-amber-500 shrink-0 mt-0.5" size={16} />
                                                        <p className="text-xs text-amber-800 font-medium">{aiResult.airline_warning}</p>
                                                    </div>
                                                )}

                                                <div>
                                                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Recommended Model</div>
                                                    <div className="text-lg font-black text-slate-900">{aiResult.recommended_crate_model}</div>
                                                </div>
                                            </div>

                                            {/* Footer Upsell */}
                                            <div className="bg-slate-50 p-5 border-t border-slate-100">
                                                <p className="text-xs text-slate-500 mb-4 italic">"{aiResult.pawpaths_offer}"</p>
                                                <a
                                                    href={`https://wa.me/971586947755?text=${encodeURIComponent(`Hi Pawpaths, I need a ${aiResult.recommended_crate_model} for my pet. The AI Safety Audit recommended this model.`)}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="block w-full bg-green-600 hover:bg-green-700 text-white text-center py-3 rounded-xl font-bold transition-colors shadow-lg shadow-green-600/20 flex items-center justify-center gap-2"
                                                >
                                                    <MessageCircle size={18} />
                                                    {aiResult.is_custom_build_needed ? 'Get Quote for Custom Build' : 'Order this Crate on WhatsApp'}
                                                </a>
                                            </div>
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
                                    const text = `Hi Pawpaths, I calculated a crate size:%0A%0ARec: ${result.recommendedCrate?.name || 'Custom Build'}%0AMin Internal Dims: ${result.minInternalDims.length}x${result.minInternalDims.width}x${result.minInternalDims.height} cm`;
                                    window.open(`https://wa.me/971586947755?text=${text}`, '_blank');
                                }}
                                disabled={!result}
                                className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-system-color-02 text-white rounded-xl font-bold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-success/20 active:scale-95"
                            >
                                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" /></svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
