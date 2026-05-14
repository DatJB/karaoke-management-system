/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Enable dark mode using class strategy
  theme: {
    extend: {
      colors: {
        primary: {
          light: '#8b5cf6', // Violet 500
          DEFAULT: '#7c3aed', // Violet 600
          dark: '#6d28d9', // Violet 700
        },
        secondary: {
          light: '#f472b6', // Pink 400
          DEFAULT: '#db2777', // Pink 600
          dark: '#be185d', // Pink 700
        },
        background: {
          light: '#f8fafc',
          dark: '#0f172a',
        },
        surface: {
          light: '#ffffff',
          dark: '#1e293b',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Be Vietnam Pro', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
