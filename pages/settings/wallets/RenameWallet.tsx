import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import { View } from "react-native";
import Toast from "react-native-toast-message";
import DismissableKeyboardView from "~/components/DismissableKeyboardView";
import Screen from "~/components/Screen";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Text } from "~/components/ui/text";
import { DEFAULT_WALLET_NAME } from "~/lib/constants";
import { useAppStore } from "~/lib/state/appStore";
import { storeWalletInfo } from "~/lib/walletInfo";

export function RenameWallet() {
  const { id } = useLocalSearchParams() as { id: string };
  const walletId = parseInt(id);
  const wallets = useAppStore((store) => store.wallets);
  const isNotificationsEnabled = useAppStore(
    (store) => store.isNotificationsEnabled,
  );

  const [walletName, setWalletName] = React.useState(
    wallets[walletId].name || "",
  );

  const onRenameWallet = async () => {
    useAppStore.getState().updateWallet(
      {
        name: walletName,
      },
      walletId,
    );
    if (isNotificationsEnabled) {
      const nwcClient = useAppStore.getState().getNWCClient(walletId);
      if (nwcClient) {
        await storeWalletInfo(nwcClient?.publicKey ?? "", {
          name: walletName,
        });
      }
    }
    Toast.show({
      type: "success",
      text1: "Wallet name updated",
    });
    router.back();
  };

  return (
    <DismissableKeyboardView>
      <View className="flex-1 flex flex-col p-6 gap-3">
        <Screen title="Wallet Name" />
        <View className="flex-1 flex flex-col items-center justify-center">
          <Text className="text-muted-foreground text-center">Wallet Name</Text>
          <Input
            autoFocus
            className="w-full text-center border-transparent bg-transparent native:text-2xl font-semibold2"
            placeholder={DEFAULT_WALLET_NAME}
            value={walletName}
            onChangeText={setWalletName}
            returnKeyType="done"
            // aria-errormessage="inputError"
          />
        </View>
        <Button size="lg" onPress={onRenameWallet}>
          <Text>Save</Text>
        </Button>
      </View>
    </DismissableKeyboardView>
  );
}
