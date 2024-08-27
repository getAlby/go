import { Link, router, Stack } from "expo-router";
import { Alert, Pressable, View } from "react-native";
import { Bitcoin, Power, Wallet2 } from "~/components/Icons";

import { DEFAULT_WALLET_NAME } from "~/lib/constants";
import { useAppStore } from "~/lib/state/appStore";
import { Text } from "~/components/ui/text";

export function Settings() {
  const wallet = useAppStore((store) => store.wallets[store.selectedWalletId]);

  return (
    <View className="flex-1 flex flex-col p-6 gap-6">
      <Stack.Screen
        options={{
          title: "Settings",
        }}
      />
      <Link href="/settings/wallets" asChild>
        <Pressable className="flex flex-row items-center gap-4">
          <Wallet2 className="text-foreground" />
          <Text className="font-medium2 text-xl text-foreground">Wallets</Text>
          <Text className="text-muted-foreground text-xl">
            ({wallet.name || DEFAULT_WALLET_NAME})
          </Text>
        </Pressable>
      </Link>

      <Link href="/settings/fiat-currency" asChild>
        <Pressable className="flex flex-row gap-4">
          <Bitcoin className="text-foreground" />
          <Text className="text-foreground font-medium2 text-xl">
            Units & Currency
          </Text>
        </Pressable>
      </Link>

      <Pressable
        className="flex flex-row gap-4"
        onPress={() => {
          Alert.alert(
            "Reset",
            "Are you sure you want to reset? you will be signed out of all your wallets. Your connection secrets and address book will be lost",
            [
              {
                text: "Cancel",
                style: "cancel",
              },
              {
                text: "Confirm",
                onPress: () => {
                  router.dismissAll();
                  useAppStore.getState().reset();
                },
              },
            ],
          );
        }}
      >
        <Power className="text-destructive" />
        <Text className="text-destructive font-medium2 text-xl">
          Reset Wallet
        </Text>
      </Pressable>
    </View>
  );
}
