/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        // 스드맵 브랜드 바이올렛 스케일
        brand: {
          50: "#F4F1FE",
          100: "#EAE4FC",
          200: "#D6CBF8",
          300: "#BCABF1",
          400: "#9F8AE9",
          500: "#8B7BE8",
          600: "#7361DA",
          700: "#5E4CC0",
          800: "#4A3C97",
          900: "#382D72",
        },
        ink: "#2A2640",
        body: "#5A5570",
        muted: "#918CA6",
        line: "#ECE9F5",
        surface: "#FAF9FE",
        ok: "#34C7A0",
        warn: "#F5B544",
        rose: "#B5688A",
      },
      backgroundImage: {
        "brand-grad": "linear-gradient(135deg,#B7A6F0 0%,#8B7BE8 50%,#6E5AD6 100%)",
        "brand-soft": "linear-gradient(135deg,#F4F1FE 0%,#EAE4FC 100%)",
        "brand-glow": "radial-gradient(120% 120% at 25% 15%,#C9BEF7 0%,#8B7BE8 55%,#5E4CC0 100%)",
      },
      fontFamily: {
        sans: ['"Malgun Gothic"', '"Apple SD Gothic Neo"', "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 14px 34px rgba(94,76,192,0.18)",
      },
    },
  },
  plugins: [],
};
