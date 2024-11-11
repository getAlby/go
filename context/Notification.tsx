import { useEffect, useRef } from "react";

import { Nip47Notification } from "@getalby/sdk/dist/NWCClient";
import * as ExpoNotifications from "expo-notifications";
import { useAppStore } from "~/lib/state/appStore";

ExpoNotifications.setNotificationHandler({
  handleNotification: async (notification) => {
    console.info("🔔 handleNotification", {
      data: notification.request.content.data,
    });

    if (!notification.request.content.data.isLocal) {
      console.info("🏠️ Local notification", notification.request.content);

      const encryptedData = notification.request.content.data.content;
      const nwcClient = useAppStore.getState().nwcClient!;

      // TODO: Get the correct keys to decrypt

      try {
        console.info("🔴", encryptedData, nwcClient?.secret);
        const decryptedContent = await nwcClient.decrypt(
          nwcClient?.walletPubkey!,
          encryptedData,
        );
        console.info("🔓️ decrypted data", decryptedContent);
        const nip47Notification = JSON.parse(
          decryptedContent,
        ) as Nip47Notification;
        console.info("decrypted", nip47Notification);

        if (nip47Notification.notification_type === "payment_received") {
          ExpoNotifications.scheduleNotificationAsync({
            content: {
              title: `You just received ${Math.floor(nip47Notification.notification.amount / 1000)} sats`,
              body: nip47Notification.notification.description,
              data: {
                ...notification.request.content.data,
                isLocal: true,
              },
            },
            trigger: null,
          });
        }
      } catch (e) {
        console.error("Failed to parse decrypted event content", e);
        return {
          shouldShowAlert: false,
          shouldPlaySound: false,
          shouldSetBadge: false,
        };
      }
    }

    return {
      shouldShowAlert: !!notification.request.content.data.isLocal,
      shouldPlaySound: false,
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
