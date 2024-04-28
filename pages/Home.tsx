import { Pressable, ScrollView, Text as RNText, View } from "react-native";
import React from "react";
import { useBalance } from "hooks/useBalance";
import { useAppStore } from "lib/state/appStore";
import { Setup } from "./Setup";
import { useTransactions } from "hooks/useTransactions";
import { Link } from "expo-router";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { Button } from "~/components/ui/button";
import { Text } from "~/components/ui/text";
import { AlertCircle } from "~/components/Icons";

dayjs.extend(relativeTime);

export function Home() {
  const nwcClient = useAppStore((store) => store.nwcClient);
  const { data: balance } = useBalance();
  const { data: transactions } = useTransactions();

  if (!nwcClient) {
    return <Setup />;
  }

  return (
    <>
      <View className="w-full pt-12 pb-8">
        <RNText className="text-4xl text-center">
          <RNText className="text-neutral-500">₿ </RNText>
          {balance ? (
            <>
              {new Intl.NumberFormat().format(
                Math.floor(balance.balance / 1000)
              )}
            </>
          ) : (
            "Loading"
          )}{" "}
          sats
        </RNText>
      </View>
      <View className="flex flex-row w-full gap-x-4">
        <Pressable>
          <Link
            href="/receive"
            className="flex-1 p-4 bg-primary text-white rounded-md font-bold text-center"
          >
            <RNText>Receive</RNText>
          </Link>
        </Pressable>
        <Link
          href="/send"
          className="flex-1 p-4 bg-primary text-white rounded-md font-bold text-center"
        >
          <RNText>Send</RNText>
        </Link>
      </View>

      <View className="px-4 py-4">
        <Button variant="secondary">
          <View className="flex flex-row justify-center items-center gap-2">
            <AlertCircle className="text-primary" />
            <Text className="">RNR button</Text>
          </View>
        </Button>
      </View>

      {transactions ? (
        <ScrollView>
          {transactions.transactions.map((t) => (
            <View
              key={t.payment_hash}
              className="flex flex-row items-center text-sm gap-x-4"
            >
              <View className="w-5">
                <RNText className="text-center">
                  {t.type === "incoming" ? "+" : "-"}
                </RNText>
              </View>
              <View className="flex flex-col flex-1">
                <RNText numberOfLines={1} className="font-medium">
                  {t.description
                    ? t.description
                    : t.type === "incoming"
                    ? "Received"
                    : "Sent"}
                </RNText>
                <RNText className="text-neutral-500">
                  {dayjs.unix(t.settled_at).fromNow()}
                </RNText>
              </View>
              <View className="">
                <RNText className="text-right">
                  {Math.floor(t.amount / 1000)} sats
                </RNText>
                <RNText className="text-right text-neutral-500">&nbsp;</RNText>
              </View>
            </View>
          ))}
        </ScrollView>
      ) : (
        <RNText>Loading transactions...</RNText>
      )}

      {/* <Pressable
        className="mt-32"
        onPress={() => {
          secureStorage.removeItem("nostrWalletConnectUrl");
          useAppStore.getState().setNWCClient(undefined);
        }}
      >
        <RNText>Disconnect</RNText>
      </Pressable> */}
    </>
  );
}
