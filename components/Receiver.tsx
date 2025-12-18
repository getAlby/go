import React from "react";
import { View } from "react-native";
import { Text } from "~/components/ui/text";

interface ReceiverProps {
  title?: string;
  lightningAddress?: string;
}

export function Receiver({ lightningAddress, title }: ReceiverProps) {
  const shouldShowReceiver =
    lightningAddress &&
    lightningAddress.toLowerCase().replace("lightning:", "").includes("@");

  if (!shouldShowReceiver) {
    return null;
  }

  return (
    <View className="flex flex-col gap-2">
      <Text className="text-center text-muted-foreground font-medium2 sm:text-lg">
        {title ? title : "To"}
      </Text>
      <Text className="text-center text-xl sm:text-2xl font-semibold2">
        {lightningAddress.toLowerCase().replace("lightning:", "")}
      </Text>
    </View>
  );
}
