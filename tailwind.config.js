const tokens = require('./theme/tokens.json');

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      fontSize: tokens.tipografia,
      spacing: tokens.espacamentos,
      borderRadius: tokens.raios,
      colors: {
        primary: {
          DEFAULT: tokens.identidade.principal,
          dark: tokens.identidade.escura,
          light: tokens.identidade.clara,
        },
        background: tokens.temas.escuro.fundo,
        surface: {
          DEFAULT: tokens.comum.superficiePerfil,
          light: tokens.temas.escuro.superficie,
          border: tokens.temas.escuro.bordaNavegacao,
        },
        zinc: {
          800: tokens.temas.escuro.borda,
          900: tokens.temas.escuro.superficie,
        },
      },
    },
  },
  plugins: [],
};
