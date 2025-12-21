import { router } from "expo-router";
import React from "react";
import { View } from "react-native";
import { QRIcon } from "~/components/Icons";
import Screen from "~/components/Screen";
import { Button } from "~/components/ui/button";
import { Text } from "~/components/ui/text";
import { useAppStore } from "~/lib/state/appStore";

export function LightningAddress() {
  const walletId = useAppStore((store) => store.selectedWalletId);

  return (
    <View className="flex-1 flex flex-col p-6 gap-3">
      <Screen title="Lightning Address" />
      <View className="flex-1 flex items-center justify-center gap-4">
        <QRIcon className="mb-6 text-muted-foreground" width={96} height={96} />
        <Text className="font-light2 ios:text-3xl android:text-2xl text-center text-muted-foreground">
          satoshi
          <Text className="font-bold2 ios:text-3xl android:text-2xl">
            @getalby.com
          </Text>
        </Text>
        <Text className="font-medium2 ios:text-xl android:text-lg text-muted-foreground text-center">
          Attach your lightning address to this wallet to display it as QR code
          for fast face-to-face transactions
        </Text>
      </View>
      <Button
        size="lg"
        onPress={() => router.navigate("/receive/alby-account")}
      >
        <Text>Get New Address</Text>
      </Button>
      <Button
        variant="secondary"
        size="lg"
        onPress={() =>
          router.replace(`/settings/wallets/${walletId}/lightning-address`)
        }
      >
        <Text>Add Existing</Text>
      </Button>
    </View>
  );
}
