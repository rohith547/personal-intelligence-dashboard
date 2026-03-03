/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          900: '#0c4a6e',
        },
        surface: {
          DEFAULT: '#ffffff',
          dark: '#1c1c1e',
        },
        mood: {
          1: '#ef4444',
          2: '#f97316',
          3: '#eab308',
          4: '#22c55e',
          5: '#3b82f6',
        }
      },
    },
  },
  plugins: [],
}
