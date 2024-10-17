import { Link, router } from "expo-router";
import { Alert, Pressable, View } from "react-native";
import Toast from "react-native-toast-message";

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Text } from "~/components/ui/text";
import { DEFAULT_WALLET_NAME } from "~/lib/constants";
import { useAppStore } from "~/lib/state/appStore";
import * as Clipboard from "expo-clipboard";
import Screen from "~/components/Screen";
import { TriangleAlert } from "~/components/Icons";
import { Nip47Capability } from "@getalby/sdk/dist/NWCClient";

export function EditWallet() {
  const selectedWalletId = useAppStore((store) => store.selectedWalletId);
  const wallets = useAppStore((store) => store.wallets);
  return (
    <View className="flex-1 flex flex-col p-3 gap-3">
      <Screen
        title="Edit Wallet"
      />
      {(["notifications", "list_transactions"] as Nip47Capability[]).map(capability => 
        (wallets[selectedWalletId].nwcCapabilities || []).indexOf(capability) < 0 && (
          <Card key={capability}>
            <CardHeader>
              <CardTitle className="flex flex-row gap-3 items-center">
                <TriangleAlert size={16} className="text-foreground" />
                <Text>Your wallet does not support {capability}</Text>
              </CardTitle>
            </CardHeader>
          </Card>
        )
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
      <Link
        href={`/settings/wallets/${selectedWalletId}/lightning-address`}
        asChild
      >
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
      <Pressable
        onPress={() => {
          Alert.alert(
            "Export Wallet",
            "Your Wallet Connection Secret will be copied to the clipboard which you can add to another app. For per-app permission management, try out Alby Hub or add your Wallet Connection Secret to an Alby Account.",
            [
              {
                text: "Cancel",
                style: "cancel",
              },
              {
                text: "Confirm",
                onPress: () => {
                  const nwcUrl =
                    useAppStore.getState().wallets[
                      useAppStore.getState().selectedWalletId
                    ].nostrWalletConnectUrl;
                  if (!nwcUrl) {
                    return;
                  }
                  Clipboard.setStringAsync(nwcUrl);
                  Toast.show({
                    type: "success",
                    text1: "Connection Secret copied to clipboard",
                  });
                },
              },
            ],
          );
        }}
      >
        <Card className="w-full">
          <CardHeader className="w-full">
            <CardTitle className="flex flex-col">Export Wallet</CardTitle>
            <CardDescription>
              Copy your wallet's Connection Secret which can be imported into
              another app
            </CardDescription>
          </CardHeader>
        </Card>
      </Pressable>
      <Pressable
        onPress={() => {
          Alert.alert(
            "Delete Wallet",
            "Are you sure you want to delete your wallet? This cannot be undone.",
            [
              {
                text: "Cancel",
                style: "cancel",
              },
              {
                text: "Confirm",
                onPress: () => {
                  useAppStore.getState().removeCurrentWallet();
                  if (wallets.length != 1) {
                    router.back();
                  }
                },
              },
            ],
          );
        }}
      >
        <Card className="w-full">
          <CardHeader className="w-full">
            <CardTitle className="flex flex-col">Delete Wallet</CardTitle>
            <CardDescription>
              Remove this wallet from your list of wallets
            </CardDescription>
          </CardHeader>
        </Card>
      </Pressable>
    </View>
  );
}
