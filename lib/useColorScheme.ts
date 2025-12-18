import { useColorScheme as useNativewindColorScheme } from "nativewind";
import { useAppStore } from "~/lib/state/appStore";

export function useColorScheme() {
  const {
    colorScheme,
    setColorScheme,
    toggleColorScheme: _toggleColorScheme,
  } = useNativewindColorScheme();

  const isDarkColorScheme = colorScheme === "dark";

  const toggleColorScheme = () => {
    _toggleColorScheme();
    useAppStore.getState().setTheme(isDarkColorScheme ? "light" : "dark");
  };

  return {
    colorScheme: colorScheme ?? "dark",
    isDarkColorScheme,
    setColorScheme,
    toggleColorScheme,
  };
}
