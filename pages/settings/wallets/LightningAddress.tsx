import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";
import { Platform, View } from "react-native";
import Toast from "react-native-toast-message";
import Alert from "~/components/Alert";
import DismissableKeyboardView from "~/components/DismissableKeyboardView";
import { AlertCircleIcon } from "~/components/Icons";
import Loading from "~/components/Loading";
import Screen from "~/components/Screen";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Text } from "~/components/ui/text";
import { errorToast } from "~/lib/errorToast";
import { useAppStore } from "~/lib/state/appStore";
import { cn } from "~/lib/utils";

export function SetLightningAddress() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams() as { id: string };
  const walletId = parseInt(id);
  const wallets = useAppStore((store) => store.wallets);
  const [lightningAddress, setLightningAddress] = React.useState("");
  const [loadedWalletId, setLoadedWalletId] = React.useState<number | null>(
    null,
  );
  if (walletId !== loadedWalletId) {
    setLoadedWalletId(walletId);
    setLightningAddress(wallets[walletId]?.lightningAddress || "");
  }
  const [isLoading, setLoading] = React.useState(false);

  const updateLightningAddress = async () => {
    if (!wallets[walletId]) {
      errorToast(new Error(t("wallets.common.walletNotFound")));
      return;
    }
    setLoading(true);
    useAppStore.getState().updateWallet({ lightningAddress }, walletId);
    Toast.show({
      type: "success",
      text1: t("wallets.lightningAddress.updated"),
    });
    router.back();
    setLoading(false);
  };

  return (
    <>
      <Screen title={t("wallets.lightningAddress.title")} />
      <DismissableKeyboardView>
        <View className="flex-1 p-6">
          <Alert
            type="warn"
            title={t("wallets.lightningAddress.onlyOwnTitle")}
            description={t("wallets.lightningAddress.onlyOwnDescription")}
            icon={AlertCircleIcon}
            className="mb-0"
          />
          <View className="flex-1 flex flex-col items-center justify-center">
            <Text className="text-muted-foreground text-center">
              {t("wallets.lightningAddress.title")}
            </Text>
            <Input
              className={cn(
                Platform.select({
                  ios: "ios:text-xl ios:sm:text-2xl",
                  android: "android:text-xl",
                }),
                "w-full text-center border-transparent bg-transparent font-semibold2",
              )}
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
            <Text>{t("common.save")}</Text>
          </Button>
        </View>
      </DismissableKeyboardView>
    </>
  );
}
