/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#276EF1",
        secondary: "#22C55E",
        accent: "#F59E0B",
        background: "#FFFFFF",
        backgroundSubtle: "#F4F5F7",
        text: "#1A1A1A",
        textMuted: "#4A4A4A",
      },
      fontFamily: {
        heading: ["Poppins", "system-ui", "sans-serif"],
        body: ["Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 18px 45px rgba(15, 23, 42, 0.08)",
      },
      borderRadius: {
        xl: "1.1rem",
      },
    },
  },
  plugins: [],
};
