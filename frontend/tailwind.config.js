/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#0f172a", // slate-900
          soft: "#f1f5f9",    // slate-100
          accent: "#4f46e5",  // indigo-600
        },
      },
    },
  },
  plugins: [],
};
