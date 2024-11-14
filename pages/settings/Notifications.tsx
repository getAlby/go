import React from "react";
import { Text, View } from "react-native";
import Screen from "~/components/Screen";
import { Label } from "~/components/ui/label";
import { Switch } from "~/components/ui/switch";
import { deregisterWalletNotifications } from "~/lib/notifications";
import { useAppStore } from "~/lib/state/appStore";
import { removeAllInfo } from "~/lib/storeWalletInfo";
import { registerForPushNotificationsAsync } from "~/services/Notifications";

export function Notifications() {
  const [isLoading, setLoading] = React.useState(false);
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
            disabled={isLoading}
            checked={isEnabled}
            onCheckedChange={async (checked) => {
              setLoading(true);
              if (checked) {
                checked = await registerForPushNotificationsAsync();
              } else {
                const wallets = useAppStore.getState().wallets;
                for (const wallet of wallets) {
                  await deregisterWalletNotifications(wallet.pushId);
                }
                await removeAllInfo();
                useAppStore.getState().setExpoPushToken("");
              }
              useAppStore.getState().setNotificationsEnabled(checked);
              setLoading(false);
            }}
            nativeID="security"
          />
        </View>
      </View>
    </View>
  );
}
