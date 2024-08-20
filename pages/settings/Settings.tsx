import { Link, Stack } from "expo-router";
import { Pressable, View } from "react-native";
import { ZapIcon, WalletIcon, Currency, Bitcoin, Wallet2 } from "~/components/Icons";

import { DEFAULT_WALLET_NAME } from "~/lib/constants";
import { useAppStore } from "~/lib/state/appStore";
import { Text } from "~/components/ui/text";

export function Settings() {
  const wallet = useAppStore((store) => store.wallets[store.selectedWalletId]);

  return (
    <View className="flex-1 flex flex-col p-5 gap-5">
      <Stack.Screen
        options={{
          title: "Settings",
        }}
      />
      <Link href="/settings/wallets" asChild>
        <Pressable className="flex flex-row items-center gap-2">
          <Wallet2 className="text-card-foreground bg-card" />
          <Text className="font-semibold text-xl text-card-foreground">Wallets</Text>
          <Text className="text-gray-400 text-card-foreground">({wallet.name || DEFAULT_WALLET_NAME})</Text>
        </Pressable>
      </Link>

      <Link href="/settings/fiat-currency" asChild>
        <Pressable className="flex flex-row gap-2">
          <Bitcoin className="text-card-foreground" />
          <Text className="text-card-foreground font-semibold text-xl">Units & Currency</Text>
        </Pressable>
      </Link>
    </View>
  );
}
