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
          50: '#fff1f1',
          100: '#ffe1e1',
          200: '#ffc7c7',
          500: '#ef4444', // Emergency red
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d'
        },
        navy: {
          800: '#0f172a',
          900: '#020617'
        }
      }
    },
  },
  plugins: [],
}
