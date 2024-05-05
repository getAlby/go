import { Nip47Transaction } from "@getalby/sdk/dist/NWCClient";
import { Stack, useLocalSearchParams } from "expo-router";
import React from "react";
import { View } from "react-native";
import { Text } from "~/components/ui/text";

export function Transaction() {
  const { transactionJSON } = useLocalSearchParams() as unknown as {
    transactionJSON: string;
  };
  const transaction: Nip47Transaction = JSON.parse(transactionJSON);
  return (
    <View className="flex-1 flex flex-col p-3 gap-3">
      <Stack.Screen
        options={{
          title: "Transaction",
        }}
      />
      <Text>{JSON.stringify(transaction, null, 2)}</Text>
    </View>
  );
}
