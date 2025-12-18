import React from "react";
import { FlatList, Pressable, View } from "react-native";
import Screen from "~/components/Screen";
import { Switch } from "~/components/ui/switch";
import { Text } from "~/components/ui/text";
import { errorToast } from "~/lib/errorToast";
import {
  deregisterWalletNotifications,
  registerWalletNotifications,
} from "~/lib/notifications";
import { setNotificationSettings } from "~/lib/notificationsNativeStorage";
import { useAppStore, type Wallet } from "~/lib/state/appStore";
import { cn } from "~/lib/utils";
import { registerForPushNotificationsAsync } from "~/services/Notifications";

export function Notifications() {
  const [isLoading, setLoading] = React.useState(false);
  const [isLoadingTTS, setLoadingTTS] = React.useState(false);
  const wallets = useAppStore((store) => store.wallets);
  const notificationsEnabled = useAppStore(
    (store) => store.isNotificationsEnabled,
  );
  const ttsNotificationsEnabled = useAppStore(
    (store) => store.ttsNotificationsEnabled,
  );

  const toggleNotifications = async () => {
    if (isLoading) {
      return;
    }
    setLoading(true);
    let enabled: boolean | null;
    if (!notificationsEnabled) {
      enabled = await registerForPushNotificationsAsync();
    } else {
      const wallets = useAppStore.getState().wallets;
      for (const [id, wallet] of wallets.entries()) {
        await deregisterWalletNotifications(wallet, id);
      }
      enabled = useAppStore.getState().wallets.some((wallet) => wallet.pushId);
      if (enabled) {
        errorToast(new Error("Failed to deregister notifications"));
      } else {
        if (ttsNotificationsEnabled) {
          useAppStore.getState().setTTSNotificationsEnabled(false);
          await setNotificationSettings({
            ttsEnabled: false,
          });
        }
      }
    }
    useAppStore.getState().setNotificationsEnabled(enabled);
    setLoading(false);
  };

  const toggleTTS = async () => {
    if (isLoadingTTS) {
      return;
    }
    setLoadingTTS(true);
    useAppStore.getState().setTTSNotificationsEnabled(!ttsNotificationsEnabled);
    await setNotificationSettings({
      ttsEnabled: !ttsNotificationsEnabled,
    });
    setLoadingTTS(false);
  };

  return (
    <View className="flex-1 p-6">
      <Screen title="Notifications" />
      <View className="flex-1">
        <View className="flex-row items-center justify-between gap-2">
          <Pressable onPress={toggleNotifications}>
            <Text className="sm:text-lg font-semibold2">
              Show app notifications
            </Text>
          </Pressable>
          <Switch
            disabled={isLoading}
            checked={!!notificationsEnabled}
            onCheckedChange={toggleNotifications}
            nativeID="security"
          />
        </View>
        {wallets.length > 1 && (
          <>
            <View className="px-8 my-6">
              <Text className="text-sm sm:text-base text-center text-secondary-foreground">
                Choose from which wallets you want to receive app notifications
              </Text>
            </View>
            <FlatList
              className={cn(
                "flex flex-col",
                !notificationsEnabled && "opacity-50 pointer-events-none",
              )}
              data={wallets}
              renderItem={({ item: wallet, index }) => (
                <WalletNotificationSwitch
                  wallet={wallet}
                  index={index}
                  isEnabled={!!notificationsEnabled}
                />
              )}
            />
          </>
        )}
        <View
          className={cn(
            "flex-row items-center justify-between gap-2 mt-8",
            !notificationsEnabled && "opacity-50 pointer-events-none",
          )}
        >
          <Pressable onPress={toggleTTS}>
            <Text className="sm:text-lg font-semibold2">
              Spoken notifications
            </Text>
          </Pressable>
          <Switch
            disabled={isLoadingTTS || !notificationsEnabled}
            checked={!!ttsNotificationsEnabled}
            onCheckedChange={toggleTTS}
            nativeID="security"
          />
        </View>
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
  const checked = isEnabled && !!wallet.pushId;
  const [isLoading, setLoading] = React.useState(false);

  const handleSwitchToggle = async () => {
    setLoading(true);
    if (!checked) {
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
    <View
      key={index}
      className="flex-row items-center justify-between gap-2 mb-6"
    >
      <Pressable onPress={handleSwitchToggle}>
        <Text className="sm:text-lg font-medium2">{wallet.name}</Text>
      </Pressable>
      <Switch
        disabled={isLoading}
        checked={checked}
        onCheckedChange={handleSwitchToggle}
        nativeID={`notifications-${index}`}
      />
    </View>
  );
}
