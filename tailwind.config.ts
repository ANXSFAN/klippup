import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#ffffff",
        surface: "#F7F7F5",
        surface2: "#EFEFEC",
        line: "#ECECE9",
        muted: "rgba(24,24,27,0.5)",
        subtle: "rgba(24,24,27,0.7)",
        ink: "#18181B",
        brand: "#FF7A1A",
        brandHover: "#E96808",
        brandSoft: "#FFE7D6"
      },
      fontFamily: {
        sans: [
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "sans-serif"
        ]
      },
      borderRadius: {
        card: "14px"
      },
      boxShadow: {
        card: "0 8px 24px rgba(24,24,27,0.06)",
        glassInset:
          "inset 0 1px 0 0 rgba(255,255,255,0.6), 0 0 0 1px #ECECE9"
      }
    }
  },
  plugins: []
};

export default config;
