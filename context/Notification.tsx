import * as ExpoNotifications from "expo-notifications";
import { useEffect, useRef } from "react";
import { handleLink } from "~/lib/link";
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
  const responseListener = useRef<ExpoNotifications.Subscription>();
  const isNotificationsEnabled = useAppStore(
    (store) => store.isNotificationsEnabled,
  );

  useEffect(() => {
    if (!isNotificationsEnabled) {
      return;
    }

    // this is for iOS only as tapping the notifications
    // directly open the deep link on android
    responseListener.current =
      ExpoNotifications.addNotificationResponseReceivedListener((response) => {
        const deepLink = response.notification.request.content.data.deepLink;
        if (deepLink) {
          handleLink(deepLink);
        }
      });

    return () => {
      responseListener.current &&
        ExpoNotifications.removeNotificationSubscription(
          responseListener.current,
        );
    };
  }, [isNotificationsEnabled]);

  return children;
};
