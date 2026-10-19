/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          950: '#0a0a0b',
          900: '#101113',
          850: '#15161a',
          800: '#1b1d22',
          700: '#26282e',
          600: '#34373f',
          500: '#4b4f59',
          400: '#6b707c',
          300: '#9aa0ad',
          200: '#c8ccd4',
          100: '#e6e8ec',
        },
        ember: {
          50: '#fbf3ea',
          100: '#f5e3cf',
          200: '#ecc69d',
          300: '#e0a36b',
          400: '#d4824a',
          500: '#c4672f',
          600: '#a55227',
          700: '#823f22',
          800: '#5f301d',
          900: '#3d1f13',
        },
        bone: '#f4efe6',
        warm: '#e8e1d3',
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', 'ui-serif', 'Georgia', 'serif'],
        sans: ['"Inter"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      letterSpacing: {
        tightish: '-0.015em',
        widestish: '0.18em',
      },
      maxWidth: {
        prose2: '68ch',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'ken-burns': {
          '0%': { transform: 'scale(1) translate3d(0,0,0)' },
          '100%': { transform: 'scale(1.08) translate3d(-1.5%, -1%, 0)' },
        },
        'pulse-line': {
          '0%, 100%': { opacity: '0.3' },
          '50%': { opacity: '1' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.8s cubic-bezier(0.22, 1, 0.36, 1) both',
        'fade-in': 'fade-in 1.2s ease both',
        'ken-burns': 'ken-burns 16s ease-out infinite alternate',
        'pulse-line': 'pulse-line 2.4s ease-in-out infinite',
      },
      backgroundImage: {
        'grain':
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E\")",
        'cinematic':
          'radial-gradient(120% 90% at 50% 0%, transparent 40%, rgba(10,10,11,0.45) 75%, rgba(10,10,11,0.92) 100%)',
        'hero-scrim':
          'linear-gradient(180deg, rgba(10,10,11,0.55) 0%, rgba(10,10,11,0.2) 35%, rgba(10,10,11,0.75) 100%)',
      },
    },
  },
  plugins: [],
};
