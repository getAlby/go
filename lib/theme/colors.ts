import { type ColorSchemeName } from "react-native";
import { useColorScheme } from "~/lib/useColorScheme";

// Shared palette for cases where we cannot rely on Tailwind classes
// (e.g. react-navigation headers, SVG fills). Values mirror global.css.
const themeColors = {
  light: {
    background: "#F9FAFB",
    foreground: "#374151",
    secondaryForeground: "#6B7280",
    mutedForeground: "#9BA2AE",
    muted: "#E4E6EA",
    destructive: "#EF4444",
    destructiveForeground: "#FEE2E2",
    success: "#22C45E",
    successForeground: "#DBFBE6",
    primary: "#FFC800",
    primaryForeground: "#374151",
    secondary: "#FFE480",
  },
  dark: {
    background: "#0a0b0c",
    foreground: "#FAFBFB",
    secondaryForeground: "#BFBFC2",
    mutedForeground: "#7E7E88",
    muted: "#1f2937",
    destructive: "#B41818",
    destructiveForeground: "#1C0202",
    success: "#44D579",
    successForeground: "#062310",
    primary: "#FFC800",
    primaryForeground: "#374151",
    secondary: "#FFE480",
  },
} as const;

type ThemeMode = keyof typeof themeColors;
export type ThemeColor = keyof (typeof themeColors)["light"];

const resolveColorScheme = (colorScheme?: ColorSchemeName): ThemeMode =>
  colorScheme === "dark" ? "dark" : "light";

export const getThemeColor = (
  color: ThemeColor,
  colorScheme?: ColorSchemeName,
) => themeColors[resolveColorScheme(colorScheme)][color];

export function useThemeColor(color: ThemeColor) {
  const { colorScheme } = useColorScheme();

  return getThemeColor(color, colorScheme);
}

export { themeColors };
