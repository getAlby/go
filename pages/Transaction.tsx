import { Nip47Transaction } from "@getalby/sdk/dist/NWCClient";
import dayjs from "dayjs";
import { Stack, useLocalSearchParams } from "expo-router";
import { Scroll } from "lucide-react-native";
import React from "react";
import { ScrollView, View } from "react-native";
import { CheckCircle, MoveDownLeft } from "~/components/Icons";
import { Text } from "~/components/ui/text";
import { useGetFiatAmount } from "~/hooks/useGetFiatAmount";
import { cn } from "~/lib/utils";

export function Transaction() {
  const { transactionJSON } = useLocalSearchParams() as unknown as {
    transactionJSON: string;
  };
  const transaction: Nip47Transaction = JSON.parse(transactionJSON);
  const getFiatAmount = useGetFiatAmount();

  return (
    <View className="flex-1 flex flex-col p-3 gap-3">
      <Stack.Screen
        options={{
          title: "Transaction",
        }}
      />
      <View className="flex flex-col gap-3 my-10 justify-center items-center">
        <CheckCircle
          className={
            transaction.type === "incoming" ? "text-receive" : "text-send"
          }
          width={100}
          height={100}
        />
        <Text className="text-2xl font-bold">
          {transaction.type === "incoming" ? "Received" : "Sent"}
        </Text>

        <View className="flex flex-row items-center mt-5">
          <Text
            className={cn(
              "text-4xl gap-2",
              transaction.type === "incoming" ? "text-receive" : "text-send"
            )}
          >
            {Math.floor(transaction.amount / 1000)}
          </Text>
          <Text className="text-4xl text-neutral-500"> sats</Text>
        </View>
        {getFiatAmount && (
          <Text className="text-xl text-neutral-500">
            {getFiatAmount(Math.floor(transaction.amount / 1000))}
          </Text>
        )}

        <TransactionDetailRow
          title="Date & Time"
          content={dayjs.unix(transaction.settled_at).fromNow()}
        />
        <TransactionDetailRow
          title="Description"
          content={transaction.description || "None"}
        />
        <TransactionDetailRow
          title="Payment Hash"
          content={transaction.payment_hash}
        />
        <TransactionDetailRow title="Preimage" content={transaction.preimage} />
      </View>
    </View>
  );
}

function TransactionDetailRow(props: { title: string; content: string }) {
  return (
    <View className="flex flex-row gap-3 my-1">
      <Text className="w-32 text-muted-foreground">{props.title}</Text>
      <Text className="flex-1">{props.content}</Text>
    </View>
  );
}
