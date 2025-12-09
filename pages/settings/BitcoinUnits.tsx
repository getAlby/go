import React from "react";
import { TouchableOpacity, View } from "react-native";
import Toast from "react-native-toast-message";
import CheckIcon from "~/components/icons/CheckIcon";
import { LinearGradient } from "~/components/LinearGradient";
import Screen from "~/components/Screen";
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
      <View className="flex-1 bg-background">
        <View className="px-8 my-6">
          <Text className="text-sm sm:text-base text-center text-secondary-foreground">
            Choose which bitcoin units should be displayed in the app.
          </Text>
        </View>
        <View className="flex gap-6 px-6">
          <View className="flex-row items-center justify-between">
            <TouchableOpacity
              onPress={() => setDisplayFormat("bip177")}
              className="flex flex-row items-center gap-4"
            >
              {bitcoinDisplayFormat === "bip177" ? (
                <LinearGradient
                  className="px-1 rounded-lg aspect-square flex items-center justify-center border-secondary border"
                  colors={["#FFE951", "#FFC453"]}
                  start={[0, 0]}
                  end={[1, 1]}
                >
                  <CheckIcon width={14} height={14} />
                </LinearGradient>
              ) : (
                <LinearGradient
                  className="px-[11px] rounded-lg aspect-square flex items-center justify-center border-muted border"
                  colors={["#F9FAFB", "#E4E6EA"]}
                  start={[0, 0]}
                  end={[1, 1]}
                ></LinearGradient>
              )}
              <Text className="font-medium2">₿</Text>
            </TouchableOpacity>
          </View>
          <View className="flex-row items-center justify-between">
            <TouchableOpacity
              onPress={() => setDisplayFormat("sats")}
              className="flex flex-row items-center gap-4"
            >
              {bitcoinDisplayFormat === "sats" ? (
                <LinearGradient
                  className="px-1 rounded-lg aspect-square flex items-center justify-center border-secondary border"
                  colors={["#FFE951", "#FFC453"]}
                  start={[0, 0]}
                  end={[1, 1]}
                >
                  <CheckIcon width={14} height={14} />
                </LinearGradient>
              ) : (
                <LinearGradient
                  className="px-[11px] rounded-lg aspect-square flex items-center justify-center border-muted border"
                  colors={["#F9FAFB", "#E4E6EA"]}
                  start={[0, 0]}
                  end={[1, 1]}
                ></LinearGradient>
              )}
              <Text className="font-medium2">sats</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </>
  );
}
