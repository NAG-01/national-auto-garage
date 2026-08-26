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
          primary: '#4F46E5',
          'primary-hover': '#4338CA',
          'primary-active': '#3730A3',
          'primary-soft': '#EEF2FF',
          'primary-border': '#C7D2FE',
        },
        accent: {
          danger: '#E11D48',
          'danger-hover': '#BE123C',
          'danger-soft': '#FFF1F2',
          'danger-border': '#FECDD3',
        },
        success: {
          DEFAULT: '#059669',
          hover: '#047857',
          soft: '#ECFDF5',
          border: '#A7F3D0',
          text: '#065F46',
        },
        warning: {
          DEFAULT: '#D97706',
          soft: '#FFFBEB',
          border: '#FDE68A',
          text: '#92400E',
        },
        light: {
          bg: '#F8FAFC',
          'bg-subtle': '#F1F5F9',
          card: '#FFFFFF',
          text: '#0F172A',
          'text-secondary': '#475569',
          muted: '#64748B',
          border: '#E2E8F0',
          'border-strong': '#CBD5E1',
        },
        dark: {
          bg: '#0B1120',
          'bg-subtle': '#111827',
          card: '#172033',
          elevated: '#1E293B',
          sidebar: '#0F172A',
          navbar: '#0F172A',
          text: '#F8FAFC',
          'text-secondary': '#CBD5E1',
          muted: '#94A3B8',
          border: '#263449',
          'border-strong': '#334155',
          primary: '#6366F1',
          'primary-hover': '#818CF8',
          'primary-soft': 'rgba(99,102,241,0.15)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'theme-xs': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'theme-sm': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
        'theme-md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
      },
    },
  },
  plugins: [],
}
