/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        concrete: {
          bg: '#E4E7EA',
          card: '#FFFFFF',
          border: '#D3D8DE',
          text: '#0F172A',
          muted: '#667085',
          orange: '#EA580C',
          navy: '#0F172A',
          green: '#15803D',
          red: '#B91C1C',
        }
      },
      fontFamily: {
        heading: ["'Google Sans'", "'Product Sans'", "system-ui", "-apple-system", "sans-serif"],
        sans: ["'Google Sans'", "'Product Sans'", "system-ui", "-apple-system", "sans-serif"],
        mono: ["'Google Sans'", "'Product Sans'", "system-ui", "-apple-system", "sans-serif"],
      }
    },
  },
  plugins: [],
}
