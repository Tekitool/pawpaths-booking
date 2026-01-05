/** @type {import('tailwindcss').Config} */
const config = {
    content: [
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./lib/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: 'oklch(var(--brand-color-01) / <alpha-value>)',
                    foreground: '#ffffff',
                    container: 'oklch(var(--brand-color-02) / <alpha-value>)', // Mapped to brand-color-02
                },

                // NEW: Variable-based Secondary
                secondary: 'oklch(var(--brand-secondary) / <alpha-value>)',

                surface: {
                    DEFAULT: '#fffbff',
                    variant: '#e7e0ec',
                    container: '#f3edf7',
                    // NEW: Semantic Surfaces
                    warm: 'oklch(var(--surface-warm) / <alpha-value>)', // Replaces creamy-white
                    cool: 'oklch(var(--surface-cool) / <alpha-value>)', // Replaces alice-blue
                    fresh: 'oklch(var(--surface-fresh) / <alpha-value>)', // Replaces mint-mist

                    // New Premium Collection
                    pearl: 'oklch(var(--surface-pearl) / <alpha-value>)',
                    silk: 'oklch(var(--surface-silk) / <alpha-value>)',
                    peach: 'oklch(var(--surface-peach) / <alpha-value>)',
                    mint: 'oklch(var(--surface-mint) / <alpha-value>)',
                    sky: 'oklch(var(--surface-sky) / <alpha-value>)',
                    ivory: 'oklch(var(--surface-ivory) / <alpha-value>)',
                },

                // New System Primitives
                'system-color-01': 'oklch(var(--system-color-01) / <alpha-value>)',
                'system-color-02': 'oklch(var(--system-color-02) / <alpha-value>)',
                'system-color-03': 'oklch(var(--system-color-03) / <alpha-value>)',

                // Map Semantics to Primitives (For backward compatibility)
                error: 'oklch(var(--system-color-01) / <alpha-value>)',
                success: 'oklch(var(--system-color-02) / <alpha-value>)',
                info: 'oklch(var(--system-color-03) / <alpha-value>)',
                warning: 'oklch(var(--status-warning) / <alpha-value>)',

                // Mapped Text/Functional Colors
                'brand-text-02': 'oklch(var(--brand-text-02) / <alpha-value>)',
                'brand-text-03': 'oklch(var(--brand-text-03) / <alpha-value>)',

                // New Generic Names
                'brand-color-01': 'oklch(var(--brand-color-01) / <alpha-value>)',
                'brand-color-02': 'oklch(var(--brand-color-02) / <alpha-value>)',
                'brand-color-03': 'oklch(var(--brand-color-03) / <alpha-value>)',
                'brand-color-04': 'oklch(var(--brand-color-04) / <alpha-value>)',
                'accent': 'oklch(var(--brand-color-03) / <alpha-value>)', // Semantic Alias

                // Legacy mappings
                'primary-container': 'oklch(var(--brand-color-02) / <alpha-value>)',

                // Stats Grid Borders
                'stats-blue': 'var(--border-stats-blue)',
                'stats-orange': 'var(--border-stats-orange)',
                'stats-purple': 'var(--border-stats-purple)',
                'stats-emerald': 'var(--border-stats-emerald)',
            },
            borderRadius: {
                'md3-xs': '4px',
                'md3-sm': '8px',
                'md3-md': '12px',
                'md3-lg': '16px',
                'md3-xl': '28px',
            },
            boxShadow: {
                'level-1': '0px 1px 3px rgba(0,0,0,0.15)',
                'level-3': '0px 4px 8px rgba(0,0,0,0.3)',
                // Semantic Shadows
                'glow-accent': 'var(--shadow-glow-accent)',
                'glow-success': 'var(--shadow-glow-success)',
                'glow-error': 'var(--shadow-glow-error)',
                'glow-info': 'var(--shadow-glow-info)',
            },
            backgroundImage: {
                'gradient-card-warm': 'var(--gradient-card-warm)',
                'gradient-card-cool': 'var(--gradient-card-cool)',
                'gradient-card-fresh': 'var(--gradient-card-fresh)',
                'gradient-card-neutral': 'var(--gradient-card-neutral)',
                'gradient-brand-soft': 'var(--gradient-brand-soft)',
                'gradient-surface-light': 'var(--gradient-surface-light)',

                // Stats Grid Gradients
                'gradient-stats-blue': 'var(--gradient-stats-blue)',
                'gradient-stats-orange': 'var(--gradient-stats-orange)',
                'gradient-stats-purple': 'var(--gradient-stats-purple)',
                'gradient-stats-emerald': 'var(--gradient-stats-emerald)',
            }
        },
    },
    plugins: [],
};

export default config;
