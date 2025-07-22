import React from "react";
import { FlatList, View } from "react-native";
import Loading from "~/components/Loading";
import Screen from "~/components/Screen";
import { Label } from "~/components/ui/label";
import { Switch } from "~/components/ui/switch";
import { Text } from "~/components/ui/text";
import { errorToast } from "~/lib/errorToast";
import {
  deregisterWalletNotifications,
  registerWalletNotifications,
} from "~/lib/notifications";
import { useAppStore, type Wallet } from "~/lib/state/appStore";
import { cn } from "~/lib/utils";
import { registerForPushNotificationsAsync } from "~/services/Notifications";

export function Notifications() {
  const [isLoading, setLoading] = React.useState(false);
  const wallets = useAppStore((store) => store.wallets);
  const isEnabled = useAppStore((store) => store.isNotificationsEnabled);

  return (
    <View className="flex-1 py-6">
      <Screen title="Notifications" />
      <View className="flex-1">
        <View className="flex-row items-center justify-between gap-2 px-6">
          <Label nativeID="notifications">
            <Text className="text-lg font-medium2">Show app notifications</Text>
          </Label>
          {isLoading ? (
            <Loading className="h-8 mr-4" />
          ) : (
            <Switch
              checked={!!isEnabled}
              onCheckedChange={async (checked) => {
                setLoading(true);
                let enabled: boolean | null = checked;
                if (enabled) {
                  enabled = await registerForPushNotificationsAsync();
                } else {
                  const wallets = useAppStore.getState().wallets;
                  for (const [id, wallet] of wallets.entries()) {
                    await deregisterWalletNotifications(wallet, id);
                  }
                  enabled = useAppStore
                    .getState()
                    .wallets.some((wallet) => wallet.pushId);
                  if (enabled) {
                    errorToast("Failed to deregister notifications");
                  }
                }
                useAppStore.getState().setNotificationsEnabled(enabled);
                setLoading(false);
              }}
              nativeID="security"
            />
          )}
        </View>
        {wallets.length > 1 && (
          <>
            <View className="px-8 my-6">
              <Text className="text-lg text-center text-muted-foreground">
                Choose from which wallets you want to receive app notifications
              </Text>
            </View>
            <FlatList
              className={cn(
                "flex flex-col px-5",
                !isEnabled && "opacity-50 pointer-events-none",
              )}
              data={wallets}
              renderItem={({ item: wallet, index }) => (
                <WalletNotificationSwitch
                  wallet={wallet}
                  index={index}
                  isEnabled={!!isEnabled}
                />
              )}
            />
          </>
        )}
      </View>
    </View>
  );
}

function WalletNotificationSwitch({
  wallet,
  index,
  isEnabled,
}: {
  wallet: Wallet;
  index: number;
  isEnabled: boolean;
}) {
  const [isLoading, setLoading] = React.useState(false);

  const handleSwitchToggle = async (checked: boolean) => {
    setLoading(true);
    if (checked) {
      await registerWalletNotifications(wallet, index);
    } else {
      await deregisterWalletNotifications(wallet, index);
      const hasNotificationsEnabled = useAppStore
        .getState()
        .wallets.some((wallet) => wallet.pushId);
      useAppStore.getState().setNotificationsEnabled(hasNotificationsEnabled);
    }
    setLoading(false);
  };

  return (
    <View className="flex-row items-center justify-between gap-2 mb-6">
      <Label nativeID={`notifications-${index}`}>
        <Text className="text-lg font-medium2">{wallet.name}</Text>
      </Label>
      {isLoading ? (
        <Loading className="h-8 mr-4" />
      ) : (
        <Switch
          checked={isEnabled && !!wallet.pushId}
          onCheckedChange={handleSwitchToggle}
          nativeID={`notifications-${index}`}
        />
      )}
    </View>
  );
}
