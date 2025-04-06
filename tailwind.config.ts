import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"], // Primary font
        heading: ["var(--font-nunito)", "sans-serif"], // Secondary/Playful font
      },
      colors: {
        background: "#F5F5F5", // Light mode background
        foreground: "#1A1A1A", // Light mode text
        // Add dark mode colors later if needed
        primary: {
          DEFAULT: "#4A90E2",
          foreground: "#FFFFFF", // Text on primary color
        },
        accent: {
          DEFAULT: "#FF9500",
          foreground: "#FFFFFF", // Text on accent color
        },
        success: "#4CAF50",
        warning: "#FFC107",
        error: "#F44336",
        neutral: "#757575",
      },
      // Define breakpoints if different from Tailwind defaults
      // screens: {
      //   'sm': '640px',
      //   'md': '768px',
      //   'lg': '1024px',
      //   'xl': '1280px',
      // },
    },
  },
  plugins: [],
};
export default config; 