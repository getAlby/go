import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";
import { Platform, View } from "react-native";
import Toast from "react-native-toast-message";
import DismissableKeyboardView from "~/components/DismissableKeyboardView";
import Screen from "~/components/Screen";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Text } from "~/components/ui/text";
import { IS_EXPO_GO } from "~/lib/constants";
import { storeWalletInfo } from "~/lib/notificationsNativeStorage";
import { useAppStore } from "~/lib/state/appStore";
import { cn, getPubkeyFromNWCUrl } from "~/lib/utils";

export function RenameWallet() {
  const { t } = useTranslation();
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
      text1: t("wallets.rename.updated"),
    });
    router.back();
  };

  return (
    <>
      <Screen title={t("wallets.rename.title")} />
      <DismissableKeyboardView>
        <View className="flex-1 p-6">
          <View className="flex-1 flex flex-col items-center justify-center">
            <Text className="text-muted-foreground text-center">
              {t("wallets.rename.title")}
            </Text>
            <Input
              className={cn(
                Platform.select({
                  ios: "ios:text-xl ios:sm:text-2xl",
                  android: "android:text-xl",
                }),
                "w-full text-center border-transparent bg-transparent font-semibold2",
              )}
              placeholder={t("wallets.common.defaultName")}
              value={walletName}
              onChangeText={setWalletName}
              returnKeyType="done"
              autoFocus
            />
          </View>
          <Button size="lg" onPress={onRenameWallet} disabled={!walletName}>
            <Text className="ios:text-2xl android:text-xl">
              {t("common.save")}
            </Text>
          </Button>
        </View>
      </DismissableKeyboardView>
    </>
  );
}
