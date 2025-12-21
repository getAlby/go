import React from "react";
import { Platform, View } from "react-native";
import { Text } from "~/components/ui/text";
import { cn } from "~/lib/utils";

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
      <Text
        className={cn(
          Platform.select({
            ios: "ios:text-base ios:sm:text-lg",
            android: "android:text-base",
          }),
          "text-center text-muted-foreground font-medium2",
        )}
      >
        {title ? title : "To"}
      </Text>
      <Text
        className={cn(
          Platform.select({
            ios: "ios:text-xl ios:sm:text-2xl",
            android: "android:text-xl",
          }),
          "text-center font-semibold2",
        )}
      >
        {lightningAddress.toLowerCase().replace("lightning:", "")}
      </Text>
    </View>
  );
}
