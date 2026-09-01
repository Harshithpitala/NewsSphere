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
        brand: {
          50: '#f0f7ff',
          100: '#e0effe',
          500: '#0284c7',
          600: '#0369a1',
          700: '#075985',
          900: '#0c4a6e',
        },
        editorial: {
          bg: '#faf9f6',
          card: '#ffffff',
          text: '#1a1a1a',
          muted: '#666666',
          border: '#e5e5e5',
          accent: '#b91c1c',
        },
        darkEditorial: {
          bg: '#0f172a',
          card: '#1e293b',
          text: '#f8fafc',
          muted: '#94a3b8',
          border: '#334155',
        }
      },
      fontFamily: {
        serif: ['Georgia', 'Cambria', '"Times New Roman"', 'Times', 'serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
