import Constants from "expo-constants";
import * as Device from "expo-device";
import * as ExpoNotifications from "expo-notifications";
import { Platform } from "react-native";
import { errorToast } from "~/lib/errorToast";
import i18n from "~/lib/i18n";
import { registerWalletNotifications } from "~/lib/notifications";
import { useAppStore } from "~/lib/state/appStore";

async function getPushTokenWithTimeout({
  projectId,
  timeoutMs = 3000,
}: {
  projectId: string;
  timeoutMs?: number;
}): Promise<string> {
  let timeoutId: ReturnType<typeof setTimeout>;

  const tokenPromise = ExpoNotifications.getExpoPushTokenAsync({
    projectId,
  }).then((result) => {
    clearTimeout(timeoutId);
    return result.data;
  });

  const timeoutPromise = new Promise<string>((_resolve, reject) => {
    timeoutId = setTimeout(
      () => reject(new Error(i18n.t("errors.notifications.fcmUnavailable"))),
      timeoutMs,
    );
  });

  return await Promise.race([tokenPromise, timeoutPromise]);
}

export async function registerForPushNotificationsAsync(): Promise<
  boolean | null
> {
  if (!Device.isDevice) {
    errorToast(
      new Error(i18n.t("errors.notifications.physicalDeviceRequired")),
    );
    return false;
  }

  if (Platform.OS === "android") {
    ExpoNotifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: ExpoNotifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      enableVibrate: true,
    });
  }

  const { status: existingStatus } =
    await ExpoNotifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== "granted") {
    const { status } = await ExpoNotifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus === "undetermined") {
    return null;
  }
  if (finalStatus === "denied") {
    if (existingStatus === "denied") {
      errorToast(new Error(i18n.t("errors.notifications.enableInSettings")));
    }
    return false;
  }
  const projectId =
    Constants?.expoConfig?.extra?.eas?.projectId ??
    Constants?.easConfig?.projectId;
  if (!projectId) {
    errorToast(new Error(i18n.t("errors.notifications.projectIdNotFound")));
  }
  try {
    const pushToken = await getPushTokenWithTimeout({
      projectId,
    });

    useAppStore.getState().setExpoPushToken(pushToken);

    const wallets = useAppStore.getState().wallets;

    for (let i = 0; i < wallets.length; i++) {
      const wallet = wallets[i];
      await registerWalletNotifications(wallet, i);
    }

    return (
      wallets.length === 0 ||
      useAppStore.getState().wallets.some((wallet) => wallet.pushId)
    );
  } catch (error) {
    errorToast(error);
  }

  return false;
}
