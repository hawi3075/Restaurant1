/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class', // Toggle via document.documentElement.classList ('dark')
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // Scans all React/JS files in src
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}