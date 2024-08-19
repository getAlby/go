import { Link, Stack } from "expo-router";
import { Wallet2 } from "lucide-react-native";
import { Pressable, View } from "react-native";
import { FlatList } from "react-native";
import { PlusCircle, Settings2 } from "~/components/Icons";
import { Button } from "~/components/ui/button";

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
                <Pressable onPress={() => {
                  if (item.index !== selectedWalletId) {
                    useAppStore.getState().setSelectedWalletId(item.index);
                  }
                }}
                  className="flex flex-row justify-between w-full p-3">
                  <View className="flex flex-row gap-2">
                    <Wallet2 className="w-4 h-4 text-primary" />
                    <Text className="text-xl">
                      {item.item.name || DEFAULT_WALLET_NAME}
                    </Text>
                  </View>
                  {active && (
                    <Link href={`/settings/wallets/${selectedWalletId}`} asChild>
                      <Settings2 className="text-primary" />
                    </Link>)}
                </Pressable>);
            }}
          />
        </View >
        <Link href="/settings/wallets/new" asChild>
          <Button className="flex flex-row justify-center items-center gap-2" size="lg">
            <PlusCircle className="text-primary" width={16} height={16} />
            <Text>Connect a Wallet</Text>
          </Button>
        </Link>
      </View >
    </>
  );
}
