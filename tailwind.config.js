/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
        "./components/**/*.{js,ts,jsx,tsx}",
        "./App.tsx",
        "./MainLayout.tsx"
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                gold: '#d4af37',
                'gold-light': '#f2d675',
                'admin-primary': '#f27f0d',
                'admin-bg': '#f8f7f5',
                'admin-dark': '#221910',
                'luxury-dark': '#121212',
                'luxury-card': '#1e1e1e',
            },
            fontFamily: {
                sans: ['Noto Sans TC', 'sans-serif'],
                display: ['Noto Serif TC', 'Noto Sans TC', 'serif'],
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                fadeInUp: {
                    '0%': {
                        opacity: '0',
                        transform: 'translateY(20px)',
                    },
                    '100%': {
                        opacity: '1',
                        transform: 'translateY(0)',
                    },
                },
                zoomIn: {
                    '0%': {
                        opacity: '0',
                        transform: 'scale(0.95)',
                    },
                    '100%': {
                        opacity: '1',
                        transform: 'scale(1)',
                    },
                },
                scaleDown: {
                    '0%': {
                        opacity: '0',
                        transform: 'scale(1.1)',
                        filter: 'blur(5px)',
                    },
                    '20%': {
                        opacity: '1',
                        filter: 'blur(0px)',
                    },
                    '100%': {
                        opacity: '1',
                        transform: 'scale(1)',
                        filter: 'blur(0px)',
                    },
                },
                shimmer: {
                    '0%': { backgroundPosition: '-1000px 0' },
                    '100%': { backgroundPosition: '1000px 0' },
                }
            },
            animation: {
                'fade-in': 'fadeIn 0.5s ease-out forwards',
                'fade-in-up': 'fadeInUp 0.7s ease-out forwards',
                'zoom-in': 'zoomIn 0.5s ease-out forwards',
                'scale-down': 'scaleDown 1.5s ease-out forwards',
                'shimmer': 'shimmer 2s infinite linear',
            },
        },
    },
    plugins: [],
}
