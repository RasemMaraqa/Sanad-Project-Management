const olive = { 50: '#f4f7ed', 100: '#e6edd6', 200: '#d3dfb6', 300: '#b7c98a', 400: '#93aa5a', 500: '#748b3d', 600: '#5d7132', 700: '#485827', 800: '#34421f', 900: '#29351c', 950: '#232624' }

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: { sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'] },
      colors: {
        ink: '#142433',
        cloud: '#f7f8f5',
        cobalt: olive,
        violet: olive,
        sumac: { 50: '#fff1f2', 500: '#f43f5e', 600: '#e11d48' },
      },
      boxShadow: { panel: '0 1px 2px rgba(20,36,51,.05), 0 12px 32px rgba(72,88,39,.08)' },
    },
  },
  plugins: [],
}
