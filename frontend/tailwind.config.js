/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        maxy: {
          50: '#eef6ff',
          100: '#d9ebff',
          200: '#bcdbff',
          300: '#8ec3ff',
          400: '#59a0ff',
          500: '#327cff',
          600: '#1b5df5',
          700: '#1446e1',
          800: '#1739b6',
          900: '#18338f',
          950: '#122057',
        },
      },
    },
  },
  plugins: [],
}
