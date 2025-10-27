import * as ExpoNotifications from "expo-notifications";
import { useEffect } from "react";
import { IS_EXPO_GO } from "~/lib/constants";
import { handleLink } from "~/lib/link";
import { useAppStore } from "~/lib/state/appStore";

ExpoNotifications.setNotificationHandler({
  handleNotification: async () => {
    return {
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    };
  },
});

export const NotificationProvider = ({ children }: any) => {
  const isNotificationsEnabled = useAppStore(
    (store) => store.isNotificationsEnabled,
  );

  useEffect(() => {
    if (IS_EXPO_GO || !isNotificationsEnabled) {
      return;
    }

    const handleNotification = (
      notification: ExpoNotifications.Notification,
    ) => {
      const deepLink = notification.request.content.data.deepLink as string;
      if (deepLink) {
        handleLink(deepLink);
      }
    };

    // this is for iOS only as tapping the notifications
    // directly open the deep link on android
    const response = ExpoNotifications.getLastNotificationResponse();
    if (response?.notification) {
      handleNotification(response.notification);
    }

    const subscription =
      ExpoNotifications.addNotificationResponseReceivedListener((response) => {
        handleNotification(response.notification);
      });

    return () => {
      subscription.remove();
    };
  }, [isNotificationsEnabled]);

  return children;
};
