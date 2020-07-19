module.exports = {
  purge: ["./src/**/*.html", "./src/**/*.tsx"],
  theme: {
    extend: {
      gridTemplateColumns: {
        "16": "repeat(16, minmax(0, 1fr))",
      },
      gridTemplateRows: {
        "8": "repeat(8, minmax(0, 1fr))",
      },
    },
    screens: {
      xs: "480px",
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
      xxl: "1920px",
    },
  },
  variants: {},
  plugins: [],
}
