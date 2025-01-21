import { useEffect, useRef } from "react";
import { IS_EXPO_GO } from "~/lib/constants";
import { handleLink } from "~/lib/link";
import { useAppStore } from "~/lib/state/appStore";

let ExpoNotifications: any;

if (!IS_EXPO_GO) {
  ExpoNotifications = require("expo-notifications");

  ExpoNotifications.setNotificationHandler({
    handleNotification: async () => {
      return {
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      };
    },
  });
}

export const NotificationProvider = ({ children }: any) => {
  const responseListener = useRef<any>();
  const isNotificationsEnabled = useAppStore(
    (store) => store.isNotificationsEnabled,
  );

  useEffect(() => {
    if (IS_EXPO_GO || !isNotificationsEnabled) {
      return;
    }

    // this is for iOS only as tapping the notifications
    // directly open the deep link on android
    responseListener.current =
      ExpoNotifications.addNotificationResponseReceivedListener(
        (response: any) => {
          const deepLink = response.notification.request.content.data.deepLink;
          if (deepLink) {
            handleLink(deepLink);
          }
        },
      );

    return () => {
      responseListener.current &&
        ExpoNotifications.removeNotificationSubscription(
          responseListener.current,
        );
    };
  }, [isNotificationsEnabled]);

  return children;
};
