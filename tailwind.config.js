/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: { extend: { colors: { forest: '#087F5B', mint: '#E8F7F0', ink: '#172B24' }, fontFamily: { sans: ['DM Sans','sans-serif'], display: ['Manrope','sans-serif'] } } },
  plugins: []
}