/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      colors: {
        // Meeting Tycoon palette (from design system)
        brand: {
          50: '#F4F2FF',
          100: '#EBE7FF',
          200: '#D6CDFF',
          300: '#B8A8FF',
          400: '#9F88FF',
          500: '#7B61FF', // secondary accent
          600: '#6C5CE7', // primary
          700: '#5848C2',
          800: '#46399C',
          900: '#2E2470',
        },
        ink: {
          50: '#F1F5F9',
          100: '#E2E8F0',
          200: '#CBD5E1',
          300: '#94A3B8',
          400: '#647488',
          500: '#475569',
          600: '#334155',
          700: '#1E293B',
          800: '#0F172A',
          900: '#020617',
        },
        success: '#10B981',
        successLight: '#22C55E',
        warning: '#F59E0B',
        danger: '#EF4444',
        crisis: '#EF4444',
      },
      boxShadow: {
        // Fluent/Teams-style shadows: small offset, low alpha, hairline border does most of the work
        'el-1': '0 1px 2px rgba(15,23,42,0.06)',
        'el-2': '0 1px 2px rgba(15,23,42,0.06), 0 2px 4px rgba(15,23,42,0.04)',
        'el-3': '0 4px 8px rgba(15,23,42,0.08), 0 8px 16px rgba(15,23,42,0.06)',
        'el-4': '0 12px 24px rgba(15,23,42,0.12), 0 20px 40px rgba(15,23,42,0.10)',
        // Subtle ink shadow on primary buttons — no colored halo
        'btn-primary': '0 1px 2px rgba(15,23,42,0.10)',
      },
      borderRadius: {
        // Tightened to Microsoft Fluent values
        'xs': '2px',
        'sm': '4px',
        'md': '6px',
        'lg': '8px',
        'xl': '10px',
        '2xl': '14px',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'pop-in': {
          '0%': { opacity: '0', transform: 'scale(0.92)' },
          '60%': { opacity: '1', transform: 'scale(1.02)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'confetti': {
          '0%': { transform: 'translateY(-20px) rotate(0deg)', opacity: '1' },
          '100%': { transform: 'translateY(120vh) rotate(720deg)', opacity: '0' },
        },
      },
      animation: {
        'fade-in': 'fade-in 280ms ease-out',
        'pop-in': 'pop-in 380ms cubic-bezier(0.22, 1, 0.36, 1)',
        'confetti': 'confetti 2.4s ease-in forwards',
      },
    },
  },
  plugins: [],
};
