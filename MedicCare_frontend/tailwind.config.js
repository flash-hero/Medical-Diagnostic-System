/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html",
  ],
  theme: {
    extend: {
      colors: {
        clinical: {
          dark: "#EDD9CC",
          primary: "#8B0909",
          red: "#8B0909",
          accent: "#6B2D2D",
          muted: "#C4A882",
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['monospace'],
      },
    },
  },
  plugins: [],
};
