import React from "react";
import { TouchableOpacity, View } from "react-native";
import Toast from "react-native-toast-message";
import { CheckIcon } from "~/components/Icons";
import Screen from "~/components/Screen";
import { Text } from "~/components/ui/text";
import { setNotificationSettings } from "~/lib/notificationsNativeStorage";
import { BitcoinDisplayFormat, useAppStore } from "~/lib/state/appStore";
import { cn } from "~/lib/utils";

export function BitcoinUnits() {
  const bitcoinDisplayFormat = useAppStore(
    (store) => store.bitcoinDisplayFormat,
  );

  const setDisplayFormat = async (
    bitcoinDisplayFormat: BitcoinDisplayFormat,
  ) => {
    useAppStore.getState().setBitcoinDisplayFormat(bitcoinDisplayFormat);
    setNotificationSettings({
      bitcoinDisplayFormat,
    });
    Toast.show({ type: "success", text1: "Bitcoin unit updated" });
  };

  return (
    <View className="flex-1 py-6">
      <Screen title="Bitcoin Units" />
      <View className="flex-1">
        <View className="px-8">
          <Text className="text-lg text-center text-muted-foreground">
            Choose from which wallets you want to receive app notifications
          </Text>
        </View>
        <View className="flex gap-6 px-6 mt-12">
          <View className="flex-row items-center justify-between">
            <TouchableOpacity
              onPress={() => setDisplayFormat("bip177")}
              className="flex flex-row items-center gap-4"
            >
              <View
                className={cn(
                  bitcoinDisplayFormat === "bip177"
                    ? "bg-primary border-background/80"
                    : "border-foreground/5",
                  "shadow shadow-gray-200 px-1 rounded-xl aspect-square flex items-center justify-center border-2",
                )}
              >
                <CheckIcon className="text-white" width={16} height={16} />
              </View>
              <Text className="text-lg font-medium2">₿</Text>
            </TouchableOpacity>
            <Text className="text-lg text-muted-foreground">
              1 ₿ = 0.00 000 001 BTC
            </Text>
          </View>
          <View className="flex-row items-center justify-between">
            <TouchableOpacity
              onPress={() => setDisplayFormat("sats")}
              className="flex flex-row items-center gap-4"
            >
              <View
                className={cn(
                  bitcoinDisplayFormat === "sats"
                    ? "bg-primary border-background/80"
                    : "border-foreground/5",
                  "shadow shadow-gray-200 px-1 rounded-xl aspect-square flex items-center justify-center border-2",
                )}
              >
                <CheckIcon className="text-white" width={16} height={16} />
              </View>
              <Text className="text-lg font-medium2">sats</Text>
            </TouchableOpacity>
            <Text className="text-lg text-muted-foreground">
              1 sat = 0.00 000 001 BTC
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}
