const { hairlineWidth } = require("nativewind/theme");

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./pages/**/*.{js,jsx,ts,tsx}",
  ],
  safelist: ["text-sent", "bg-sent-foreground", "text-warning"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        overlay: "var(--overlay)",
        border: "var(--border)",
        logo: {
          primary: "var(--logo-primary)",
          secondary: "var(--logo-secondary)",
        },
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        receive: {
          DEFAULT: "var(--receive)",
          foreground: "var(--receive-foreground)",
        },
        sent: {
          DEFAULT: "var(--sent)",
          foreground: "var(--sent-foreground)",
        },
        destructive: {
          DEFAULT: "var(--destructive)",
          foreground: "var(--destructive-foreground)",
        },
        pending: {
          DEFAULT: "var(--pending)",
          foreground: "var(--pending-foreground)",
        },
        warning: {
          DEFAULT: "var(--warning)",
          foreground: "var(--warning-foreground)",
          border: "var(--warning-border)",
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
