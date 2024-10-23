import * as ExpoNotifications from "expo-notifications";
import React from "react";
import { router } from "expo-router";

export function useNotificationObserver() {
  const lastNotificationResponse =
    ExpoNotifications.useLastNotificationResponse();
  console.log("lastnot", lastNotificationResponse);
  React.useEffect(() => {
    console.log("lastnotificationresponse", lastNotificationResponse);
    if (
      lastNotificationResponse &&
      lastNotificationResponse.notification.request.content.data.url &&
      lastNotificationResponse.actionIdentifier ===
        ExpoNotifications.DEFAULT_ACTION_IDENTIFIER
    ) {
      console.log(
        "redirecting",
        lastNotificationResponse.notification.request.content.data.url,
      );
      router.dismissAll();
      router.push(
        lastNotificationResponse.notification.request.content.data.url,
      );
      //   Linking.openURL(
      //     lastNotificationResponse.notification.request.content.data.url,
      //   );
    }
  }, [lastNotificationResponse]);
}
