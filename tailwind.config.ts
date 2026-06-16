import type { Config } from "tailwindcss";
import forms from "@tailwindcss/forms";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#1B2E4B",
        paper: "#FFF8EC",
        linen: "#FFFDF7",
        sage: "#6B7280",
        salvia: "#E7DED0",
        sea: "#1B2E4B",
        olive: "#374151",
        earth: "#111827",
        coral: "#C4933F",
        gold: "#C4933F",
        turquesa: "#059669",
        verified: "#059669",
        star: "#F5A623",
        borderline: "#E7DED0"
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Inter", "system-ui", "sans-serif"],
        serif: ["var(--font-sans)", "Inter", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "Playfair Display", "Georgia", "serif"]
      },
      boxShadow: {
        soft: "0 18px 60px rgba(23, 33, 28, 0.10)"
      }
    }
  },
  plugins: [forms]
};

export default config;
