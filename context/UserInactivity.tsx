import * as React from "react";
import {
  AppState,
  AppStateStatus,
  NativeEventSubscription,
} from "react-native";
import { INACTIVITY_THRESHOLD } from "~/lib/constants";
import { secureStorage } from "~/lib/secureStorage";
import { lastActiveTimeKey, useAppStore } from "~/lib/state/appStore";

export const UserInactivityProvider = ({ children }: any) => {
  const [appState, setAppState] = React.useState<AppStateStatus>(
    AppState.currentState,
  );
  const isSecurityEnabled = useAppStore((store) => store.isSecurityEnabled);

  const handleAppStateChange = React.useCallback(
    async (nextState: AppStateStatus): Promise<void> => {
      if (appState === "active" && nextState.match(/inactive|background/)) {
        const now = Date.now();
        secureStorage.setItem(lastActiveTimeKey, now.toString());
      } else if (
        appState.match(/inactive|background/) &&
        nextState === "active"
      ) {
        const lastActiveTime = secureStorage.getItem(lastActiveTimeKey);
        if (lastActiveTime) {
          const timeElapsed = Date.now() - parseInt(lastActiveTime, 10);
          if (timeElapsed >= INACTIVITY_THRESHOLD) {
            useAppStore.getState().setUnlocked(false);
          }
        }
        await secureStorage.removeItem(lastActiveTimeKey);
      }
      setAppState(nextState);
    },
    [appState],
  );

  React.useEffect(() => {
    let subscription: NativeEventSubscription;
    if (isSecurityEnabled) {
      subscription = AppState.addEventListener("change", handleAppStateChange);
    }

    return () => {
      if (subscription) {
        subscription.remove();
      }
    };
  }, [appState, handleAppStateChange, isSecurityEnabled]);

  return children;
};
