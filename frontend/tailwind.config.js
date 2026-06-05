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
          orange: "#FF8A00",
          dark: "#0F172A",
          gray: "#64748B",
          border: "#E2E8F0",
          blue: "#0B1222",
          lightBlue: "#F8FAFC",
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'grid-pattern': "radial-gradient(circle, #E2E8F0 1px, transparent 1px)",
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}
