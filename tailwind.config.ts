import type { Config } from 'tailwindcss'

export default {
  content: [
    './app/**/*.{vue,js,ts,jsx,tsx}',
    './components/**/*.{vue,js,ts}',
    './pages/**/*.{vue,js,ts}',
    './layouts/**/*.{vue,js,ts}',
    './plugins/**/*.{js,ts}',
  ],
  theme: {
    extend: {
      colors: {
        rc: {
          red:       '#E53935', 
          redDark:   '#C62828', 
          redLight:  '#EF5350', 
          yellow:    '#F5C800', 
          white:     '#FFFFFF',
          gray:      '#F5F5F5',
          grayDark:  '#333333',
          dark:      '#1A0000', 
          whatsapp:  '#25D366', 
          whatsappD: '#1ebe57', 
        },

        primary: {
          50:  '#fff0f0',
          100: '#ffd9d9',
          200: '#ffb3b3',
          300: '#ff8080',
          400: '#EF5350',
          500: '#E53935', 
          600: '#C62828', 
          700: '#B71C1C',
          800: '#8e1010',
          900: '#5e0d0d',
          950: '#3a0707',
        },

        accent: {
          50:  '#fffbe6',
          100: '#fff4b8',
          200: '#ffe866',
          300: '#F5C800', 
          400: '#d4ac00',
          500: '#b39200',
          600: '#8c7200',
          700: '#665300',
          800: '#403300',
          900: '#1a1400',
          950: '#0d0a00',
        },

        danger: {
          50:  '#fff1f1',
          100: '#ffe0e0',
          200: '#ffc5c5',
          300: '#ff9e9e',
          400: '#ff6464',
          500: '#f83535',
          600: '#e51414',
          700: '#c10e0e',
          800: '#a01010',
          900: '#841414',
          950: '#480404',
        },

        surface: {
          50:  '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          900: '#0f172a',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card:       '0 2px 8px 0 rgba(0,0,0,0.08)',
        'card-hover':'0 8px 24px 0 rgba(215,43,43,0.18)',
      },
    },
  },
  plugins: [],
} satisfies Config
