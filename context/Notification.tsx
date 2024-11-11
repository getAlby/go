import { useEffect, useRef } from "react";

import * as ExpoNotifications from "expo-notifications";
import { useAppStore } from "~/lib/state/appStore";

ExpoNotifications.setNotificationHandler({
  handleNotification: async () => {
    return {
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    };
  },
});

export const NotificationProvider = ({ children }: any) => {
  const notificationListener = useRef<ExpoNotifications.Subscription>();
  const responseListener = useRef<ExpoNotifications.Subscription>();
  const isNotificationsEnabled = useAppStore(
    (store) => store.isNotificationsEnabled,
  );

  useEffect(() => {
    if (!isNotificationsEnabled) {
      return;
    }

    notificationListener.current =
      ExpoNotifications.addNotificationReceivedListener((notification) => {
        // triggers when app is foregrounded
        console.info("received from server just now");
      });

    responseListener.current =
      ExpoNotifications.addNotificationResponseReceivedListener((response) => {
        // triggers when notification is clicked (only when foreground or background)
        // see https://docs.expo.dev/versions/latest/sdk/notifications/#notification-events-listeners
        // TODO: to also redirect when the app is killed, use useLastNotificationResponse
        // TODO: redirect the user to transaction page after switching to the right wallet
      });

    return () => {
      notificationListener.current &&
        ExpoNotifications.removeNotificationSubscription(
          notificationListener.current,
        );
      responseListener.current &&
        ExpoNotifications.removeNotificationSubscription(
          responseListener.current,
        );
    };
  }, [isNotificationsEnabled]);

  return children;
};
