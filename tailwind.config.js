/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './popup/**/*.{ts,tsx,html}',
    './options/**/*.{ts,tsx,html}',
    './src/**/*.{ts,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        // Primary brand colors
        brand: {
          50:  '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          950: '#1e1b4b',
        },
        // Accent - electric violet
        accent: {
          50:  '#fdf4ff',
          100: '#fae8ff',
          200: '#f5d0fe',
          300: '#f0abfc',
          400: '#e879f9',
          500: '#d946ef',
          600: '#c026d3',
          700: '#a21caf',
          800: '#86198f',
          900: '#701a75',
          950: '#4a044e',
        },
        // Success green
        success: {
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
        },
        // Warning amber
        warning: {
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
        },
        // Danger red
        danger: {
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
        },
        // Glass surfaces (dark mode)
        glass: {
          100: 'rgba(255,255,255,0.05)',
          200: 'rgba(255,255,255,0.08)',
          300: 'rgba(255,255,255,0.12)',
          400: 'rgba(255,255,255,0.18)',
          500: 'rgba(255,255,255,0.25)',
        },
        // Dark backgrounds
        dark: {
          900: '#0a0a14',
          800: '#0f0f1e',
          700: '#13132a',
          600: '#1a1a35',
          500: '#222240',
          400: '#2d2d54',
        },
      },
      backgroundImage: {
        'gradient-brand': 'linear-gradient(135deg, #6366f1 0%, #d946ef 100%)',
        'gradient-dark': 'linear-gradient(180deg, #0f0f1e 0%, #13132a 100%)',
        'gradient-card': 'linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(217,70,239,0.08) 100%)',
        'gradient-success': 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
        'gradient-danger': 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
        'glow-brand': 'radial-gradient(circle at 50% 50%, rgba(99,102,241,0.3) 0%, transparent 70%)',
      },
      boxShadow: {
        'glass': '0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)',
        'glass-lg': '0 8px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)',
        'brand': '0 0 20px rgba(99,102,241,0.4)',
        'brand-lg': '0 0 40px rgba(99,102,241,0.5)',
        'inner-brand': 'inset 0 0 20px rgba(99,102,241,0.15)',
        'neon': '0 0 10px rgba(99,102,241,0.8), 0 0 20px rgba(99,102,241,0.5), 0 0 40px rgba(99,102,241,0.3)',
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'spin-slow': 'spin 3s linear infinite',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'fade-in': 'fadeIn 0.2s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'count-up': 'countUp 0.6s ease-out',
        'shimmer': 'shimmer 2s linear infinite',
        'bar-grow': 'barGrow 0.8s ease-out forwards',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 10px rgba(99,102,241,0.3)' },
          '100%': { boxShadow: '0 0 30px rgba(99,102,241,0.8)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        countUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        barGrow: {
          '0%': { width: '0%' },
          '100%': { width: 'var(--bar-width)' },
        },
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
    },
  },
  plugins: [],
}
