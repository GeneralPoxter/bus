import { type Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        base: "#1C1427",
        "base-light": "#40394A",
        accent: "#7ECA9C",
        "accent-light": "#CCFFBD",
      },
    },
  },
  plugins: [],
} satisfies Config;
