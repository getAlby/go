const { hairlineWidth } = require("nativewind/theme");

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./pages/**/*.{js,jsx,ts,tsx}",
  ],
  safelist: ["text-error", "text-warning", "text-info"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring))",
        background: "var(--background)",
        foreground: "var(--foreground)",
        overlay: "var(--overlay)",
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        destructive: {
          DEFAULT: "var(--destructive)",
          foreground: "var(--destructive-foreground)",
        },
        receive: {
          DEFAULT: "var(--receive)",
          foreground: "var(--receive-foreground)",
        },
        sent: {
          DEFAULT: "var(--sent)",
          foreground: "var(--sent-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        warning: {
          DEFAULT: "var(--warning)",
          foreground: "var(--warning-foreground)",
          border: "var(--warning-border)",
        },
        info: {
          DEFAULT: "var(--info)",
          foreground: "var(--info-foreground)",
          border: "var(--info-border)",
        },
        error: {
          DEFAULT: "var(--error)",
          foreground: "var(--error-foreground)",
          border: "var(--error-border)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
      },
      borderWidth: {
        hairline: hairlineWidth(),
      },
      fontFamily: {
        sans: ["OpenRunde"],
        /* For some (unknown) reason the font styles aren't applied
         * if you use the tailwind native names
         */
        sans2: ["OpenRunde"],
        medium2: ["OpenRunde-Medium"],
        semibold2: ["OpenRunde-Semibold"],
        bold2: ["OpenRunde-Bold"],
      },
      screens: {
        sm: "376px",
      },
    },
  },
  plugins: [],
};
