import "../lib/applyGlobalPolyfills";

import "~/global.css";
import { Theme, ThemeProvider } from "@react-navigation/native";
import { router, SplashScreen, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as React from "react";
import { SafeAreaView } from "react-native";
import { NAV_THEME } from "~/lib/constants";
import { useColorScheme } from "~/lib/useColorScheme";
import PolyfillCrypto from "react-native-webview-crypto";
import { SWRConfig } from "swr";
import { swrConfiguration } from "lib/swr";
import Toast from "react-native-toast-message";
import { toastConfig } from "~/components/ToastConfig";
import * as Font from "expo-font";
import { useInfo } from "~/hooks/useInfo";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { secureStorage } from "~/lib/secureStorage";

const LIGHT_THEME: Theme = {
  dark: false,
  colors: NAV_THEME.light,
};
const DARK_THEME: Theme = {
  dark: true,
  colors: NAV_THEME.dark,
};

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from "expo-router";

// Prevent the splash screen from auto-hiding before getting the color scheme.
SplashScreen.preventAutoHideAsync();

// export const unstable_settings = {
//   initialRouteName: "index",
// };

export default function RootLayout() {
  const { isDarkColorScheme } = useColorScheme();
  const [fontsLoaded, setFontsLoaded] = React.useState(false);
  const [showOnboarding, setShowOnboarding] = React.useState(false);
  useConnectionChecker();

  React.useEffect(() => {

    const checkOnboardingStatus = async () => {
      const hasOnboarded = await secureStorage.getItem("hasOnboarded");
      if (!hasOnboarded) {
        router.push({
          pathname: "/onboarding",
        });
      }
    };

    checkOnboardingStatus();

    (async () => {
      await Font.loadAsync({
        OpenRunde: require("./../assets/fonts/OpenRunde-Regular.otf"),
        "OpenRunde-Medium": require("./../assets/fonts/OpenRunde-Medium.otf"),
        "OpenRunde-Semibold": require("./../assets/fonts/OpenRunde-Semibold.otf"),
        "OpenRunde-Bold": require("./../assets/fonts/OpenRunde-Bold.otf"),
      });

      setFontsLoaded(true);
    })().finally(() => {
      SplashScreen.hideAsync();
    });
  }, []);

  if (!fontsLoaded) {
    return null;
  }

  async function reset() {
    await AsyncStorage.removeItem("hasOnboarded");
    router.navigate("/")
  }

  return (
    <SWRConfig value={swrConfiguration}>
      <ThemeProvider value={isDarkColorScheme ? DARK_THEME : LIGHT_THEME}>
        <StatusBar style={isDarkColorScheme ? "light" : "dark"} />
        <PolyfillCrypto />
        <SafeAreaView className="w-full h-full bg-background">
          <Stack />
          <Toast config={toastConfig} position="bottom" bottomOffset={140} />
        </SafeAreaView>
      </ThemeProvider>
    </SWRConfig>
  );
}

function useConnectionChecker() {
  const { error } = useInfo();
  React.useEffect(() => {
    if (error?.message) {
      Toast.show({
        type: "connectionError",
        text1: error.message,
      });
    }
  }, [error?.message]);
}
