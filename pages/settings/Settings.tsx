import { Link, Stack } from "expo-router";
import { Pressable, View } from "react-native";
import { ZapIcon, WalletIcon, Currency } from "~/components/Icons";

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { DEFAULT_WALLET_NAME } from "~/lib/constants";
import { useAppStore } from "~/lib/state/appStore";

export function Settings() {
  const wallet = useAppStore((store) => store.wallets[store.selectedWalletId]);
  return (
    <View className="flex-1 flex flex-col p-3 gap-3">
      <Stack.Screen
        options={{
          title: "Settings",
        }}
      />
      <Link href="/settings/wallets" asChild>
        <Pressable>
          <Card className="w-full">
            <CardHeader className="w-full">
              <CardTitle className="flex flex-col">Wallet</CardTitle>
              <CardDescription>
                Current Wallet: {wallet.name || DEFAULT_WALLET_NAME}
              </CardDescription>
            </CardHeader>
          </Card>
        </Pressable>
      </Link>

      <Link href="/settings/fiat-currency" asChild>
        <Pressable>
          <Card className="w-full">
            <CardHeader>
              <CardTitle>Fiat Currency</CardTitle>
              <CardDescription>
                Configure fiat currency conversion
              </CardDescription>
            </CardHeader>
          </Card>
        </Pressable>
      </Link>
    </View>
  );
}
