/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          gold: '#D4A62A',
          'gold-dark': '#B8860B',
          'gold-deep': '#8F6506',
          magenta: '#C2185B',
          'magenta-dark': '#9c1348',
          cream: '#FFF9EC',
          'cream-dark': '#F5ECD4',
          dark: '#2B2B2B',
          borderWarm: '#EADFC7',
        },
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Montserrat"', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        boutique: '0 10px 25px -5px rgba(184, 134, 11, 0.1), 0 8px 10px -6px rgba(194, 24, 91, 0.05)',
      },
    },
  },
  plugins: [],
};
