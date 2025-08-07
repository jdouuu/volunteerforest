import forms from '@tailwindcss/forms';

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#3a7d44',
        secondary: '#5dbb63',
        accent: '#254d32',
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [
    forms,
  ],
}