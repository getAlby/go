import * as React from "react";
import { AppState, type AppStateStatus } from "react-native";
import { INACTIVITY_THRESHOLD } from "~/lib/constants";
import { useAppStore } from "~/lib/state/appStore";

let lastActiveTime = 0;

export const UserInactivityProvider = ({ children }: any) => {
  const [appState, setAppState] = React.useState<AppStateStatus>(
    AppState.currentState,
  );
  const isSecurityEnabled = useAppStore((store) => store.isSecurityEnabled);

  const handleAppStateChange = React.useCallback(
    async (nextState: AppStateStatus): Promise<void> => {
      const now = Date.now();
      useAppStore.getState().setLastAppStateChangeTime(now);
      if (isSecurityEnabled) {
        if (appState === "active" && nextState.match(/inactive|background/)) {
          lastActiveTime = now;
        } else if (
          appState.match(/inactive|background/) &&
          nextState === "active"
        ) {
          if (lastActiveTime) {
            const timeElapsed = Date.now() - lastActiveTime;
            if (timeElapsed >= INACTIVITY_THRESHOLD) {
              useAppStore.getState().setUnlocked(false);
            }
          }
        }
      }
      setAppState(nextState);
    },
    [appState, isSecurityEnabled],
  );

  React.useEffect(() => {
    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange,
    );

    return () => {
      subscription.remove();
    };
  }, [appState, handleAppStateChange, isSecurityEnabled]);

  return children;
};
