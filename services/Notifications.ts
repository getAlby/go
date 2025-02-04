export async function registerForPushNotificationsAsync(): Promise<
  boolean | null
> {
  try {
    const nativePushNotifications = require("~/native/notifications/service");
    return await nativePushNotifications.registerForPushNotificationsAsync();
  } catch (error) {
    console.error("Error importing push notifications logic:", error);
    return null;
  }
}
