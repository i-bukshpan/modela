import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          DEFAULT: '#C97E2A',
          light:   '#E8B366',
          bright:  '#FFAA45',
          dark:    '#A86820',
          dim:     'rgba(201,126,42,0.14)',
          glow:    'rgba(201,126,42,0.28)',
        },
        slate: {
          canvas:  '#0D0C0B',
          card:    '#141312',
          surface: '#1C1B1A',
          hover:   '#242322',
          border:  '#2E2D2B',
        },
        beige: {
          DEFAULT: '#E5DDD3',
          light:   '#F0EBE4',
          dark:    '#D5CBBF',
          muted:   '#A39B91',
          dim:     '#6A645C',
        },
        cyber: {
          blue:   '#3B82F6',
          violet: '#8B5CF6',
          pink:   '#EC4899',
        },
        status: {
          success: '#52C87A',
          warning: '#F59E0B',
          danger:  '#E85D5D',
          info:    '#3B82F6',
        },
      },
      fontFamily: {
        hebrew:  ['Heebo', 'sans-serif'],
        brand:   ['Montserrat', 'Poppins', 'sans-serif'],
        sans:    ['Heebo', 'sans-serif'],
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'gold-sm':    '0 0 16px rgba(201,126,42,0.18)',
        'gold-md':    '0 0 32px rgba(201,126,42,0.28)',
        'gold-lg':    '0 0 64px rgba(201,126,42,0.38)',
        'glass':      '0 8px 32px rgba(0,0,0,0.45), inset 0 1px 1px rgba(255,255,255,0.08)',
        'card':       '0 4px 24px rgba(0,0,0,0.35)',
        'card-hover': '0 12px 40px rgba(0,0,0,0.5)',
      },
      animation: {
        'float':        'float 8s ease-in-out infinite',
        'float-slow':   'float 12s ease-in-out infinite reverse',
        'pulse-gold':   'pulseGold 2.5s ease-in-out infinite',
        'gradient-x':   'gradientX 6s ease infinite',
        'shimmer':      'shimmer 2s linear infinite',
        'fade-in-up':   'fadeInUp 0.6s ease forwards',
        'slide-in-right':'slideInRight 0.4s ease forwards',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-20px)' },
        },
        pulseGold: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(201,126,42,0)' },
          '50%':      { boxShadow: '0 0 0 12px rgba(201,126,42,0.18)' },
        },
        gradientX: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%':      { backgroundPosition: '100% 50%' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        fadeInUp: {
          '0%':   { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%':   { opacity: '0', transform: 'translateX(-16px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },
      backgroundSize: {
        '300%': '300%',
      },
    },
  },
  plugins: [],
}

export default config
