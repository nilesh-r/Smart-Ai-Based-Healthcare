export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f5f3ff',  // violet-50
          100: '#ede9fe', // violet-100
          200: '#ddd6fe', // violet-200
          300: '#c4b5fd', // violet-300
          400: '#a78bfa', // violet-400
          500: '#8b5cf6', // violet-500
          600: '#7c3aed', // violet-600 (Main)
          700: '#6d28d9', // violet-700
          800: '#5b21b6', // violet-800
          900: '#4c1d95', // violet-900
          950: '#2e1065', // violet-950
        },
        secondary: {
          50: '#ecfdf5',  // emerald-50
          100: '#d1fae5', // emerald-100
          200: '#a7f3d0', // emerald-200
          300: '#6ee7b7', // emerald-300
          400: '#34d399', // emerald-400
          500: '#10b981', // emerald-500 (Action/Health)
          600: '#059669', // emerald-600
          700: '#047857', // emerald-700
          800: '#065f46', // emerald-800
          900: '#064e3b', // emerald-900
          950: '#022c22', // emerald-950
        },
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'ui-sans-serif', 'system-ui'],
        heading: ['Plus Jakarta Sans', 'Inter', 'ui-sans-serif', 'system-ui'],
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
        'soft-xl': '0 10px 40px -10px rgba(0, 0, 0, 0.05)',
        'glow': '0 0 20px rgba(132, 204, 22, 0.4)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'slide-up': 'slideUp 0.5s ease-out forwards',
        'pulse-slow': 'pulse 3s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
