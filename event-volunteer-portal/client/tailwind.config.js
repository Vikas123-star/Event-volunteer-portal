/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        body: ['"Inter"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      colors: {
        ink: {
          950: '#07070b',
          900: '#0b0b12',
          800: '#11111a',
          700: '#171722',
          600: '#1f1f2e',
          500: '#2a2a3d',
        },
        violet: {
          glow: '#7c5cff',
        },
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(124,92,255,.35), 0 20px 60px -20px rgba(124,92,255,.5)',
        soft: '0 10px 40px -10px rgba(0,0,0,0.5)',
      },
      animation: {
        'fade-in-up': 'fadeInUp .5s ease-out both',
        'pulse-slow': 'pulse 3s cubic-bezier(.4,0,.6,1) infinite',
        shimmer: 'shimmer 2s linear infinite',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
      },
      backgroundImage: {
        'grid-faint':
          'linear-gradient(to right, rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.04) 1px, transparent 1px)',
        'noise':
          "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.9'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='.35'/></svg>\")",
      },
    },
  },
  plugins: [],
};
