/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        sage: {
          50: '#f5f8f4',
          100: '#e8f0e6',
          200: '#cfe0c9',
          300: '#a9c6a0',
          400: '#7fa874',
          500: '#5d8a52',
          600: '#48703f',
          700: '#395a33',
          800: '#2e4829',
          900: '#243a21',
        },
        cream: {
          50: '#fdfdf8',
          100: '#faf9f0',
          200: '#f4f2e4',
          300: '#ebe8d4',
        },
        sand: {
          100: '#ecead8',
          200: '#dedac0',
          300: '#cdc8a4',
        },
        accent: {
          amber: '#d9a441',
          clay: '#c97b5a',
          sky: '#7ba6c7',
        },
        error: {
          500: '#c0533a',
          600: '#a4452f',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Fraunces', 'Georgia', 'serif'],
      },
      boxShadow: {
        soft: '0 2px 12px -2px rgba(46, 72, 41, 0.08)',
        card: '0 4px 24px -6px rgba(46, 72, 41, 0.12)',
        float: '0 8px 32px -8px rgba(46, 72, 41, 0.18)',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'draw-dash': {
          '0%': { 'stroke-dashoffset': '360' },
          '100%': { 'stroke-dashoffset': '0' },
        },
        'pulse-soft': {
          '0%, 100%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.04)', opacity: '0.9' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.5s ease-out both',
        'slide-up': 'slide-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) both',
        'scale-in': 'scale-in 0.4s cubic-bezier(0.16, 1, 0.3, 1) both',
        'pulse-soft': 'pulse-soft 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
