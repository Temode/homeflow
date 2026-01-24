/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#14A800',
        accent: '#00D4AA',
        warning: '#F59E0B',
        danger: '#EF4444',
      },
      fontFamily: {
        display: ['Fraunces', 'serif'],
        sans: ['Outfit', 'sans-serif'],
      },
      borderRadius: {
        'button': '12px',
        'card': '16px',
        'modal': '24px',
      },
    },
  },
  plugins: [],
}
