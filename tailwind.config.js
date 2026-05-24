/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#5BE096",
          dark: "#0B5D1E",
          light: "#7EEAAD",
        },
        background: "#000000",
        surface: {
          DEFAULT: "#121212",
          light: "#18181b",
          border: "#1a1a1a",
        },
        zinc: {
          800: "#27272a",
          900: "#18181b",
        },
      },
    },
  },
  plugins: [],
};
