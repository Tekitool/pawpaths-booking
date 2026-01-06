'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { Upload, ScanFace, Dog, Cat, AlertCircle, CheckCircle2, Info, Sparkles, RefreshCw, Ban, Wind, MessageCircle, ExternalLink } from 'lucide-react';

type BreedData = {
    breed_name: string;
    species: 'Dog' | 'Cat';
    confidence_score: number;
    description: string;
    average_weight: string;
    lifespan: string;
    is_brachycephalic: boolean;
    is_banned_breed: boolean;
    // New Pawpaths Intelligence Fields
    travel_complexity_rating: number;
    travel_complexity_note: string;
    estimated_crate_series: string;
    marketing_hook: string;
    relocation_challenges: string[];
    pawpaths_advantage: string;
};

export default function BreedIdentifierPage() {
    const [state, setState] = useState<'idle' | 'preview' | 'loading' | 'result'>('idle');
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [base64Image, setBase64Image] = useState<string | null>(null);
    const [resultData, setResultData] = useState<BreedData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Handle clicking the upload area
    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    // Handle file selection
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // 1. Create Preview URL
        const objectUrl = URL.createObjectURL(file);
        setPreviewUrl(objectUrl);

        // 2. Convert to Base64 for API
        const reader = new FileReader();
        reader.onloadend = () => {
            setBase64Image(reader.result as string);
            setState('preview');
            setError(null);
        };
        reader.readAsDataURL(file);
    };

    // Handle Scanning Process
    const handleScan = async () => {
        if (!base64Image) return;

        setState('loading');
        setError(null);

        try {
            const response = await fetch('/api/tools/identify-breed', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ image: base64Image }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to identify breed');
            }

            setResultData(data);
            setState('result');
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Something went wrong. Please try again.');
            setState('preview'); // Go back to preview on error
        }
    };

    const handleReset = () => {
        setState('idle');
        setPreviewUrl(null);
        setBase64Image(null);
        setResultData(null);
        setError(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    // Helper to determine Travel Alert UI
    const getTravelAlert = (data: BreedData) => {
        if (data.is_banned_breed) {
            return {
                color: 'bg-red-50 border-red-200 text-red-800',
                icon: <Ban size={24} className="text-red-600" />,
                title: 'Travel Forbidden',
                message: 'This breed is often restricted or banned from air travel and entry into many countries. Professional consultation is required.'
            };
        }
        if (data.is_brachycephalic) {
            return {
                color: 'bg-orange-50 border-orange-200 text-orange-800',
                icon: <Wind size={24} className="text-orange-600" />,
                title: 'High Risk / Embargoed',
                message: 'This is a brachycephalic (snub-nosed) breed. Many airlines have strict embargoes due to breathing risks during flight.'
            };
        }
        return {
            color: 'bg-green-50 border-green-200 text-green-800',
            icon: <CheckCircle2 size={24} className="text-green-600" />,
            title: 'Generally Accepted',
            message: 'This breed is typically accepted by most airlines. Standard crate and vaccination rules apply.'
        };
    };

    return (
        <div className="max-w-5xl mx-auto px-4 py-12">
            <style jsx>{`
        @keyframes scan {
          0% { top: 0%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        .animate-scan {
          animation: scan 2s ease-in-out infinite;
        }
      `}</style>

            {/* Hero Section */}
            <div className="text-center mb-12">
                <div className="flex flex-col md:flex-row items-center justify-center gap-3 mb-6">
                    <div className="relative h-[27px] md:h-[35px] w-32">
                        <Image
                            src="/pawpaths.svg"
                            alt="Pawpaths"
                            fill
                            className="object-contain"
                        />
                    </div>
                    <h1 className="text-2xl md:text-3xl font-bold text-brand-color-01 tracking-tight mt-1">
                        Breed Detective
                    </h1>
                </div>
                <p className="text-lg text-brand-text-02/60 max-w-2xl mx-auto leading-relaxed">
                    Upload a photo of your pet. Pawpaths A.I System instantly identifies the breed and checks airline travel rules.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">

                {/* Left Column: Upload Card */}
                <div className="bg-white/60 backdrop-blur-md rounded-3xl p-8 border border-white/50 shadow-sm relative overflow-hidden min-h-[500px]">

                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                        accept="image/*"
                    />

                    {/* State: Idle */}
                    {state === 'idle' && (
                        <div
                            onClick={handleUploadClick}
                            className="border-3 border-dashed border-brand-text-02/20 hover:border-brand-color-01/50 hover:bg-brand-color-02 rounded-2xl h-full min-h-[400px] flex flex-col items-center justify-center cursor-pointer transition-all duration-300 group relative overflow-hidden"
                        >
                            <div className="flex items-center gap-8 mb-8">
                                <div className="flex flex-col items-center gap-3 group-hover:scale-110 transition-transform duration-300">
                                    <div className="w-20 h-20 bg-white rounded-full shadow-sm flex items-center justify-center border border-brand-text-02/5">
                                        <Dog size={40} className="text-brand-color-03" strokeWidth={1.5} />
                                    </div>
                                    <span className="font-bold text-brand-text-02/60 text-sm uppercase tracking-wider">Dog</span>
                                </div>
                                <div className="h-16 w-px bg-brand-text-02/10"></div>
                                <div className="flex flex-col items-center gap-3 group-hover:scale-110 transition-transform duration-300">
                                    <div className="w-20 h-20 bg-white rounded-full shadow-sm flex items-center justify-center border border-brand-text-02/5">
                                        <Cat size={40} className="text-brand-color-01" strokeWidth={1.5} />
                                    </div>
                                    <span className="font-bold text-brand-text-02/60 text-sm uppercase tracking-wider">Cat</span>
                                </div>
                            </div>

                            <h3 className="text-xl font-bold text-brand-text-02 mb-2">Identify Your Pet</h3>
                            <p className="text-brand-text-02/60 font-medium mb-1">Upload a clear photo of a Dog or Cat</p>
                            <p className="text-sm text-brand-text-02/40">(Other animals like birds or reptiles are not supported yet)</p>
                        </div>
                    )}

                    {/* State: Preview */}
                    {state === 'preview' && previewUrl && (
                        <div className="flex flex-col h-full">
                            {error ? (
                                <div className="flex flex-col items-center justify-center h-full text-center p-6">
                                    <div className="w-24 h-24 bg-orange-50 rounded-full flex items-center justify-center mb-6 animate-bounce">
                                        <ScanFace size={48} className="text-orange-500" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-brand-text-02 mb-3">Wait... is that a pet?</h3>
                                    <p className="text-brand-text-02/60 mb-8 leading-relaxed max-w-md">
                                        Our AI is 99% sure this isn&apos;t a dog or cat. If it is, they are playing a very good game of hide-and-seek! Please try a clearer photo.
                                    </p>
                                    <button
                                        onClick={handleReset}
                                        className="text-brand-color-01 font-bold hover:underline flex items-center gap-2"
                                    >
                                        <RefreshCw size={16} />
                                        Try Another Photo
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <div className="relative h-80 w-full rounded-2xl overflow-hidden mb-6 border border-brand-text-02/10 shadow-inner bg-gray-100">
                                        <Image
                                            src={previewUrl}
                                            alt="Pet Preview"
                                            fill
                                            unoptimized
                                            className="object-cover"
                                        />
                                        <button
                                            onClick={handleReset}
                                            className="absolute top-4 right-4 bg-white/80 backdrop-blur-sm rounded-full p-2 text-brand-text-02/70 hover:text-brand-text-02 hover:bg-white transition-colors shadow-sm"
                                            title="Remove photo"
                                        >
                                            <RefreshCw size={20} />
                                        </button>
                                    </div>

                                    <div className="flex-grow flex flex-col justify-end">
                                        <button
                                            onClick={handleScan}
                                            className="w-full py-4 bg-brand-color-03 text-white font-bold rounded-xl shadow-lg shadow-brand-color-03/20 hover:bg-brand-color-03/90 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 mt-auto"
                                        >
                                            <ScanFace size={20} />
                                            Identify Breed
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    )}

                    {/* State: Loading */}
                    {state === 'loading' && previewUrl && (
                        <div className="flex flex-col h-full relative">
                            <div className="relative h-full min-h-[400px] w-full rounded-2xl overflow-hidden border border-brand-text-02/10 bg-gray-100">
                                <Image
                                    src={previewUrl}
                                    alt="Scanning"
                                    fill
                                    unoptimized
                                    className="object-cover opacity-50 blur-sm"
                                />
                                <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
                                    <div className="w-24 h-24 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-6" />
                                    <div className="bg-white/90 backdrop-blur-md px-6 py-3 rounded-full shadow-lg">
                                        <span className="text-primary font-bold animate-pulse">Scanning biometric points...</span>
                                    </div>
                                </div>
                                {/* Scanning Line Animation */}
                                <div className="absolute top-0 left-0 w-full h-1 bg-primary/80 shadow-[0_0_15px_rgba(var(--brand-color-01),0.8)] animate-scan" />
                            </div>
                        </div>
                    )}

                    {/* State: Result (Show Image) */}
                    {state === 'result' && previewUrl && (
                        <div className="flex flex-col h-full">
                            <div className="relative h-full min-h-[400px] w-full rounded-2xl overflow-hidden border border-brand-text-02/10 shadow-sm bg-gray-100">
                                <Image
                                    src={previewUrl}
                                    alt="Analyzed Pet"
                                    fill
                                    unoptimized
                                    className="object-cover"
                                />
                                <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/60 to-transparent p-6 pt-20">
                                    <div className="flex items-center gap-2 text-white/90 text-sm font-medium">
                                        <CheckCircle2 size={16} className="text-green-400" />
                                        Analysis Complete
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={handleReset}
                                className="mt-6 w-full py-3 bg-brand-color-04 border border-brand-text-02/10 text-brand-text-02 font-bold rounded-xl hover:bg-brand-color-04/90 transition-colors flex items-center justify-center gap-2 shadow-sm"
                            >
                                <RefreshCw size={18} />
                                Scan Another Pet
                            </button>
                        </div>
                    )}

                </div>

                {/* Right Column: Results Placeholder */}
                <div className={`transition-all duration-1000 ${state === 'result' ? 'opacity-100 blur-0 grayscale-0' : 'opacity-60 blur-md grayscale pointer-events-none select-none'}`}>

                    {/* Main Result Card */}
                    <div className="bg-white/80 backdrop-blur-md rounded-3xl p-8 border border-white/50 shadow-lg mb-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-6 opacity-10 text-brand-text-02">
                            {resultData?.species === 'Cat' ? (
                                <Cat size={120} strokeWidth={1} />
                            ) : (
                                <Dog size={120} strokeWidth={1} />
                            )}
                        </div>

                        <div className="relative z-10">
                            <div className="inline-flex flex-col items-start mb-4">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold uppercase tracking-wider border border-green-200">
                                    <Sparkles size={12} />
                                    {resultData ? `${resultData.confidence_score}% Match` : '98% Match'}
                                </div>
                                <span className="text-[10px] text-brand-text-02/40 mt-1 ml-1">Based on biometric analysis of visual features</span>
                            </div>

                            <h2 className="text-4xl font-bold text-brand-text-02 mb-2">
                                {resultData?.breed_name || 'Golden Retriever'}
                            </h2>
                            <p className="text-brand-text-02/60 mb-6 max-w-sm">
                                {resultData?.description || 'Intelligent, friendly, and devoted. Golden Retrievers are gentle with children and other pets.'}
                            </p>

                            {/* Airline Warning Box */}
                            {resultData && (() => {
                                const alert = getTravelAlert(resultData);
                                return (
                                    <div className={`${alert.color} rounded-xl p-4 flex gap-4 mb-6 border`}>
                                        <div className="flex-shrink-0 mt-1">
                                            {alert.icon}
                                        </div>
                                        <div>
                                            <h4 className="font-bold mb-1">{alert.title}</h4>
                                            <p className="text-sm opacity-90 leading-relaxed">
                                                {alert.message}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })()}

                            {!resultData && (
                                // Fallback/Skeleton for initial view
                                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex gap-4 mb-6">
                                    <div className="flex-shrink-0 text-yellow-600 mt-1">
                                        <AlertCircle size={24} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-yellow-800 mb-1">Travel Alert</h4>
                                        <p className="text-sm text-yellow-700/80 leading-relaxed">
                                            Generally accepted by most airlines. No specific breed bans found. Always check crate size requirements as they are large dogs.
                                        </p>
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-surface-warm rounded-xl p-4 border border-brand-text-02/5">
                                    <div className="text-xs text-brand-text-02/40 uppercase font-bold mb-1">Avg Weight</div>
                                    <div className="text-lg font-bold text-brand-text-02">
                                        {resultData?.average_weight || '25 - 34 kg'}
                                    </div>
                                </div>
                                <div className="bg-surface-warm rounded-xl p-4 border border-brand-text-02/5">
                                    <div className="text-xs text-brand-text-02/40 uppercase font-bold mb-1">Lifespan</div>
                                    <div className="text-lg font-bold text-brand-text-02">
                                        {resultData?.lifespan || '10 - 12 yrs'}
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 pt-6 border-t border-brand-text-02/5 text-center">
                                <p className="text-xs text-brand-text-02/30">
                                    AI results are for estimation only. Always verify breed details with a licensed veterinarian for official travel documents.
                                </p>
                            </div>
                        </div>
                    </div>




                </div>

                {/* Full-Width Expert Analysis Section - 2 Column Dashboard */}
                {state === 'result' && resultData && (
                    <div className="mt-12 animate-fade-in col-span-1 lg:col-span-2">
                        {/* Premium Golden Border */}
                        <div className="bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-200 p-[2px] rounded-3xl shadow-2xl">
                            {/* Main Container with Sophisticated Gradient */}
                            <div className="bg-gradient-to-br from-slate-50 via-white to-blue-50/30 rounded-[22px] p-8 md:p-10">

                                {/* Section Header - Premium Styling */}
                                <div className="text-center mb-12 relative">
                                    {/* Glowing Background Effect */}
                                    <div className="absolute inset-0 bg-gradient-to-r from-brand-color-01/5 via-brand-color-03/10 to-brand-color-01/5 blur-3xl -z-10 rounded-full"></div>

                                    <div className="inline-flex items-center justify-center gap-3 mb-4 px-6 py-3 bg-gradient-to-r from-brand-color-01 to-brand-color-01/80 rounded-full shadow-lg shadow-brand-color-01/20">
                                        <Sparkles className="w-6 h-6 text-amber-300 animate-pulse" />
                                        <h3 className="text-2xl md:text-3xl font-black text-white tracking-tight">
                                            Pawpaths Expert Analysis
                                        </h3>
                                        <Sparkles className="w-6 h-6 text-amber-300 animate-pulse" />
                                    </div>

                                    {/* Marketing Hook with Gold Accent */}
                                    <div className="relative max-w-3xl mx-auto mt-6">
                                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-12 h-1 bg-gradient-to-r from-transparent to-amber-400 rounded-full"></div>
                                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-12 h-1 bg-gradient-to-l from-transparent to-amber-400 rounded-full"></div>
                                        <p className="text-lg md:text-xl text-brand-text-02/70 leading-relaxed font-medium italic px-16">
                                            "{resultData.marketing_hook}"
                                        </p>
                                    </div>
                                </div>


                                {/* Top Row: Complexity & Crate Side-by-Side */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                                    {/* Travel Complexity Card */}
                                    <div className={`rounded-2xl p-6 border-2 relative overflow-hidden group hover:shadow-xl transition-all ${resultData.travel_complexity_rating >= 8
                                        ? 'bg-gradient-to-br from-emerald-50 to-green-100 border-green-200'
                                        : resultData.travel_complexity_rating >= 5
                                            ? 'bg-gradient-to-br from-amber-50 to-orange-100 border-orange-200'
                                            : 'bg-gradient-to-br from-red-50 to-rose-100 border-red-200'
                                        }`}>
                                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                            <AlertCircle size={80} />
                                        </div>
                                        <div className="relative z-10">
                                            <div className="text-xs font-black text-slate-600 uppercase tracking-widest mb-2">Travel Complexity Score</div>
                                            <div className="flex items-baseline gap-3">
                                                <span className={`text-7xl font-black drop-shadow-md ${resultData.travel_complexity_rating >= 8 ? 'text-green-600' :
                                                    resultData.travel_complexity_rating >= 5 ? 'text-orange-600' :
                                                        'text-red-600'
                                                    }`}>
                                                    {resultData.travel_complexity_rating}
                                                </span>
                                                <span className="text-3xl text-slate-400 font-bold">/10</span>
                                            </div>
                                            <div className={`mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm ${resultData.travel_complexity_rating >= 8
                                                ? 'bg-green-600 text-white'
                                                : resultData.travel_complexity_rating >= 5
                                                    ? 'bg-orange-600 text-white'
                                                    : 'bg-red-600 text-white'
                                                }`}>
                                                <CheckCircle2 size={16} />
                                                {resultData.travel_complexity_rating >= 8 ? 'Low Risk • Standard Protocols' :
                                                    resultData.travel_complexity_rating >= 5 ? 'Moderate Risk • Requires Planning' :
                                                        'High Risk • Expert Handling Required'}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Crate Recommendation - Premium Cyan Gradient */}
                                    <div className="bg-gradient-to-br from-cyan-600 via-blue-600 to-blue-700 text-white rounded-2xl p-6 shadow-2xl shadow-blue-600/30 relative overflow-hidden border-2 border-cyan-300/30">
                                        {/* Animated Shimmer Effect */}
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12"></div>
                                        <div className="absolute -right-6 -bottom-6 opacity-10">
                                            <Dog size={140} strokeWidth={1.5} />
                                        </div>
                                        <div className="relative z-10">
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="text-cyan-100 text-xs font-black uppercase tracking-widest">Recommended Crate</div>
                                                <div className="bg-amber-400 text-amber-900 px-3 py-1 rounded-full text-xs font-black flex items-center gap-1 shadow-lg">
                                                    <CheckCircle2 size={12} /> IATA Approved
                                                </div>
                                            </div>
                                            <div className="text-6xl md:text-7xl font-mono font-black tracking-tight drop-shadow-lg">
                                                {resultData.estimated_crate_series}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Bottom Row: Challenges (Left) & Solution (Right) */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    {/* LEFT: Critical Considerations */}
                                    <div className="flex flex-col gap-2 h-full">
                                        <div className="flex items-center gap-2 text-orange-700/60 font-bold uppercase tracking-widest text-xs mb-2">
                                            <Info size={14} />
                                            Logistics Assessment
                                        </div>

                                        <div className="bg-gradient-to-br from-orange-100 via-amber-50 to-yellow-50 rounded-2xl p-6 border-2 border-orange-200 shadow-lg flex-1 flex flex-col">
                                            <h5 className="text-sm font-black text-orange-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                                                <AlertCircle size={18} className="text-orange-600" />
                                                Critical Considerations
                                            </h5>
                                            <ul className="flex-1 flex flex-col justify-center gap-4">
                                                {resultData.relocation_challenges?.map((challenge, idx) => (
                                                    <li key={idx} className="text-sm text-slate-700 flex items-start gap-3 bg-white/80 backdrop-blur-sm p-4 rounded-lg border border-orange-200/50 shadow-sm hover:shadow-md transition-shadow">
                                                        <span className="text-orange-600 font-black text-2xl leading-none flex-shrink-0">•</span>
                                                        <span className="leading-relaxed font-semibold pt-0.5">{challenge}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>

                                    {/* RIGHT: Solution */}
                                    <div className="flex flex-col gap-2 h-full">
                                        <div className="flex items-center gap-2 text-green-700/60 font-bold uppercase tracking-widest text-xs mb-2">
                                            <CheckCircle2 size={14} />
                                            Pawpaths Strategy
                                        </div>

                                        {/* 2. The Pawpaths Advantage - Rich Green */}
                                        <div className="bg-gradient-to-br from-emerald-100 via-green-50 to-teal-50 rounded-2xl p-6 border-2 border-green-200 shadow-lg flex-1 flex flex-col justify-center">
                                            <h5 className="text-sm font-black text-green-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                                                <Sparkles size={18} className="text-green-600" />
                                                Our Solution
                                            </h5>
                                            <p className="text-slate-700 leading-relaxed font-semibold text-base">
                                                {resultData.pawpaths_advantage}
                                            </p>
                                        </div>

                                        {/* 3. WhatsApp CTA */}
                                        {(() => {
                                            const message = `Hi Pawpaths! I just used your AI Breed Scanner. It identified my ${resultData.species} as a ${resultData.breed_name} (${resultData.estimated_crate_series}). I need help planning their relocation!`;
                                            const whatsappUrl = `https://wa.me/971586947755?text=${encodeURIComponent(message)}`;

                                            return (
                                                <a
                                                    href={whatsappUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="block w-full bg-gradient-to-r from-green-600 via-green-500 to-emerald-600 hover:from-green-500 hover:via-green-600 hover:to-emerald-500 text-white p-5 rounded-2xl shadow-xl shadow-green-600/40 hover:shadow-2xl hover:shadow-green-600/50 hover:-translate-y-1.5 transition-all duration-300 group relative overflow-hidden"
                                                >
                                                    {/* Animated shine effect */}
                                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12"></div>
                                                    <div className="flex items-center justify-center gap-3 relative z-10">
                                                        <MessageCircle size={28} className="group-hover:scale-110 group-hover:rotate-12 transition-transform" />
                                                        <div className="text-center">
                                                            <div className="text-xs text-green-100 font-bold tracking-wide">Ready to move?</div>
                                                            <div className="text-xl font-black leading-tight">Get Personalized Quote</div>
                                                        </div>
                                                        <ExternalLink size={20} className="opacity-60 group-hover:opacity-100 transition-opacity" />
                                                    </div>
                                                </a>
                                            );
                                        })()}
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
