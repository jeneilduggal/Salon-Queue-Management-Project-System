/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        charcoal: { 50:'#F6F6F6',100:'#E7E7E7',200:'#D1D2D1',300:'#B0B1B0',400:'#878987',500:'#676967',600:'#4E504E',700:'#3A3C3A',800:'#242724',900:'#111827',950:'#111311' },
        gold: { 50:'#FFFDF5',100:'#FEF9E7',200:'#FDF0C5',300:'#FBE39A',400:'#F6CD5E',500:'#D4A017',600:'#B8860B',700:'#916707',800:'#75500B',900:'#63420E' },
        ivory: { 50:'#FAF8F3',100:'#F4F0E7',200:'#EBE5D6',300:'#DFD7C1',400:'#CFC3A4',500:'#B8A882' },
        forest: { 50:'#F1F6F4',100:'#DDE9E4',200:'#BDD5CC',300:'#93B9AC',400:'#649685',500:'#3A7463',600:'#265749',700:'#1F473C',800:'#183C32',900:'#122D26',950:'#0A1B16' },
        copper: { 50:'#FBF5F1',100:'#F5E7DF',200:'#ECCDC0',300:'#DEAC98',400:'#CD866F',500:'#B47752',600:'#9E5F3D',700:'#834C31',800:'#6C3E2A',900:'#5A3525' },
        sage: { 50:'#F4F6F3',100:'#E7EBE5',200:'#D2D9CE',300:'#B6C3B1',400:'#A6B3A0',500:'#8A9983',600:'#6D7C66',700:'#566250',800:'#454E41',900:'#3B4337' }
      },
      fontFamily: {
        sans: ['Inter','system-ui','-apple-system','sans-serif'],
        display: ['Cinzel','Georgia','serif'],
        editorial: ['Playfair Display','Georgia','serif'],
        serif: ['Playfair Display','Georgia','serif']
      },
      animation: {
        'pulse-subtle':'pulse 2.5s cubic-bezier(0.4,0,0.6,1) infinite',
        'bounce-subtle':'bounce 2s infinite',
        'gold-glow':'goldGlow 2s ease-in-out infinite alternate'
      },
      keyframes: {
        goldGlow: { '0%':{boxShadow:'0 0 15px rgba(212,160,23,.4)'}, '100%':{boxShadow:'0 0 30px rgba(212,160,23,.9)'} }
      }
    }
  },
  plugins: []
};
