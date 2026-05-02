/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#0E0F14',
        card: '#161820',
        'card-hover': '#1C1E28',
        border: '#2A2C3A',
        'border-subtle': '#1F2130',
        'accent': 'var(--color-accent)',
        blue: '#4B9EFF',
        amber: '#F5A623',
        red: '#FF5F5F',
        'text-primary': '#E2E4F0',
        'text-muted': '#8B8FA8',
        'text-subtle': '#5A5F75',
      },
      fontFamily: {
        heading: ['Syne', 'sans-serif'],
        mono: ['"DM Mono"', 'monospace'],
        body: ['Inter', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'fade-up': 'fadeUp 0.25s ease-out',
        'slide-up': 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        'scale-in': 'scaleIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        'check-pop': 'checkPop 0.18s ease-out',
        'pulse-soft': 'pulseSoft 2.5s ease-in-out infinite',
        'shimmer': 'shimmer 1.8s linear infinite',
      },
      keyframes: {
        fadeIn:   { from: { opacity: '0' }, to: { opacity: '1' } },
        fadeUp:   { from: { opacity: '0', transform: 'translateY(6px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        slideUp:  { from: { opacity: '0', transform: 'translateY(12px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        scaleIn:  { from: { opacity: '0', transform: 'scale(0.95)' }, to: { opacity: '1', transform: 'scale(1)' } },
        checkPop: { '0%': { transform: 'scale(1)' }, '40%': { transform: 'scale(1.22)' }, '100%': { transform: 'scale(1)' } },
        pulseSoft:{ '0%,100%': { opacity: '1' }, '50%': { opacity: '0.4' } },
        shimmer:  { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
      },
      boxShadow: {
        'glow-accent': '0 0 24px var(--color-accent-glow)',
        'glow-blue': '0 0 24px rgba(75, 158, 255, 0.12)',
        'card': '0 1px 3px rgba(0,0,0,0.3), 0 4px 16px rgba(0,0,0,0.25)',
      },
    },
  },
  plugins: [],
};
