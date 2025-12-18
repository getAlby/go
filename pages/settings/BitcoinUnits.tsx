import React from "react";
import { View } from "react-native";
import Toast from "react-native-toast-message";
import Screen from "~/components/Screen";
import { Checkbox } from "~/components/ui/checkbox";
import { Text } from "~/components/ui/text";
import { setNotificationSettings } from "~/lib/notificationsNativeStorage";
import { BitcoinDisplayFormat, useAppStore } from "~/lib/state/appStore";

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
          <Text className="text-sm sm:text-base text-center text-secondary-foreground">
            Choose which bitcoin units should be displayed in the app.
          </Text>
        </View>
        <View className="flex gap-6 px-6">
          <Checkbox
            isChecked={bitcoinDisplayFormat === "bip177"}
            onPress={() => setDisplayFormat("bip177")}
          >
            <Text className="sm:text-lg font-semibold2">₿</Text>
          </Checkbox>
          <Checkbox
            isChecked={bitcoinDisplayFormat === "sats"}
            onPress={() => setDisplayFormat("sats")}
          >
            <Text className="sm:text-lg font-semibold2">sats</Text>
          </Checkbox>
        </View>
      </View>
    </>
  );
}
