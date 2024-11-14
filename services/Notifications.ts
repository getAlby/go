import Constants from "expo-constants";
import * as Device from "expo-device";
import * as ExpoNotifications from "expo-notifications";
import { Platform } from "react-native";
import { errorToast } from "~/lib/errorToast";
import { registerWalletNotifications } from "~/lib/notifications";
import { useAppStore } from "~/lib/state/appStore";

export async function registerForPushNotificationsAsync(): Promise<boolean> {
  if (Platform.OS === "android") {
    ExpoNotifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: ExpoNotifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
      enableLights: true,
      enableVibrate: true,
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
      return false;
    }
    const projectId =
      Constants?.expoConfig?.extra?.eas?.projectId ??
      Constants?.easConfig?.projectId;
    if (!projectId) {
      errorToast(new Error("Project ID not found"));
    }
    try {
      const pushToken = (
        await ExpoNotifications.getExpoPushTokenAsync({
          projectId,
        })
      ).data;

      useAppStore.getState().setExpoPushToken(pushToken);

      const wallets = useAppStore.getState().wallets;

      for (let i = 0; i < wallets.length; i++) {
        const wallet = wallets[i];
        await registerWalletNotifications(
          wallet.nostrWalletConnectUrl ?? "",
          i,
          wallet.name,
        );
      }

      return true;
    } catch (error) {
      errorToast(error);
    }
  } else {
    errorToast("Must use physical device for push notifications");
  }

  return false;
}
