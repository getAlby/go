import { ScrollView, View, FlatList } from "react-native";
import React from "react";
import { useBalance } from "hooks/useBalance";
import { useAppStore } from "lib/state/appStore";
import { Setup } from "./Setup";
import { useTransactions } from "hooks/useTransactions";
import { Link, Stack } from "expo-router";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { Button } from "~/components/ui/button";
import { Text } from "~/components/ui/text";
import { MoveUpRight, MoveDownLeft } from "~/components/Icons";
import { cn } from "~/lib/utils";
import { Skeleton } from "~/components/ui/skeleton";

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
      <Stack.Screen
        options={{
          title: "Alby Mobile",
        }}
      />
      <View className="w-full pt-12 pb-8 flex flex-row justify-center items-center gap-2">
        <Text className="text-4xl text-neutral-500">₿</Text>
        {balance ? (
          <Text className="text-4xl">
            {new Intl.NumberFormat().format(Math.floor(balance.balance / 1000))}{" "}
            sats
          </Text>
        ) : (
          <Skeleton className="w-48 h-8" />
        )}
      </View>
      <View className="flex flex-row w-full gap-x-4 p-3 mb-3">
        <Link href="/receive" className="flex-1" asChild>
          <Button size="lg">
            <View className="flex flex-row justify-center items-center gap-2">
              <MoveDownLeft className="text-white" />
              <Text className="">Receive</Text>
            </View>
          </Button>
        </Link>
        <Link href="/send" className="flex-1" asChild>
          <Button size="lg">
            <View className="flex flex-row justify-center items-center gap-2">
              <MoveUpRight className="text-white" />
              <Text>Send</Text>
            </View>
          </Button>
        </Link>
      </View>

      <>
        {transactions ? (
          <FlatList
            data={transactions?.transactions}
            renderItem={({ item }) => (
              <View
                key={item.payment_hash}
                className="flex flex-row items-center text-sm gap-x-6 px-4 mb-4"
              >
                <View className="w-10 h-10 bg-muted rounded-full flex flex-col items-center justify-center">
                  {item.type === "incoming" && (
                    <>
                      <MoveDownLeft className="text-green-500 " />
                    </>
                  )}
                  {item.type === "outgoing" && (
                    <>
                      <MoveUpRight className="text-red-600 " />
                    </>
                  )}
                </View>
                <View className="flex flex-col flex-1">
                  <Text numberOfLines={1} className="font-medium">
                    {item.description
                      ? item.description
                      : item.type === "incoming"
                      ? "Received"
                      : "Sent"}
                  </Text>
                  <Text className="text-neutral-500">
                    {dayjs.unix(item.settled_at).fromNow()}
                  </Text>
                </View>
                <View>
                  <Text
                    className={cn(
                      "text-right",
                      item.type === "incoming"
                        ? "text-green-500"
                        : "text-red-600"
                    )}
                  >
                    {Math.floor(item.amount / 1000)}
                    <Text className="text-neutral-500"> sats</Text>
                  </Text>
                  <Text className="text-right text-neutral-500">&nbsp;</Text>
                </View>
              </View>
            )}
          />
        ) : (
          <ScrollView>
            {[...Array(20)].map((e, i) => (
              <View
                key={i}
                className="flex flex-row items-center text-sm gap-x-6 px-4 mb-4"
              >
                <Skeleton className="rounded-full w-10 h-10" />
                <View className="flex flex-col flex-1 gap-1">
                  <Skeleton className="w-32 h-4" />
                  <Skeleton className="w-16 h-4" />
                </View>
                <View className="flex items-center">
                  <Skeleton className="w-8 h-4" />
                </View>
              </View>
            ))}
          </ScrollView>
        )}
      </>

      {/* <Pressable
        className="mt-32"
        onPress={() => {
          secureStorage.removeItem("nostrWalletConnectUrl");
          useAppStore.getState().setNWCClient(undefined);
        }}
      >
        <Text>Disconnect</Text>
      </Pressable> */}
    </>
  );
}
