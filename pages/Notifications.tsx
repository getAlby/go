import Constants from "expo-constants";
import React, { useEffect, useRef, useState } from "react";
import { Platform, View } from "react-native";
import Screen from "~/components/Screen";
import { Button } from "~/components/ui/button";
import { Text } from "~/components/ui/text";

import * as Device from "expo-device";
import * as ExpoNotifications from "expo-notifications";

ExpoNotifications.setNotificationHandler({
  handleNotification: async (notification) => {
    console.log("🔔 handleNotification", { data: notification.request.content.data })

    if (!notification.request.content.data.isLocal) {
      console.log("🏠️ Local notification", notification.request.content);

      ExpoNotifications.scheduleNotificationAsync({
        content: {
          title: 'Decrypted content',
          body: "test",
          data: {
            ...notification.request.content.data,
            isLocal: true,
          }
        },
        trigger: null
      });
    }

    return {
      shouldShowAlert: !!notification.request.content.data.isLocal,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }
  }
});

async function sendPushNotification(expoPushToken: string) {
  const message = {
    to: expoPushToken,
    sound: "default",
    title: "Original Title",
    body: "And here is the body!",
    data: { someData: "goes here" },
  };

  await fetch("https://exp.host/--/api/v2/push/send", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Accept-encoding": "gzip, deflate",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(message),
  });
}

function handleRegistrationError(errorMessage: string) {
  alert(errorMessage);
  throw new Error(errorMessage);
}

async function registerForPushNotificationsAsync() {
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
      handleRegistrationError(
        "Permission not granted to get push token for push notification!",
      );
      return;
    }
    const projectId =
      Constants?.expoConfig?.extra?.eas?.projectId ??
      Constants?.easConfig?.projectId;
    if (!projectId) {
      handleRegistrationError("Project ID not found");
    }
    try {
      const pushTokenString = (
        await ExpoNotifications.getExpoPushTokenAsync({
          projectId,
        })
      ).data;
      return pushTokenString;
    } catch (e: unknown) {
      handleRegistrationError(`${e}`);
    }
  } else {
    handleRegistrationError("Must use physical device for push notifications");
  }
}

export function Notifications() {
  const [expoPushToken, setExpoPushToken] = useState("");
  const [notification, setNotification] = useState<
    ExpoNotifications.Notification | undefined
  >(undefined);
  const notificationListener = useRef<ExpoNotifications.Subscription>();
  const responseListener = useRef<ExpoNotifications.Subscription>();

  useEffect(() => {
    registerForPushNotificationsAsync()
      .then((token) => setExpoPushToken(token ?? ""))
      .catch((error: any) => setExpoPushToken(`${error}`));

    notificationListener.current =
      ExpoNotifications.addNotificationReceivedListener((notification) => {
        setNotification(notification);
      });

    responseListener.current =
      ExpoNotifications.addNotificationResponseReceivedListener((response) => {
        //console.log(response);
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
  }, []);

  return (
    <View
      style={{ flex: 1, alignItems: "center", justifyContent: "space-around" }}
    >
      <Screen title="Notifications" />
      <Text>Your Expo push token: {expoPushToken}</Text>
      <View style={{ alignItems: "center", justifyContent: "center" }}>
        <Text>
          Title: {notification && notification.request.content.title}{" "}
        </Text>
        <Text>Body: {notification && notification.request.content.body}</Text>
        <Text>
          Data:{" "}
          {notification && JSON.stringify(notification.request.content.data)}
        </Text>
      </View>
      <Button
        onPress={async () => {
          await sendPushNotification(expoPushToken);
        }}
      >
        <Text>Send push</Text>
      </Button>
    </View>
  );
}
