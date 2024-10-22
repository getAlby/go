import { router } from "expo-router";
import { useEffect } from "react";

import * as ExpoNotifications from "expo-notifications";

export function useNotificationObserver() {
  useEffect(() => {
    let isMounted = true;

    function redirect(notification: ExpoNotifications.Notification) {
      const url = notification.request.content.data?.url;
      if (url) {
        console.log("🔔 Received push notification, redirecting to: " + url);
        router.push(url);
      }
    }

    ExpoNotifications.getLastNotificationResponseAsync().then((response) => {
      if (!isMounted || !response?.notification) {
        return;
      }
      redirect(response?.notification);
    });

    const subscription =
      ExpoNotifications.addNotificationResponseReceivedListener((response) => {
        redirect(response.notification);
      });

    return () => {
      isMounted = false;
      subscription.remove();
    };
  }, []);
}
