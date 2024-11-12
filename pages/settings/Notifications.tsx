import React from "react";
import { Text, View } from "react-native";
import Screen from "~/components/Screen";
import { Label } from "~/components/ui/label";
import { Switch } from "~/components/ui/switch";
import { useAppStore } from "~/lib/state/appStore";
import { registerForPushNotificationsAsync } from "~/services/Notifications";

export function Notifications() {
  // TODO: If this is enabled, register notifications on new wallets being added
  const isEnabled = useAppStore((store) => store.isNotificationsEnabled);

  return (
    <View className="flex-1 p-6">
      <Screen title="Notifications" />
      <View className="flex-1">
        <View className="flex-row items-center justify-between gap-2">
          <Label className={"text-2xl"} nativeID="security">
            <Text className="text-lg">Allow Go to send notifications</Text>
          </Label>
          <Switch
            checked={isEnabled}
            onCheckedChange={async (checked) => {
              if (checked) {
                await registerForPushNotificationsAsync();
              } else {
                // TODO: de-register all wallets on nostr api
              }
              useAppStore.getState().setNotificationsEnabled(checked);
            }}
            nativeID="security"
          />
        </View>
      </View>
    </View>
  );
}
