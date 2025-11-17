/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',  // Cubre src si usas
  ],
  theme: {
    extend: {
      colors: {
        // Opcional: Tus custom colors de globals.css
        primary: { 500: '#6366f1' },
      },
    },
  },
  plugins: [],
  darkMode: 'class',  // Para dark theme en html
};