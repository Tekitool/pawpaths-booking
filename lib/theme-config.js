// lib/theme-config.js
export const BRAND_COLORS = {
    // Main Brand Color (Generic Name)
    brand01: {
        hex: '#4d341a',      // For Email Clients (Legacy support)
        rgb: [77, 52, 26],   // For PDF Generation (jsPDF)
        oklch: '32.1% 0.079 68.3' // For Modern CSS
    },
    brand02: {
        hex: '#fff2b1',
        rgb: [255, 242, 177],
        oklch: '94.8% 0.10 96.4'
    },
    brand03: {
        hex: '#FF7518',
        rgb: [255, 117, 24],
        oklch: '69.8% 0.21 42.6' // Pawpath Amber
    },
    brand04: {
        hex: '#FFBD00',
        rgb: [255, 189, 0],
        oklch: '81% 0.17 82' // Vibrant Golden Yellow
    },
    secondary: { hex: '#6b5d48', oklch: '44.8% 0.05 68.3' }, // Muted Brown
    text: {
        secondary: { hex: '#475569', oklch: '48.4% 0.04 263.4' }, // brand-text-02
        highlight: { hex: '#7c3aed', oklch: '48.8% 0.27 290.4' }  // brand-text-03
    },
    system: {
        color01: { hex: '#ba1a1a', oklch: '48.5% 0.21 28.6' },   // Red (Destructive/Error)
        color02: { hex: '#006e1c', oklch: '41.6% 0.16 142.1' },  // Green (Success)
        color03: { hex: '#2563eb', oklch: '58.6% 0.23 265.5' }   // Blue (Info/Action)
    },
    status: {
        error: { hex: '#ba1a1a', oklch: '48.5% 0.21 28.6' },   // Red
        success: { hex: '#006e1c', oklch: '41.6% 0.16 142.1' }, // Green
        info: { hex: '#2563eb', oklch: '58.6% 0.23 265.5' },    // Blue
        warning: { hex: '#d97706', oklch: '67.5% 0.18 78.4' }   // Amber
    },
    surfaces: {
        warm: { hex: '#FDF8F1', rgb: [253, 248, 241], oklch: '98.5% 0.02 85.0' },   // prev: creamy-white
        cool: { hex: '#F0F4F8', rgb: [240, 244, 248], oklch: '96.8% 0.02 245.0' },  // prev: alice-blue
        fresh: { hex: '#F2F9F7', rgb: [242, 249, 247], oklch: '97.2% 0.02 175.0' }  // prev: mint-mist
    },
    premiumSurfaces: {
        pearl: { hex: '#FCFCFD', oklch: '98.9% 0.005 180.0', desc: 'Ultra-pure Base' },
        silk: { hex: '#FAF9F7', oklch: '97.5% 0.008 45.0', desc: 'Sophisticated Comfort' },
        peach: { hex: '#FAF8F5', oklch: '97.4% 0.013 55.0', desc: 'Warm & Friendly' },
        mint: { hex: '#F7FCFA', oklch: '97.6% 0.010 160.0', desc: 'Fresh & Organic' },
        sky: { hex: '#F8F9FC', oklch: '97.3% 0.010 235.0', desc: 'Open & Spacious' }
    },
    stats: {
        blue: {
            gradient: 'linear-gradient(to right, rgb(239 246 255 / 0.8), rgb(238 242 255 / 0.8))',
            border: '#dbeafe'
        },
        orange: {
            gradient: 'linear-gradient(to right, rgb(255 247 237 / 0.8), rgb(255 251 235 / 0.8))',
            border: '#ffedd5'
        },
        purple: {
            gradient: 'linear-gradient(to right, rgb(250 245 255 / 0.8), rgb(253 244, 255 / 0.8))',
            border: '#f3e8ff'
        },
        emerald: {
            gradient: 'linear-gradient(to right, rgb(236 253 245 / 0.8), rgb(240 253 250 / 0.8))',
            border: '#d1fae5'
        }
    }
};

export const TYPOGRAPHY = {
    h1: { size: 28, weight: 700, lineHeight: 36 },
    h2: { size: 24, weight: 600, lineHeight: 32 },
    h3: { size: 20, weight: 600, lineHeight: 28 },
    h4: { size: 18, weight: 600, lineHeight: 28 },
    h5: { size: 16, weight: 600, lineHeight: 24 },
    h6: { size: 14, weight: 600, lineHeight: 20 }
};
