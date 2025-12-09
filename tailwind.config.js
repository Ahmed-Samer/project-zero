/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  // ضيف السطر ده جوه الأقواس المربعة 👇
  plugins: [
    require('@tailwindcss/typography'),
  ],
}