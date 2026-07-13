/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './App.tsx',
    './index.tsx',
    './components/**/*.{ts,tsx}',
    './pages/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Open Sans', 'Segoe UI', 'Arial', 'sans-serif'],
      },
      colors: {
        vna: {
          blue: '#006885',
          navy: '#12355B',
          gold: '#DBA410',
          goldHover: '#C49009',
          bg: '#F5F7FA',
        },
      },
    },
  },
  safelist: [
    'bg-vna-blue',
    'bg-vna-gold',
    'text-vna-blue',
    'text-vna-gold',
    'border-vna-blue',
    'focus:ring-vna-blue',
  ],
  plugins: [],
};
