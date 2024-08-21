import { Link, Stack } from "expo-router";
import { Pressable, View } from "react-native";
import { ZapIcon, WalletIcon, Currency, Bitcoin, Wallet2 } from "~/components/Icons";

import { DEFAULT_WALLET_NAME } from "~/lib/constants";
import { useAppStore } from "~/lib/state/appStore";
import { Text } from "~/components/ui/text";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";

export function Settings() {
  const wallet = useAppStore((store) => store.wallets[store.selectedWalletId]);

  return (
    <View className="flex-1 flex flex-col p-5 gap-6">
      <Stack.Screen
        options={{
          title: "Settings",
        }}
      />
      <Link href="/settings/wallets" asChild>
        <Pressable className="flex flex-row items-center gap-4">
          <Wallet2 className="text-foreground bg-card" />
          <Text className="font-medium2 text-xl text-foreground">Wallets</Text>
          <Text className="text-muted-foreground text-xl">({wallet.name || DEFAULT_WALLET_NAME})</Text>
        </Pressable>
      </Link>

      <Link href="/settings/fiat-currency" asChild>
        <Pressable className="flex flex-row gap-4">
          <Bitcoin className="text-foreground" />
          <Text className="text-foreground font-medium2 text-xl">Units & Currency</Text>
        </Pressable>
      </Link>
    </View>
  );
}
