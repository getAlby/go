import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import { View } from "react-native";
import Toast from "react-native-toast-message";
import DismissableKeyboardView from "~/components/DismissableKeyboardView";
import Screen from "~/components/Screen";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Text } from "~/components/ui/text";
import { DEFAULT_WALLET_NAME, IS_EXPO_GO } from "~/lib/constants";
import { storeWalletInfo } from "~/lib/notificationsNativeStorage";
import { useAppStore } from "~/lib/state/appStore";
import { getPubkeyFromNWCUrl } from "~/lib/utils";

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

    if (!IS_EXPO_GO && isNotificationsEnabled && wallets[walletId].pushId) {
      const pubkey = getPubkeyFromNWCUrl(
        wallets[walletId].nostrWalletConnectUrl ?? "",
      );
      if (pubkey) {
        await storeWalletInfo(pubkey, {
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
    <>
      <Screen title="Wallet Name" />
      <DismissableKeyboardView>
        <View className="flex-1 p-6">
          <View className="flex-1 flex flex-col items-center justify-center">
            <Text className="text-muted-foreground text-center">
              Wallet name
            </Text>
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
          <Button size="lg" onPress={onRenameWallet} disabled={!walletName}>
            <Text>Save</Text>
          </Button>
        </View>
      </DismissableKeyboardView>
    </>
  );
}
