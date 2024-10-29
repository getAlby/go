import { Theme, ThemeProvider } from "@react-navigation/native";
import { PortalHost } from "@rn-primitives/portal";
import * as Sentry from "@sentry/react-native";
import * as Font from "expo-font";
import { Slot, SplashScreen } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { swrConfiguration } from "lib/swr";
import * as React from "react";
import { SafeAreaView } from "react-native";
import Toast from "react-native-toast-message";
import PolyfillCrypto from "react-native-webview-crypto";
import { SWRConfig } from "swr";
import { toastConfig } from "~/components/ToastConfig";
import { UserInactivityProvider } from "~/context/UserInactivity";
import "~/global.css";
import { useInfo } from "~/hooks/useInfo";
import { SessionProvider } from "~/hooks/useSession";
import { NAV_THEME } from "~/lib/constants";
import { isBiometricSupported } from "~/lib/isBiometricSupported";
import { useAppStore } from "~/lib/state/appStore";
import { useColorScheme } from "~/lib/useColorScheme";

Sentry.init({
  // dsn: "https://ingest.us.sentry.io/key",
});

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

export const unstable_settings = {
  initialRouteName: "(app)/index",
};

function RootLayout() {
  const { isDarkColorScheme } = useColorScheme();
  const [fontsLoaded, setFontsLoaded] = React.useState(false);

  useConnectionChecker();

  async function loadFonts() {
    await Font.loadAsync({
      OpenRunde: require("./../assets/fonts/OpenRunde-Regular.otf"),
      "OpenRunde-Medium": require("./../assets/fonts/OpenRunde-Medium.otf"),
      "OpenRunde-Semibold": require("./../assets/fonts/OpenRunde-Semibold.otf"),
      "OpenRunde-Bold": require("./../assets/fonts/OpenRunde-Bold.otf"),
    });

    setFontsLoaded(true);
  }

  async function checkBiometricStatus() {
    const isSupported = await isBiometricSupported();
    if (!isSupported) {
      useAppStore.getState().setSecurityEnabled(false);
    }
  }

  React.useEffect(() => {
    const init = async () => {
      try {
        await Promise.all([loadFonts(), checkBiometricStatus()]);
      } finally {
        SplashScreen.hideAsync();
      }
    };

    init();
  }, []);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SWRConfig value={swrConfiguration}>
      <ThemeProvider value={isDarkColorScheme ? DARK_THEME : LIGHT_THEME}>
        <StatusBar style={isDarkColorScheme ? "light" : "dark"} />
        <PolyfillCrypto />
        <SafeAreaView className="w-full h-full bg-background">
          <UserInactivityProvider>
            <SessionProvider>
              <Slot />
            </SessionProvider>
          </UserInactivityProvider>
          <Toast
            config={toastConfig}
            position="bottom"
            bottomOffset={140}
            topOffset={140}
          />
          <PortalHost />
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

export default Sentry.wrap(RootLayout);
