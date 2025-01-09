import { LightningAddress } from "@getalby/lightning-tools";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import { View } from "react-native";
import Toast from "react-native-toast-message";
import DismissableKeyboardView from "~/components/DismissableKeyboardView";
import Loading from "~/components/Loading";
import Screen from "~/components/Screen";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Text } from "~/components/ui/text";
import { errorToast } from "~/lib/errorToast";
import { useAppStore } from "~/lib/state/appStore";

export function SetLightningAddress() {
  const { id } = useLocalSearchParams() as { id: string };
  const walletId = parseInt(id);
  const wallets = useAppStore((store) => store.wallets);
  const [lightningAddress, setLightningAddress] = React.useState("");
  React.useEffect(() => {
    setLightningAddress(wallets[walletId].lightningAddress || "");
  }, [wallets, walletId]);
  const [isLoading, setLoading] = React.useState(false);

  const updateLightningAddress = async () => {
    setLoading(true);
    try {
      if (lightningAddress) {
        const nwcClient = useAppStore.getState().getNWCClient(walletId);
        if (!nwcClient) {
          throw new Error("NWC client not connected");
        }

        // by generating an invoice from the lightning address and checking
        // we own it via lookup_invoice, we can prove we own the lightning address
        const _lightningAddress = new LightningAddress(lightningAddress);
        await _lightningAddress.fetch();
        const invoiceFromLightningAddress =
          await _lightningAddress.requestInvoice({ satoshi: 1 });
        let found = false;
        try {
          const transaction = await nwcClient.lookupInvoice({
            payment_hash: invoiceFromLightningAddress.paymentHash,
          });
          found =
            transaction?.invoice === invoiceFromLightningAddress.paymentRequest;
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (_ /* transaction is not found */) {}

        if (!found) {
          throw new Error(
            "Could not verify you are the owner of this lightning address.",
          );
        }
      }

      useAppStore.getState().updateWallet({ lightningAddress }, walletId);
      Toast.show({
        type: "success",
        text1: "Lightning address updated",
      });
      router.back();
    } catch (error) {
      errorToast(error);
    }
    setLoading(false);
  };

  return (
    <DismissableKeyboardView>
      <View className="flex-1 flex flex-col">
        <View className="flex-1 flex flex-col p-3 gap-3">
          <Screen title="Lightning Address" />
          <View className="flex-1 flex flex-col items-center justify-center">
            <Text className="text-muted-foreground text-center">
              Lightning Address
            </Text>
            <Input
              autoComplete="email"
              inputMode="email"
              autoFocus
              className="w-full text-center border-transparent bg-transparent native:text-2xl font-semibold2"
              placeholder="hello@getalby.com"
              value={lightningAddress}
              onChangeText={setLightningAddress}
              returnKeyType="done"
              // aria-errormessage="inputError"
            />
          </View>
        </View>
        <View className="p-6">
          <Button
            size="lg"
            className="flex flex-row gap-2"
            onPress={updateLightningAddress}
          >
            {isLoading && <Loading className="text-primary-foreground" />}
            <Text>Save</Text>
          </Button>
        </View>
      </View>
    </DismissableKeyboardView>
  );
}
