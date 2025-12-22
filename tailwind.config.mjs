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
                    DEFAULT: '#4d341a', // Pawpaths Brown
                    foreground: '#ffffff',
                    container: '#fff2b1', // Pawpaths Cream
                },
                secondary: '#6b5d48',
                surface: {
                    DEFAULT: '#fffbff',
                    variant: '#e7e0ec',
                    container: '#f3edf7',
                },
                error: '#ba1a1a',
                success: '#006e1c',
                // Keep existing custom colors if any, or map them
                'pawpaths-brown': '#4d341a',
                'pawpaths-cream': '#fff2b1',
                'creamy-white': '#FDF8F1',
                'alice-blue': '#F0F4F8',
                'mint-mist': '#F2F9F7',
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
            }
        },
    },
    plugins: [],
};

export default config;
