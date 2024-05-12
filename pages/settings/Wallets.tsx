import { Link, Stack } from "expo-router";
import { Pressable, View } from "react-native";
import { Cog, PlusCircle } from "~/components/Icons";

import { Card, CardHeader, CardTitle } from "~/components/ui/card";
import { Text } from "~/components/ui/text";
import { DEFAULT_WALLET_NAME } from "~/lib/constants";
import { useAppStore } from "~/lib/state/appStore";

export function Wallets() {
  const selectedWalletId = useAppStore((store) => store.selectedWalletId);
  const wallets = useAppStore((store) => store.wallets);
  return (
    <View className="flex-1 flex flex-col p-3 gap-3">
      <Stack.Screen
        options={{
          title: "Select Wallet",
        }}
      />
      {wallets.map((wallet, index) => (
        <Pressable
          key={index}
          onPress={() => {
            if (index !== selectedWalletId) {
              useAppStore.getState().setSelectedWalletId(index);
            }
          }}
        >
          <Card
            className={`w-full ${
              index === selectedWalletId && "border-2 border-primary"
            }`}
          >
            <CardHeader className="w-full">
              <View className="flex flex-row items-center justify-between">
                <Text className="font-bold">
                  {wallet.name || DEFAULT_WALLET_NAME}
                </Text>
                {index === selectedWalletId && (
                  <Link href={`/settings/wallets/${selectedWalletId}`} asChild>
                    <Cog className="text-primary" />
                  </Link>
                )}
              </View>
            </CardHeader>
          </Card>
        </Pressable>
      ))}
      <Link href="/settings/wallets/new" asChild>
        <Pressable>
          <Card className="w-full">
            <CardHeader className="w-full">
              <View className="flex flex-row items-center gap-2">
                <PlusCircle className="text-primary" />
                <Text className="font-bold">Add Wallet</Text>
              </View>
            </CardHeader>
          </Card>
        </Pressable>
      </Link>
    </View>
  );
}
