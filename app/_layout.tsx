import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import {
  DarkTheme,
  DefaultTheme,
  Theme,
  ThemeProvider,
} from "@react-navigation/native";
import { PortalHost } from "@rn-primitives/portal";
import * as Font from "expo-font";
import { Slot } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { swrConfiguration } from "lib/swr";
import * as React from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { SWRConfig } from "swr";
import { toastConfig } from "~/components/ToastConfig";
import { NotificationProvider } from "~/context/Notification";
import { UserInactivityProvider } from "~/context/UserInactivity";
import "~/global.css";
import { SessionProvider } from "~/hooks/useSession";
import { IS_EXPO_GO, NAV_THEME } from "~/lib/constants";
import { isBiometricSupported } from "~/lib/isBiometricSupported";
import { useAppStore } from "~/lib/state/appStore";
import { useColorScheme } from "~/lib/useColorScheme";
import { registerForPushNotificationsAsync } from "~/services/Notifications";

const LIGHT_THEME: Theme = {
  ...DefaultTheme,
  colors: NAV_THEME.light,
};
const DARK_THEME: Theme = {
  ...DarkTheme,
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

export default function RootLayout() {
  const { isDarkColorScheme, setColorScheme } = useColorScheme();
  const [resourcesLoaded, setResourcesLoaded] = React.useState(false);

  async function loadFonts() {
    await Font.loadAsync({
      OpenRunde: require("./../assets/fonts/OpenRunde-Regular.otf"),
      "OpenRunde-Medium": require("./../assets/fonts/OpenRunde-Medium.otf"),
      "OpenRunde-Semibold": require("./../assets/fonts/OpenRunde-Semibold.otf"),
      "OpenRunde-Bold": require("./../assets/fonts/OpenRunde-Bold.otf"),
    });
  }

  async function checkBiometricStatus() {
    const isSupported = await isBiometricSupported();
    if (!isSupported) {
      useAppStore.getState().setSecurityEnabled(false);
    }
  }

  // TODO: Do not prompt the user at all if FCM is disabled
  async function checkAndPromptForNotifications() {
    const isEnabled = useAppStore.getState().isNotificationsEnabled;
    // prompt the user to enable notifications on first open
    if (isEnabled === null) {
      const enabled = await registerForPushNotificationsAsync();
      useAppStore.getState().setNotificationsEnabled(enabled);
    }
  }

  const loadTheme = React.useCallback((): Promise<void> => {
    return new Promise((resolve) => {
      const theme = useAppStore.getState().theme;
      if (theme) {
        setColorScheme(theme);
      } else {
        useAppStore.getState().setTheme(isDarkColorScheme ? "dark" : "light");
      }
      resolve();
    });
  }, [isDarkColorScheme, setColorScheme]);

  React.useEffect(() => {
    const init = async () => {
      try {
        await Promise.all([loadTheme(), loadFonts(), checkBiometricStatus()]);
      } finally {
        setResourcesLoaded(true);
        if (!IS_EXPO_GO) {
          await checkAndPromptForNotifications();
        }
        SplashScreen.hide();
      }
    };

    init();
  }, [loadTheme]);

  if (!resourcesLoaded) {
    return null;
  }

  return (
    <SWRConfig value={swrConfiguration}>
      <NotificationProvider>
        <ThemeProvider value={isDarkColorScheme ? DARK_THEME : LIGHT_THEME}>
          <StatusBar style={isDarkColorScheme ? "light" : "dark"} />
          <SafeAreaView
            className="w-full h-full bg-background"
            edges={["left", "right", "bottom"]}
          >
            <GestureHandlerRootView>
              <BottomSheetModalProvider>
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
              </BottomSheetModalProvider>
            </GestureHandlerRootView>
          </SafeAreaView>
        </ThemeProvider>
      </NotificationProvider>
    </SWRConfig>
  );
}
