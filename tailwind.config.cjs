@type {import('tailwindcss').Config}
module.exports = {
  content: [
    './app/**/*.{vue,js,ts}',
    './components/**/*.{vue,js,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue'
  ],
  theme: {
    extend: {
      colors: {
        primary: '#f0e7d5',
        secondary: '#212842',
        accent: '#4fd1c5',
        bg: '#f0e7d5',
        card: '#ffffff'
      }
    },
  },
  plugins: [
    require('@tailwindcss/aspect-ratio')
  ],
}