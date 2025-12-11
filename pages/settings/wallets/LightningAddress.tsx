import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import { View } from "react-native";
import Toast from "react-native-toast-message";
import Alert from "~/components/Alert";
import DismissableKeyboardView from "~/components/DismissableKeyboardView";
import { AlertCircleIcon } from "~/components/Icons";
import Loading from "~/components/Loading";
import Screen from "~/components/Screen";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Text } from "~/components/ui/text";
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
    useAppStore.getState().updateWallet({ lightningAddress }, walletId);
    Toast.show({
      type: "success",
      text1: "Lightning address updated",
    });
    router.back();
    setLoading(false);
  };

  return (
    <>
      <Screen title="Lightning Address" />
      <DismissableKeyboardView>
        <View className="flex-1 p-6 bg-background">
          <Alert
            type="warn"
            title="Only add lightning address you own"
            description="This feature does not create a new lightning address for you. It adds an existing address to your Receive page."
            icon={AlertCircleIcon}
            className="mb-0"
          />
          <View className="flex-1 flex flex-col items-center justify-center">
            <Text className="text-muted-foreground text-center">
              Lightning Address
            </Text>
            <Input
              className="w-full text-center border-transparent bg-transparent native:text-2xl font-semibold2"
              value={lightningAddress}
              onChangeText={setLightningAddress}
              placeholder="hello@getalby.com"
              returnKeyType="done"
              autoComplete="email"
              inputMode="email"
              autoFocus
            />
          </View>
          <Button
            size="lg"
            className="flex flex-row gap-2"
            disabled={isLoading}
            onPress={updateLightningAddress}
          >
            {isLoading && <Loading className="text-primary-foreground" />}
            <Text>Save</Text>
          </Button>
        </View>
      </DismissableKeyboardView>
    </>
  );
}
