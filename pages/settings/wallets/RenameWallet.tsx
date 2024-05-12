import { Stack, router } from "expo-router";
import React from "react";
import { Keyboard, TouchableWithoutFeedback, View } from "react-native";
import Toast from "react-native-toast-message";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Text } from "~/components/ui/text";
import { DEFAULT_WALLET_NAME } from "~/lib/constants";
import { useAppStore } from "~/lib/state/appStore";

export function RenameWallet() {
  const selectedWalletId = useAppStore((store) => store.selectedWalletId);
  const wallets = useAppStore((store) => store.wallets);
  const [walletName, setWalletName] = React.useState(
    wallets[selectedWalletId].name || ""
  );
  return (
    <TouchableWithoutFeedback
      onPress={() => {
        Keyboard.dismiss();
      }}
    >
      <View className="flex-1 flex flex-col p-3 gap-3">
        <Stack.Screen
          options={{
            title: "Wallet Name",
          }}
        />
        <Input
          autoFocus
          className="w-full text-center mt-6"
          placeholder={DEFAULT_WALLET_NAME}
          value={walletName}
          onChangeText={setWalletName}
          // aria-errormessage="inputError"
        />
        <Button
          onPress={() => {
            useAppStore.getState().updateCurrentWallet({
              name: walletName,
            });
            Toast.show({
              type: "success",
              text1: "Wallet name updated",
              text2: walletName || DEFAULT_WALLET_NAME,
            });
            router.back();
          }}
        >
          <Text>Update Wallet Name</Text>
        </Button>
      </View>
    </TouchableWithoutFeedback>
  );
}
