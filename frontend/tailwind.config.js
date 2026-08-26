/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        nordic: {
          primary: '#0284C7',
          'primary-hover': '#0369A1',
          'primary-active': '#075985',
          'primary-soft': '#E0F2FE',
          secondary: '#7DD3FC',
          accent: '#F59E0B',
          bg: '#F0F9FF',
          'bg-subtle': '#E0F2FE',
          card: '#FFFFFF',
          text: '#0C4A6E',
          'text-secondary': '#0369A1',
          muted: '#64748B',
          border: '#BAE6FD',
          'border-strong': '#7DD3FC',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
