import Constants from "expo-constants";
import * as Device from "expo-device";
import * as ExpoNotifications from "expo-notifications";
import { Platform } from "react-native";
import { errorToast } from "~/lib/errorToast";
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
      () => reject(new Error("FCM not available or not responding")),
      timeoutMs,
    );
  });

  return await Promise.race([tokenPromise, timeoutPromise]);
}

export async function registerForPushNotificationsAsync(): Promise<
  boolean | null
> {
  if (!Device.isDevice) {
    errorToast("Must use physical device for push notifications");
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
      errorToast(new Error("Enable app notifications in device settings"));
    }
    return false;
  }
  const projectId =
    Constants?.expoConfig?.extra?.eas?.projectId ??
    Constants?.easConfig?.projectId;
  if (!projectId) {
    errorToast(new Error("Project ID not found"));
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

    return useAppStore.getState().wallets.some((wallet) => wallet.pushId);
  } catch (error) {
    errorToast(error);
  }

  return false;
}
