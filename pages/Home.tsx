import { Pressable, ScrollView, Text, View } from "react-native";
import React from "react";
import { useBalance } from "hooks/useBalance";
import { useAppStore } from "lib/state/appStore";
import { Setup } from "./Setup";
import { secureStorage } from "lib/secureStorage";
import { useTransactions } from "hooks/useTransactions";
import { Link } from "expo-router";

export function Home() {
  const nwcClient = useAppStore((store) => store.nwcClient);
  const { data: balance } = useBalance();
  const { data: transactions } = useTransactions();

  if (!nwcClient) {
    return <Setup />;
  }

  return (
    <>
      <View className="flex-1 w-full flex flex-col">
        <Text>Home</Text>
        <Text>
          {balance ? Math.floor(balance.balance / 1000) : "Loading"} sats
        </Text>
      </View>

      {transactions && (
        <ScrollView className="w-full h-[30vh]">
          {transactions.transactions.map((t) => (
            <Text key={t.payment_hash}>
              {new Date(t.settled_at * 1000).toString()}{" "}
              {t.type === "incoming" ? "+" : "-"} {Math.floor(t.amount / 1000)}{" "}
              sats
            </Text>
          ))}
        </ScrollView>
      )}

      <View className="flex flex-row w-full gap-4">
        <Link href="/send" className="flex-1 p-4 bg-red-500">
          <Text>Send</Text>
        </Link>
        <Link href="/receive" className="flex-1 p-4 bg-green-500">
          <Text>Receive</Text>
        </Link>
      </View>

      <Pressable
        className="mt-32"
        onPress={() => {
          secureStorage.removeItem("nostrWalletConnectUrl");
          useAppStore.getState().setNWCClient(undefined);
        }}
      >
        <Text>Disconnect</Text>
      </Pressable>
    </>
  );
}
