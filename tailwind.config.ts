import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          950: "#050505",
          900: "#0a0a0a",
          850: "#0f0f0f",
          800: "#141414",
          700: "#1c1c1c",
          600: "#242424",
          500: "#2e2e2e",
          400: "#3a3a3a",
          300: "#525252",
          200: "#737373",
          100: "#a3a3a3",
        },
        accent: {
          DEFAULT: "#f97316",
          light: "#fb923c",
          dark: "#ea580c",
        },
      },
    },
  },
  plugins: [],
};
export default config;
