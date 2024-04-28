import { FlatList, Pressable, ScrollView, Text, TouchableNativeFeedback, TouchableOpacity, View } from "react-native";
import React from "react";
import { useBalance } from "hooks/useBalance";
import { useAppStore } from "lib/state/appStore";
import { Setup } from "./Setup";
import { secureStorage } from "lib/secureStorage";
import { useTransactions } from "hooks/useTransactions";
import { Link } from "expo-router";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { StatusBar } from "expo-status-bar";
import { ArrowUp, Camera, UploadIcon } from "lucide-react-native";

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
        <Text className="text-4xl text-center">
          <Text className="text-neutral-500">₿ </Text>
          {balance ?
            <>
              {new Intl.NumberFormat().format(Math.floor(balance.balance / 1000))}
            </> :
            "Loading"}
          {" "}sats
        </Text>
      </View>
      <View className="flex flex-row w-full gap-x-4">
        <Link href="/receive" className="flex-1 p-4 bg-primary text-white rounded-md font-bold text-center">
          <Text>Receive</Text>
        </Link>
        <Link href="/send" className="flex-1 p-4 bg-primary text-white rounded-md font-bold text-center">
          <Text>Send</Text>
        </Link>
      </View>

      <View className="w-full flex-1 flex flex-col gap-y-4">
        <FlatList data={transactions?.transactions}
          renderItem={({ item }) => <View key={item.payment_hash}
            className="flex flex-row items-center text-sm gap-x-4 px-3 py-1.5">
            <View className="w-5">
              <Text className="text-center">{item.type === "incoming" ? "+" : "-"}</Text>
            </View>
            <View className="flex flex-col flex-1">
              <Text numberOfLines={1} className="font-medium">
                {item.description ? item.description : item.type === "incoming" ? "Received" : "Sent"}
              </Text>
              <Text className="text-neutral-500">{dayjs.unix(item.settled_at).fromNow()}</Text>
            </View>
            <View className="">
              <Text className="text-right">
                {Math.floor(item.amount / 1000)}{" "}
                sats
              </Text>
              <Text className="text-right text-neutral-500">
                &nbsp;
              </Text>
            </View>
          </View>}>
        </FlatList>
      </View>

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
