'use client';

import React from 'react';
import { Copy, Check } from 'lucide-react';
import { toast } from 'sonner';

export default function ThemesPage() {
    const [copied, setCopied] = React.useState(null);

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        setCopied(text);
        toast.success(`Copied ${text}`);
        setTimeout(() => setCopied(null), 2000);
    };

    const colorMappings = {
        '--brand-color-01': { name: 'Pawpath Brown', usage: 'Primary Brand' },
        '--brand-color-02': { name: 'Pawpath Cream', usage: 'Secondary Brand' },
        '--brand-color-03': { name: 'Pawpath Amber', usage: 'Accent' },
        '--brand-color-04': { name: 'Pawpath Yellow', usage: 'Warning / Highlight' },
        '--brand-secondary': { name: 'Taupe', usage: 'UI Element' },
        '--surface-warm': { name: 'Halo', usage: 'Warm Background' },
        '--surface-cool': { name: 'Glacier', usage: 'Cool Background' },
        '--surface-fresh': { name: 'Mint', usage: 'Fresh Background' },
        '--surface-pearl': { name: 'Pearl White', usage: 'Ultra-pure Base' },
        '--surface-silk': { name: 'Silk Cream', usage: 'Sophisticated Comfort' },
        '--surface-peach': { name: 'Peach Cream', usage: 'Warm & Friendly' },
        '--surface-mint': { name: 'Mint Whisper', usage: 'Fresh & Organic' },
        '--surface-sky': { name: 'Sky Light', usage: 'Open & Spacious' },
        '--surface-ivory': { name: 'Ivory', usage: 'Warm & High-end' },
        '--system-color-01': { name: 'Crimson', usage: 'Error State' },
        '--system-color-02': { name: 'Emerald', usage: 'Success State' },
        '--system-color-03': { name: 'Azure', usage: 'Info State' },
    };

    const rgbToHex = (color) => {
        if (!color || color === 'rgba(0, 0, 0, 0)') return '-';

        // Create a temporary canvas to convert any valid CSS color to RGB
        const canvas = document.createElement('canvas');
        canvas.width = 1;
        canvas.height = 1;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });

        try {
            ctx.fillStyle = color;
            ctx.fillRect(0, 0, 1, 1);
            const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
            return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('').toUpperCase();
        } catch (e) {
            console.error('Error converting color:', color, e);
            return '-';
        }
    };

    const ColorRow = ({ variable, className, index }) => {
        const mapping = colorMappings[variable] || { name: 'Unknown', usage: '-' };
        const [hex, setHex] = React.useState('');
        const ref = React.useRef(null);

        React.useEffect(() => {
            // Small delay to ensure styles are applied
            const timer = setTimeout(() => {
                const element = ref.current;
                if (element) {
                    try {
                        const computed = window.getComputedStyle(element).backgroundColor;
                        setHex(rgbToHex(computed));
                    } catch (e) {
                        console.warn('Failed to get computed style', e);
                    }
                }
            }, 100);

            return () => clearTimeout(timer);
        }, [variable]);

        return (
            <div className="grid grid-cols-12 gap-4 py-3 px-4 border-b border-brand-text-02/5 hover:bg-brand-text-02/5 transition-colors items-center group text-sm">
                <div className="col-span-1 text-brand-text-02/40 font-mono text-xs">{String(index).padStart(2, '0')}</div>
                <div className="col-span-2 font-bold text-brand-text-02 truncate" title={mapping.name}>{mapping.name}</div>
                <div className="col-span-3 font-mono text-xs text-brand-text-02/60 flex items-center gap-2 truncate" title={variable}>
                    {variable}
                    <button
                        onClick={() => copyToClipboard(variable)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-brand-color-01 hover:text-brand-color-03"
                    >
                        {copied === variable ? <Check size={12} /> : <Copy size={12} />}
                    </button>
                </div>
                <div className="col-span-1 flex items-center justify-center">
                    <div ref={ref} className={`w-8 h-8 rounded-lg shadow-sm border border-black/5 ${className}`} />
                </div>
                <div className="col-span-2 font-mono text-xs text-brand-text-02/80 flex items-center gap-2">
                    {hex}
                    {hex && hex !== '-' && (
                        <button
                            onClick={() => copyToClipboard(hex)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity text-brand-color-01 hover:text-brand-color-03"
                        >
                            {copied === hex ? <Check size={12} /> : <Copy size={12} />}
                        </button>
                    )}
                </div>
                <div className="col-span-3 text-brand-text-02/60 text-xs truncate" title={mapping.usage}>{mapping.usage}</div>
            </div>
        );
    };

    const MaterialCard = ({ title, className, description }) => (
        <div className={`p-6 rounded-2xl border border-white/20 shadow-lg ${className} relative overflow-hidden group`}>
            <div className="relative z-10">
                <h3 className="mb-1">{title}</h3>
                <p className="text-xs opacity-70">{description}</p>
            </div>
        </div>
    );

    const GradientRow = ({ name, style, label, index }) => (
        <div className="grid grid-cols-12 gap-4 py-4 px-4 border-b border-brand-text-02/5 hover:bg-brand-text-02/5 transition-colors items-center group">
            <div className="col-span-1 text-brand-text-02/40 font-mono text-xs">{String(index).padStart(2, '0')}</div>
            <div className="col-span-2 font-bold text-brand-text-02">{label}</div>
            <div className="col-span-3 font-mono text-xs text-brand-text-02/60 flex items-center gap-2">
                {name}
                <button
                    onClick={() => copyToClipboard(name)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-brand-color-01 hover:text-brand-color-03"
                >
                    {copied === name ? <Check size={12} /> : <Copy size={12} />}
                </button>
            </div>
            <div className="col-span-2">
                <div className="h-8 w-16 rounded-lg shadow-sm border border-black/5" style={style} />
            </div>
            <div className="col-span-2">
                <div className="h-8 w-8 rounded-lg shadow-sm border border-black/5" style={style} />
            </div>
            <div className="col-span-2">
                <div className="h-8 w-full rounded-lg shadow-sm border-2 border-white/20" style={style} />
            </div>
        </div>
    );

    // Data Arrays
    const brandColors = [
        { variable: '--brand-color-01', className: 'bg-brand-color-01' },
        { variable: '--brand-color-02', className: 'bg-brand-color-02' },
        { variable: '--brand-color-03', className: 'bg-brand-color-03' },
        { variable: '--brand-color-04', className: 'bg-brand-color-04' },
        { variable: '--brand-secondary', className: 'bg-brand-secondary' },
    ];

    const systemColors = [
        { variable: '--system-color-01', className: 'bg-system-color-01' },
        { variable: '--system-color-02', className: 'bg-system-color-02' },
        { variable: '--system-color-03', className: 'bg-system-color-03' },
    ];

    const surfaceColors = [
        { variable: '--surface-ivory', className: 'bg-surface-ivory' },
        { variable: '--surface-warm', className: 'bg-surface-warm' },
        { variable: '--surface-cool', className: 'bg-surface-cool' },
        { variable: '--surface-fresh', className: 'bg-surface-fresh' },
    ];

    const premiumSurfaceColors = [
        { variable: '--surface-pearl', className: 'bg-surface-pearl' },
        { variable: '--surface-silk', className: 'bg-surface-silk' },
        { variable: '--surface-peach', className: 'bg-surface-peach' },
        { variable: '--surface-mint', className: 'bg-surface-mint' },
        { variable: '--surface-sky', className: 'bg-surface-sky' },
    ];

    const gradients = [
        { name: '--gradient-brand-soft', style: { backgroundImage: 'var(--gradient-brand-soft)' }, label: 'Brand Soft' },
        { name: '--gradient-surface-light', style: { backgroundImage: 'var(--gradient-surface-light)' }, label: 'Surface Light' },
        { name: '--gradient-card-warm', style: { backgroundImage: 'var(--gradient-card-warm)' }, label: 'Card Warm' },
        { name: '--gradient-card-cool', style: { backgroundImage: 'var(--gradient-card-cool)' }, label: 'Card Cool' },
        { name: '--gradient-card-fresh', style: { backgroundImage: 'var(--gradient-card-fresh)' }, label: 'Card Fresh' },
        { name: '--gradient-card-neutral', style: { backgroundImage: 'var(--gradient-card-neutral)' }, label: 'Card Neutral' },

        // Stats Grid Gradients
        { name: '--gradient-stats-blue', style: { backgroundImage: 'var(--gradient-stats-blue)' }, label: 'Stats Blue' },
        { name: '--gradient-stats-orange', style: { backgroundImage: 'var(--gradient-stats-orange)' }, label: 'Stats Orange' },
        { name: '--gradient-stats-purple', style: { backgroundImage: 'var(--gradient-stats-purple)' }, label: 'Stats Purple' },
        { name: '--gradient-stats-emerald', style: { backgroundImage: 'var(--gradient-stats-emerald)' }, label: 'Stats Emerald' },
    ];

    return (
        <div className="min-h-screen bg-surface-warm/20 p-8 md:p-12 font-sans text-brand-text-02">
            <div className="max-w-6xl mx-auto space-y-16">

                {/* Header */}
                <div className="space-y-2">
                    <h1 className="text-brand-color-01 tracking-tight">System Theme</h1>
                    <p className="text-brand-text-02/60 max-w-2xl">
                        A comprehensive guide to the Pawpaths design system, featuring organic color palettes, material textures, and typography standards.
                    </p>
                </div>

                {/* Colors Section */}
                <section className="space-y-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="h-px flex-1 bg-brand-text-02/10"></div>
                        <h2 className="text-brand-text-02/40">Color Palette</h2>
                        <div className="h-px flex-1 bg-brand-text-02/10"></div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-brand-text-02/5 overflow-hidden">
                        {/* Table Header */}
                        <div className="grid grid-cols-12 gap-4 py-3 px-4 bg-brand-text-02/5 border-b border-brand-text-02/5 text-xs font-bold text-brand-text-02/40 uppercase tracking-wider">
                            <div className="col-span-1">#</div>
                            <div className="col-span-2">Color Name</div>
                            <div className="col-span-3">Variable</div>
                            <div className="col-span-1 text-center">Preview</div>
                            <div className="col-span-2">Hex Code</div>
                            <div className="col-span-3">Usage</div>
                        </div>

                        {/* Brand Colors */}
                        {brandColors.map((c, i) => <ColorRow key={c.variable} {...c} index={i + 1} />)}

                        {/* Divider Row: Message & Warning */}
                        <div className="py-2 px-4 bg-brand-text-02/5 text-xs font-bold text-brand-text-02/40 uppercase tracking-wider border-y border-brand-text-02/5">
                            Message & Warning Colors
                        </div>

                        {/* System Colors */}
                        {systemColors.map((c, i) => <ColorRow key={c.variable} {...c} index={i + 1 + brandColors.length} />)}

                        {/* Divider Row: Surfaces */}
                        <div className="py-2 px-4 bg-brand-text-02/5 text-xs font-bold text-brand-text-02/40 uppercase tracking-wider border-y border-brand-text-02/5">
                            Surfaces & Backgrounds
                        </div>

                        {/* Surface Colors */}
                        {surfaceColors.map((c, i) => <ColorRow key={c.variable} {...c} index={i + 1 + brandColors.length + systemColors.length} />)}

                        {/* Divider Row: Premium Surfaces */}
                        <div className="py-2 px-4 bg-brand-text-02/5 text-xs font-bold text-brand-text-02/40 uppercase tracking-wider border-y border-brand-text-02/5">
                            Premium Light Surfaces
                        </div>

                        {/* Premium Surface Colors */}
                        {premiumSurfaceColors.map((c, i) => <ColorRow key={c.variable} {...c} index={i + 1 + brandColors.length + systemColors.length + surfaceColors.length} />)}
                    </div>
                </section>

                {/* Materials Section */}
                <section className="space-y-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="h-px flex-1 bg-brand-text-02/10"></div>
                        <h2 className="text-brand-text-02/40">Materials & Depth</h2>
                        <div className="h-px flex-1 bg-brand-text-02/10"></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <MaterialCard
                            title="Glass Standard"
                            className="bg-white/60 backdrop-blur-xl text-brand-text-02"
                            description="bg-white/60 backdrop-blur-xl"
                        />
                        <MaterialCard
                            title="Glass Warm"
                            className="bg-surface-warm/80 backdrop-blur-md text-brand-color-01"
                            description="bg-surface-warm/80 backdrop-blur-md"
                        />
                        <MaterialCard
                            title="Glass Dark"
                            className="bg-brand-text-02/90 backdrop-blur-xl text-white"
                            description="bg-brand-text-02/90 backdrop-blur-xl"
                        />
                    </div>
                </section>

                {/* Gradients Section */}
                <section className="space-y-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="h-px flex-1 bg-brand-text-02/10"></div>
                        <h2 className="text-brand-text-02/40">Gradients & Borders</h2>
                        <div className="h-px flex-1 bg-brand-text-02/10"></div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-brand-text-02/5 overflow-hidden">
                        <div className="grid grid-cols-12 gap-4 py-3 px-4 bg-brand-text-02/5 border-b border-brand-text-02/5 text-xs font-bold text-brand-text-02/40 uppercase tracking-wider">
                            <div className="col-span-1">#</div>
                            <div className="col-span-2">Gradient Name</div>
                            <div className="col-span-3">Variable</div>
                            <div className="col-span-2">Fill</div>
                            <div className="col-span-2">Border</div>
                            <div className="col-span-2">Full Preview</div>
                        </div>
                        {gradients.map((g, i) => <GradientRow key={g.name} {...g} index={i + 1} />)}
                    </div>
                </section>

                {/* Application Gradients */}
                <section className="space-y-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="h-px flex-1 bg-brand-text-02/10"></div>
                        <h2 className="text-brand-text-02/40">Application Gradients</h2>
                        <div className="h-px flex-1 bg-brand-text-02/10"></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Footer Gradient */}
                        <div className="bg-white rounded-2xl shadow-sm border border-brand-text-02/5 p-6 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <div className="w-32 h-32 rounded-full bg-gradient-to-r from-brand-color-04 to-brand-color-03 blur-3xl"></div>
                            </div>

                            <h3 className="text-brand-text-02 mb-1">Footer Section</h3>
                            <p className="text-xs text-brand-text-02/60 mb-6 font-mono">bg-gradient-to-r from-brand-color-04 to-brand-color-03</p>

                            <div className="h-24 w-full rounded-xl shadow-inner mb-6 relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-r from-brand-color-04 to-brand-color-03"></div>
                                {/* Grid pattern overlay for texture */}
                                <div className="absolute inset-0 opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between text-sm border-b border-brand-text-02/5 pb-2">
                                    <span className="text-brand-text-02/40 font-medium">Direction</span>
                                    <span className="font-mono text-brand-text-02">To Right (90deg)</span>
                                </div>
                                <div className="flex items-center justify-between text-sm border-b border-brand-text-02/5 pb-2">
                                    <span className="text-brand-text-02/40 font-medium">Start Color</span>
                                    <div className="flex items-center gap-2">
                                        <span className="font-mono text-brand-text-02">--brand-color-04</span>
                                        <div className="w-3 h-3 rounded-full bg-brand-color-04 shadow-sm"></div>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between text-sm border-b border-brand-text-02/5 pb-2">
                                    <span className="text-brand-text-02/40 font-medium">End Color</span>
                                    <div className="flex items-center gap-2">
                                        <span className="font-mono text-brand-text-02">--brand-color-03</span>
                                        <div className="w-3 h-3 rounded-full bg-brand-color-03 shadow-sm"></div>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-brand-text-02/40 font-medium">Transparency</span>
                                    <span className="font-mono text-brand-text-02">100% (Opaque)</span>
                                </div>
                            </div>
                        </div>

                        {/* Header Bar */}
                        <div className="bg-white rounded-2xl shadow-sm border border-brand-text-02/5 p-6 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <div className="w-32 h-32 rounded-full bg-surface-warm blur-3xl"></div>
                            </div>

                            <h3 className="text-brand-text-02 mb-1">Header Bar</h3>
                            <p className="text-xs text-brand-text-02/60 mb-6 font-mono">bg-surface-warm (Solid)</p>

                            <div className="h-24 w-full rounded-xl shadow-inner mb-6 relative overflow-hidden border border-black/5">
                                <div className="absolute inset-0 bg-surface-warm"></div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between text-sm border-b border-brand-text-02/5 pb-2">
                                    <span className="text-brand-text-02/40 font-medium">Type</span>
                                    <span className="font-mono text-brand-text-02">Solid Color</span>
                                </div>
                                <div className="flex items-center justify-between text-sm border-b border-brand-text-02/5 pb-2">
                                    <span className="text-brand-text-02/40 font-medium">Fill Color</span>
                                    <div className="flex items-center gap-2">
                                        <span className="font-mono text-brand-text-02">--surface-warm</span>
                                        <div className="w-3 h-3 rounded-full bg-surface-warm border border-black/10 shadow-sm"></div>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between text-sm border-b border-brand-text-02/5 pb-2">
                                    <span className="text-brand-text-02/40 font-medium">Border Bottom</span>
                                    <span className="font-mono text-brand-text-02">border-white/50</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-brand-text-02/40 font-medium">Usage</span>
                                    <span className="font-mono text-brand-text-02">Sticky Top Nav</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Typography Section */}
                <section className="space-y-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="h-px flex-1 bg-brand-text-02/10"></div>
                        <h2 className="text-brand-text-02/40">Typography</h2>
                        <div className="h-px flex-1 bg-brand-text-02/10"></div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-brand-text-02/5 p-10 mb-6 relative overflow-hidden">
                        <div className="absolute -top-10 -right-10 opacity-[0.03] pointer-events-none select-none">
                            <span className="text-[16rem] font-black leading-none">Aa</span>
                        </div>
                        <div className="relative z-10">
                            <div className="flex items-baseline gap-4 mb-4">
                                <h3 className="text-brand-color-01 tracking-tighter">Inter</h3>
                                <span className="text-2xl font-medium text-brand-text-02/40">sans-serif</span>
                            </div>
                            <p className="text-brand-text-02/60 text-lg max-w-2xl mb-8 leading-relaxed">
                                A typeface carefully crafted & designed for computer screens. Featuring a tall x-height to aid in readability of mixed-case and lower-case text.
                            </p>
                            <div className="flex flex-wrap gap-12 text-brand-text-02">
                                <div>
                                    <span className="text-xs font-bold text-brand-text-02/40 uppercase tracking-wider block mb-2">Weights</span>
                                    <span className="font-medium">Regular (400) — Black (900)</span>
                                </div>
                                <div>
                                    <span className="text-xs font-bold text-brand-text-02/40 uppercase tracking-wider block mb-2">Character Set</span>
                                    <span className="font-medium tracking-widest">Aa Bb Cc Dd Ee Ff Gg Hh Ii Jj 123</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-brand-text-02/5 p-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                            <div className="space-y-8">
                                <div className="flex items-baseline justify-between border-b border-brand-text-02/10 pb-2">
                                    <span className="text-xs font-bold text-brand-text-02/40 uppercase tracking-wider">Headings</span>
                                    <span className="text-xs font-medium text-brand-text-02/40">Font: Inter</span>
                                </div>

                                <div className="space-y-1">
                                    <h1 className="text-brand-color-01">Heading 1</h1>
                                    <div className="flex gap-2 text-xs font-mono text-brand-text-02/40">
                                        <span>28px</span>
                                        <span>•</span>
                                        <span>Bold (700)</span>
                                        <span>•</span>
                                        <span>36px Line Height</span>
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <h2 className="text-brand-color-01">Heading 2</h2>
                                    <div className="flex gap-2 text-xs font-mono text-brand-text-02/40">
                                        <span>24px</span>
                                        <span>•</span>
                                        <span>SemiBold (600)</span>
                                        <span>•</span>
                                        <span>32px Line Height</span>
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <h3 className="text-brand-color-01">Heading 3</h3>
                                    <div className="flex gap-2 text-xs font-mono text-brand-text-02/40">
                                        <span>20px</span>
                                        <span>•</span>
                                        <span>SemiBold (600)</span>
                                        <span>•</span>
                                        <span>28px Line Height</span>
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <h4 className="text-brand-color-01">Heading 4</h4>
                                    <div className="flex gap-2 text-xs font-mono text-brand-text-02/40">
                                        <span>18px</span>
                                        <span>•</span>
                                        <span>SemiBold (600)</span>
                                        <span>•</span>
                                        <span>28px Line Height</span>
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <h5 className="text-brand-color-01">Heading 5</h5>
                                    <div className="flex gap-2 text-xs font-mono text-brand-text-02/40">
                                        <span>16px</span>
                                        <span>•</span>
                                        <span>SemiBold (600)</span>
                                        <span>•</span>
                                        <span>24px Line Height</span>
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <h6 className="text-brand-text-02">Heading 6</h6>
                                    <div className="flex gap-2 text-xs font-mono text-brand-text-02/40">
                                        <span>14px</span>
                                        <span>•</span>
                                        <span>SemiBold (600)</span>
                                        <span>•</span>
                                        <span>20px Line Height</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-8">
                                <div className="flex items-baseline justify-between border-b border-brand-text-02/10 pb-2">
                                    <span className="text-xs font-bold text-brand-text-02/40 uppercase tracking-wider">Body</span>
                                    <span className="text-xs font-medium text-brand-text-02/40">Font: Inter</span>
                                </div>

                                <div className="space-y-1">
                                    <p className="text-lg text-brand-text-02">Large body text for introductions.</p>
                                    <div className="flex gap-2 text-xs font-mono text-brand-text-02/40">
                                        <span>text-lg (18px)</span>
                                        <span>•</span>
                                        <span>Regular (400)</span>
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <p className="text-base text-brand-text-02">Standard body text used for most content. Clean, readable, and well-spaced.</p>
                                    <div className="flex gap-2 text-xs font-mono text-brand-text-02/40">
                                        <span>text-base (16px)</span>
                                        <span>•</span>
                                        <span>Regular (400)</span>
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <p className="text-sm text-brand-text-02/80">Small text for secondary information and captions.</p>
                                    <div className="flex gap-2 text-xs font-mono text-brand-text-02/40">
                                        <span>text-sm (14px)</span>
                                        <span>•</span>
                                        <span>Regular (400)</span>
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <p className="text-xs text-brand-text-02/60">Extra small text for metadata, timestamps, or hints.</p>
                                    <div className="flex gap-2 text-xs font-mono text-brand-text-02/40">
                                        <span>text-xs (12px)</span>
                                        <span>•</span>
                                        <span>Regular (400)</span>
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <p className="text-[10px] text-brand-text-02/50 uppercase tracking-wider font-bold">Tiny Label</p>
                                    <div className="flex gap-2 text-xs font-mono text-brand-text-02/40">
                                        <span>text-[10px]</span>
                                        <span>•</span>
                                        <span>Bold (700)</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
