import React from "react";
import { View } from "react-native";
import { Text } from "~/components/ui/text";

interface ReceiverProps {
  lightningAddress?: string;
}

export function Receiver({ lightningAddress }: ReceiverProps) {
  const shouldShowReceiver =
    lightningAddress &&
    lightningAddress.toLowerCase().replace("lightning:", "").includes("@");

  if (!shouldShowReceiver) {
    return null;
  }

  return (
    <View className="flex flex-col gap-2">
      <Text className="text-muted-foreground text-center font-semibold2">
        To
      </Text>
      <Text className="text-center text-2xl font-semibold2">
        {lightningAddress.toLowerCase().replace("lightning:", "")}
      </Text>
    </View>
  );
}
