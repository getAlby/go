import { nwc } from "@getalby/sdk";
import Constants from "expo-constants";
import * as Device from "expo-device";
import * as ExpoNotifications from "expo-notifications";
import { Platform } from "react-native";
import { NOSTR_API_URL, SUITE_NAME } from "~/lib/constants";
import { errorToast } from "~/lib/errorToast";
import { computeSharedSecret } from "~/lib/sharedSecret";
import { useAppStore } from "~/lib/state/appStore";

let UserDefaults: any;
let SharedPreferences: any;

if (Platform.OS === "ios") {
  UserDefaults =
    require("@alevy97/react-native-userdefaults/src/ReactNativeUserDefaults.ios").default;
} else {
  SharedPreferences = require("@getalby/expo-shared-preferences");
}

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
      let groupDefaults;
      if (Platform.OS === "ios") {
        groupDefaults = new UserDefaults(SUITE_NAME);
      }

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
          isIOS: Platform.OS === "ios",
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

          // TODO: also update these defaults when wallet name is updated
          // TODO: remove these group defaults when wallet is removed
          // or when notifications are removed maybe?
          if (groupDefaults) {
            let wallets = (await groupDefaults.get("wallets")) || {};
            wallets[nwcClient.publicKey] = {
              name: wallet.name,
              sharedSecret: computeSharedSecret(
                nwcClient.walletPubkey,
                nwcClient.secret ?? "",
              ),
            };
            groupDefaults.set("wallets", wallets);
          } else {
            // TODO: json stringify and add similar to iOS
            const sharedSecretKey = `${nwcClient.publicKey}_shared_secret`;
            const nameKey = `${nwcClient.publicKey}_name`;
            SharedPreferences.setItemAsync(nameKey, wallet.name ?? "");
            SharedPreferences.setItemAsync(
              sharedSecretKey,
              computeSharedSecret(
                nwcClient.walletPubkey,
                nwcClient.secret ?? "",
              ),
            );
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
