import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#151515",
        surface: "#000000",
        surface2: "#0a0a0a",
        line: "rgba(255,255,255,0.06)",
        muted: "rgba(255,255,255,0.5)",
        subtle: "rgba(255,255,255,0.65)"
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
        card: "0 8px 32px rgba(0,0,0,0.55)",
        glassInset:
          "inset 0 1px 0 0 rgba(255,255,255,0.06), 0 0 0 1px rgba(255,255,255,0.05)"
      }
    }
  },
  plugins: []
};

export default config;
