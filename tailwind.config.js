/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx}", "./components/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: { 50:"#F3EEFF",100:"#E8E1FA",200:"#D9CEF6",300:"#C0AEEF",400:"#A488EB",500:"#8B6FE8",600:"#7A5FE0",700:"#674BD0",800:"#4F38A6",900:"#3A2A7C" },
        ink: "#252236", body: "#4A4560", muted: "#7B748C", line: "#E8E1FA", surface: "#F3EEFF",
        risk: "#FF8A65", safe: "#41C7A7", warn2: "#FFB84D", card: "#FFFFFF",
      },
      backgroundImage: {
        "brand-grad": "linear-gradient(135deg,#8B6FE8 0%,#7A5FE0 100%)",
        "brand-soft": "linear-gradient(135deg,#F3EEFF 0%,#E8E1FA 100%)",
        "brand-glow": "radial-gradient(120% 120% at 25% 15%,#B79DF2 0%,#8B6FE8 55%,#674BD0 100%)",
      },
      fontFamily: { sans: ['"Pretendard"','"Malgun Gothic"','"Apple SD Gothic Neo"','system-ui','sans-serif'] },
      boxShadow: { soft: "0 10px 30px rgba(123,90,224,0.10)", card: "0 4px 18px rgba(80,56,166,0.07)" },
    },
  },
  plugins: [],
};
