/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: 'rgb(var(--color-bg) / <alpha-value>)',
        card: 'rgb(var(--color-card) / <alpha-value>)',
        'card-hover': 'rgb(var(--color-card-hover) / <alpha-value>)',
        border: 'rgb(var(--color-border) / <alpha-value>)',
        'border-subtle': 'rgb(var(--color-border-subtle) / <alpha-value>)',
        'accent': 'rgb(var(--color-accent) / <alpha-value>)',
        blue: 'rgb(var(--color-blue) / <alpha-value>)',
        amber: 'rgb(var(--color-amber) / <alpha-value>)',
        red: 'rgb(var(--color-red) / <alpha-value>)',
        'text-primary': 'rgb(var(--color-text-primary) / <alpha-value>)',
        'text-muted': 'rgb(var(--color-text-muted) / <alpha-value>)',
        'text-subtle': 'rgb(var(--color-text-subtle) / <alpha-value>)',
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
