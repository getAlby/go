import { Link, Stack } from "expo-router";
import { Pressable, View } from "react-native";
import { ZapIcon, WalletIcon, Currency } from "~/components/Icons";

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Text } from "~/components/ui/text";
import { DEFAULT_WALLET_NAME } from "~/lib/constants";
import { useAppStore } from "~/lib/state/appStore";

export function EditWallet() {
  const selectedWalletId = useAppStore((store) => store.selectedWalletId);
  const wallets = useAppStore((store) => store.wallets);
  return (
    <View className="flex-1 flex flex-col p-3 gap-3">
      <Stack.Screen
        options={{
          title: "Edit Wallet",
        }}
      />
      {(wallets[selectedWalletId].nwcCapabilities || []).indexOf(
        "notifications"
      ) < 0 && (
        <Text>
          Warning: Your wallet does not support notifications capability.
        </Text>
      )}
      {(wallets[selectedWalletId].nwcCapabilities || []).indexOf(
        "list_transactions"
      ) < 0 && (
        <Text>
          Warning: Your wallet does not support list_transactions capability.
        </Text>
      )}
      <Link href={`/settings/wallets/${selectedWalletId}/name`} asChild>
        <Pressable>
          <Card className="w-full">
            <CardHeader>
              <CardTitle>Wallet Name</CardTitle>
              <CardDescription>
                {wallets[selectedWalletId].name || DEFAULT_WALLET_NAME}
              </CardDescription>
            </CardHeader>
          </Card>
        </Pressable>
      </Link>
      <Link href="/settings/wallet-connection" asChild>
        <Pressable>
          <Card className="w-full">
            <CardHeader>
              <CardTitle>Wallet Connection</CardTitle>
              <CardDescription>
                Configure your wallet connection
              </CardDescription>
            </CardHeader>
          </Card>
        </Pressable>
      </Link>
      <Link href="/settings/lightning-address" asChild>
        <Pressable>
          <Card className="w-full">
            <CardHeader className="w-full">
              <CardTitle className="flex flex-col">Lightning Address</CardTitle>
              <CardDescription>
                Update your Lightning Address to easily receive payments
              </CardDescription>
            </CardHeader>
          </Card>
        </Pressable>
      </Link>
    </View>
  );
}
