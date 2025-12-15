import { THEME_COLORS } from "~/lib/constants";
import { useColorScheme } from "~/lib/useColorScheme";

export type ThemeColor = keyof (typeof THEME_COLORS)["light"];

export function useThemeColor<C extends ThemeColor>(...colors: C[]) {
  const { colorScheme } = useColorScheme();
  const theme = THEME_COLORS[colorScheme];

  return colors.reduce(
    (acc, color) => {
      acc[color] = theme[color];
      return acc;
    },
    {} as Record<C, string>,
  );
}
