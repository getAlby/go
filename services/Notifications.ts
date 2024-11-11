import Constants from "expo-constants";
import { Platform } from "react-native";

import { nwc } from "@getalby/sdk";
import * as Device from "expo-device";
import * as ExpoNotifications from "expo-notifications";
import { NOSTR_API_URL } from "~/lib/constants";
import { errorToast } from "~/lib/errorToast";
import { useAppStore } from "~/lib/state/appStore";

// TODO: add background notification handling for android

export async function registerForPushNotificationsAsync() {
  if (Platform.OS === "android") {
    ExpoNotifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: ExpoNotifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } =
      await ExpoNotifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== "granted") {
      const { status } = await ExpoNotifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== "granted") {
      errorToast(
        new Error(
          "Permission not granted to get push token for push notification",
        ),
      );
      return;
    }
    const projectId =
      Constants?.expoConfig?.extra?.eas?.projectId ??
      Constants?.easConfig?.projectId;
    if (!projectId) {
      errorToast(new Error("Project ID not found"));
    }
    try {
      const pushTokenString = (
        await ExpoNotifications.getExpoPushTokenAsync({
          projectId,
        })
      ).data;

      // FIXME: This would trigger the same notification
      // per wallet if they belong to the same node
      const wallets = useAppStore.getState().wallets;

      for (const wallet of wallets) {
        const nwcUrl = wallet.nostrWalletConnectUrl;
        if (!nwcUrl) {
          continue;
        }
        const nwcClient = new nwc.NWCClient({
          nostrWalletConnectUrl: wallet.nostrWalletConnectUrl,
        });

        const body = {
          pushToken: pushTokenString,
          relayUrl: nwcClient.relayUrl,
          connectionPubkey: nwcClient.publicKey,
          walletPubkey: nwcClient.walletPubkey,
        };

        try {
          const response = await fetch(
            `${NOSTR_API_URL}/nip47/notifications/go`,
            {
              method: "POST",
              headers: {
                Accept: "application/json",
                "Accept-encoding": "gzip, deflate",
                "Content-Type": "application/json",
              },
              body: JSON.stringify(body),
            },
          );

          if (response.ok) {
            const responseData = await response.json();
            useAppStore.getState().updateWallet(
              {
                pushId: responseData.subscriptionId,
              },
              wallet.nostrWalletConnectUrl,
            );
            // TODO: Send a DELETE call to nostr api on deleting the wallet
          } else {
            throw new Error(`Error: ${response.status} ${response.statusText}`);
          }
        } catch (error) {
          errorToast(error);
        }
      }

      return;
    } catch (error) {
      errorToast(error);
    }
  } else {
    errorToast("Must use physical device for push notifications");
  }
}
