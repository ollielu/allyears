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
        'planner': {
          'bg': '#fafafa',
          'card': '#f5f5f5',
          'border': '#e5e5e5',
          'today': '#2563eb',
          'today-bg': '#dbeafe',
          'badge': '#dc2626',
        }
      }
    },
  },
  plugins: [],
}
