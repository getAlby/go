import { IS_EXPO_GO } from "~/lib/constants";
import { errorToast } from "~/lib/errorToast";

export async function registerForPushNotificationsAsync(): Promise<
  boolean | null
> {
  if (IS_EXPO_GO) {
    errorToast(new Error("Push notifications are disabled in Expo Go"));
    return null;
  }

  try {
    const nativePushNotifications = require("~/native/notifications/service");
    return await nativePushNotifications.registerForPushNotificationsAsync();
  } catch (error) {
    console.error("Error importing push notifications logic:", error);
    return null;
  }
}
