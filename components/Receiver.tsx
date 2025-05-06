import React from "react";
import { View } from "react-native";
import { Text } from "~/components/ui/text";

interface ReceiverProps {
  name: string;
  invoice?: string;
}

export function Receiver({ name, invoice }: ReceiverProps) {
  const shouldShowReceiver =
    name !== invoice &&
    name.toLowerCase().replace("lightning:", "").includes("@");

  if (!shouldShowReceiver) {
    return null;
  }

  return (
    <View className="flex flex-col gap-2">
      <Text className="text-muted-foreground text-center font-semibold2">
        To
      </Text>
      <Text className="text-center text-foreground text-2xl font-medium2">
        {name.toLowerCase().replace("lightning:", "")}
      </Text>
    </View>
  );
}
