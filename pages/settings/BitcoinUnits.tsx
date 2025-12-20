import React from "react";
import { Platform, View } from "react-native";
import Toast from "react-native-toast-message";
import Screen from "~/components/Screen";
import { Checkbox } from "~/components/ui/checkbox";
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
    <>
      <Screen title="Bitcoin Units" />
      <View className="flex-1">
        <View className="px-8 my-6">
          <Text
            className={cn(
              Platform.select({
                ios: "ios:text-sm ios:sm:text-base",
                android: "android:text-sm",
              }),
              "text-center text-secondary-foreground",
            )}
          >
            Choose which bitcoin units should be displayed in the app.
          </Text>
        </View>
        <View className="flex gap-6 px-6">
          <Checkbox
            isChecked={bitcoinDisplayFormat === "bip177"}
            onPress={() => setDisplayFormat("bip177")}
          >
            <Text
              className={cn(
                Platform.select({
                  ios: "ios:text-base ios:sm:text-lg",
                  android: "android:text-base",
                }),
                "font-semibold2",
              )}
            >
              ₿
            </Text>
          </Checkbox>
          <Checkbox
            isChecked={bitcoinDisplayFormat === "sats"}
            onPress={() => setDisplayFormat("sats")}
          >
            <Text
              className={cn(
                Platform.select({
                  ios: "ios:text-base ios:sm:text-lg",
                  android: "android:text-base",
                }),
                "font-semibold2",
              )}
            >
              sats
            </Text>
          </Checkbox>
        </View>
      </View>
    </>
  );
}
