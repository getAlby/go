import { Link, Stack } from "expo-router";
import { Wallet2 } from "lucide-react-native";
import { Pressable, View } from "react-native";
import { FlatList } from "react-native";
import { PlusCircle, Settings2 } from "~/components/Icons";

import { Text } from "~/components/ui/text";
import { DEFAULT_WALLET_NAME } from "~/lib/constants";
import { useAppStore } from "~/lib/state/appStore";

export function Wallets() {
  const selectedWalletId = useAppStore((store) => store.selectedWalletId);
  const wallets = useAppStore((store) => store.wallets);
  return (
    <>
      <View className="flex-1 flex flex-col p-3 gap-3">
        <Stack.Screen
          options={{
            title: "Select Wallet",
          }} />
        <View className="flex-1">
          <FlatList
            className="flex flex-col"
            data={wallets}
            renderItem={(item) => {
              const active = item.index === selectedWalletId;

              return (
                <View className="flex flex-row justify-between items-center p-3">
                  <View className="flex flex-row gap-3 items-center">
                    <Wallet2 className="w-4 h-4 text-primary" />
                    <Text className="font-bold"
                      onPress={() => {
                        if (item.index !== selectedWalletId) {
                          useAppStore.getState().setSelectedWalletId(item.index);
                        }
                      }}>
                      {item.item.name}
                    </Text>
                  </View>
                  {active && (
                    <Link href={`/settings/wallets/${selectedWalletId}`} asChild>
                      <Settings2 className="text-primary" />
                    </Link>)}
                </View>);
            }}
          />

          {/* {wallets.map((wallet, index) => (
            <Pressable
              key={index}
              onPress={() => {
                if (index !== selectedWalletId) {
                  useAppStore.getState().setSelectedWalletId(index);
                }
              }}
            >
              <View
              >
                <View className="flex flex-row items-center justify-between">
                  <Text className="font-bold">
                    {wallet.name || DEFAULT_WALLET_NAME}
                  </Text>
                  {index === selectedWalletId && (
                    <Link href={`/settings/wallets/${selectedWalletId}`} asChild>
                      <Settings2 className="text-primary" />
                    </Link>
                  )}
                </View>
              </View>
            </Pressable>
          ))} */}
        </View >
        <Link href="/settings/wallets/new" asChild>
          <Pressable>
            <View className="flex flex-row items-center gap-2">
              <PlusCircle className="text-primary" />
              <Text className="font-bold">Connect a Wallet</Text>
            </View>
          </Pressable>
        </Link>
      </View >
    </>
  );
}
