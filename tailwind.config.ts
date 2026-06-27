import type { Config } from "tailwindcss";
import forms from "@tailwindcss/forms";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0A0A0A",
        paper: "#FFFFFF",
        linen: "#FFFFFF",
        sage: "#6B7280",
        salvia: "#E5E7EB",
        sea: "#0A0A0A",
        olive: "#6B7280",
        earth: "#0A0A0A",
        coral: "#0A0A0A",
        gold: "#00C37A",
        turquesa: "#0A0A0A",
        verified: "#0A0A0A",
        star: "#FFCC00",
        borderline: "#E5E7EB",
        surface: "#F9FAFB"
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Inter", "system-ui", "sans-serif"],
        serif: ["var(--font-sans)", "Inter", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "Playfair Display", "Georgia", "serif"]
      },
      boxShadow: {
        soft: "0 18px 60px rgba(10, 10, 10, 0.10)"
      }
    }
  },
  plugins: [forms]
};

export default config;
