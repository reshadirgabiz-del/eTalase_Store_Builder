import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        store: {
          bg: 'rgb(var(--store-bg) / <alpha-value>)',
          card: 'rgb(var(--store-card) / <alpha-value>)',
          text: 'rgb(var(--store-text) / <alpha-value>)',
          muted: 'rgb(var(--store-muted) / <alpha-value>)',
          border: 'rgb(var(--store-border) / <alpha-value>)',
          accent: 'rgb(var(--store-accent) / <alpha-value>)',
          'accent-dark': 'rgb(var(--store-accent-dark) / <alpha-value>)',
          primary: 'rgb(var(--store-primary) / <alpha-value>)',
          secondary: 'rgb(var(--store-secondary) / <alpha-value>)',
        },
      },
      fontFamily: {
        serif: ['Cormorant', 'Georgia', 'serif'],
        sans: ['Montserrat', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        'fade-in-up': {
          from: { opacity: '0', transform: 'translate(-50%, 60%)' },
          to: { opacity: '1', transform: 'translate(-50%, 50%)' },
        },
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in-right': {
          from: { transform: 'translateX(100%)' },
          to: { transform: 'translateX(0)' },
        },
      },
      animation: {
        'fade-in-up': 'fade-in-up 0.8s ease-out forwards',
        'fade-in': 'fade-in 0.8s ease-out forwards',
        'slide-in-right': 'slide-in-right 0.3s ease-out forwards',
      },
    },
  },
  plugins: [],
} satisfies Config
