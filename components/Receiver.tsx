import React from "react";
import { View } from "react-native";
import { Text } from "~/components/ui/text";

interface ReceiverProps {
  originalText: string;
  invoice?: string;
}

export function Receiver({ originalText, invoice }: ReceiverProps) {
  const shouldShowReceiver =
    originalText !== invoice &&
    originalText.toLowerCase().replace("lightning:", "").includes("@");

  if (!shouldShowReceiver) {
    return null;
  }

  return (
    <View className="flex flex-col gap-2">
      <Text className="text-muted-foreground text-center font-semibold2">
        To
      </Text>
      <Text className="text-center text-foreground text-2xl font-medium2">
        {originalText.toLowerCase().replace("lightning:", "")}
      </Text>
    </View>
  );
}
