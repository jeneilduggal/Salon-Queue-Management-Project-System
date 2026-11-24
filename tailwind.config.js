/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        charcoal: {
          900: '#111827',
          800: '#1F2937',
          700: '#374151',
          600: '#4B5563',
          500: '#6B7280',
        },
        gold: {
          50: '#FFFDF5',
          100: '#FEF9E7',
          200: '#FDF0C5',
          300: '#FBE39A',
          400: '#F6CD5E',
          500: '#D4A017', // Primary gold accent
          600: '#B8860B',
          700: '#916707',
          800: '#75500B',
          900: '#63420E',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      animation: {
        'pulse-subtle': 'pulse 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-subtle': 'bounce 2s infinite',
        'gold-glow': 'goldGlow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        goldGlow: {
          '0%': { boxShadow: '0 0 15px rgba(212, 160, 23, 0.4)' },
          '100%': { boxShadow: '0 0 30px rgba(212, 160, 23, 0.9)' },
        }
      }
    },
  },
  plugins: [],
}
