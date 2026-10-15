import * as LocalAuthentication from "expo-local-authentication";
import { Link, router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Platform,
  Alert as RNAlert,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import Alert from "~/components/Alert";
import ConnectionInfoModal from "~/components/ConnectionInfoModal";
import {
  AddressIcon,
  ChevronRightIcon,
  EditIcon,
  HelpCircleIcon,
  ShareIcon,
  TrashIcon,
  TriangleAlertIcon,
} from "~/components/Icons";
import Loading from "~/components/Loading";
import Screen from "~/components/Screen";
import { Text } from "~/components/ui/text";
import { IS_EXPO_GO, REQUIRED_CAPABILITIES } from "~/lib/constants";
import { errorToast } from "~/lib/errorToast";
import { deregisterWalletNotifications } from "~/lib/notifications";
import { useAppStore } from "~/lib/state/appStore";
import { cn, copyToClipboard } from "~/lib/utils";

export function EditWallet() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams() as { id: string };
  const wallets = useAppStore((store) => store.wallets);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConnectionInfo, setShowConnectionInfo] = React.useState(false);

  let walletId = parseInt(id);

  const onDeleteWallet = async () => {
    setIsDeleting(true);
    if (!IS_EXPO_GO) {
      const wallet = wallets[walletId];
      try {
        await deregisterWalletNotifications(wallet, walletId);
      } catch (error) {
        errorToast(error, t("settings.notifications.deregisterFailed"));
        setIsDeleting(false);
        return;
      }
    }
    useAppStore.getState().removeWallet(walletId);
    setIsDeleting(false);
    if (wallets.length !== 1) {
      router.back();
    }
  };

  const onExportWallet = () => {
    RNAlert.alert(
      t("wallets.edit.exportWallet"),
      t("wallets.edit.exportMessage"),
      [
        {
          text: t("common.cancel"),
          style: "cancel",
        },
        {
          text: t("common.confirm"),
          onPress: async () => {
            const wallet = useAppStore.getState().wallets[walletId];
            if (!wallet) {
              errorToast(new Error(t("wallets.common.walletNotFound")));
              return;
            }

            const isSuperuser =
              wallet.nwcCapabilities?.includes("create_connection");

            if (isSuperuser) {
              Toast.show({
                type: "error",
                text1: t("wallets.edit.cannotExportTitle"),
                text2: t("wallets.edit.cannotExportMessage"),
              });
              return;
            }

            try {
              if (useAppStore.getState().isSecurityEnabled) {
                const biometricAuth =
                  await LocalAuthentication.authenticateAsync({
                    promptMessage: t("wallets.edit.authenticateToExport"),
                  });
                if (!biometricAuth.success) {
                  throw new Error(t("wallets.edit.authenticateFailed"));
                }
              }
            } catch (e) {
              errorToast(e);
              return;
            }

            const nwcUrl = wallet.nostrWalletConnectUrl;
            if (!nwcUrl) {
              return;
            }
            await copyToClipboard(nwcUrl, t("wallets.edit.secretCopied"));
          },
        },
      ],
    );
  };

  return (
    <View className="flex-1">
      <Screen title={t("wallets.edit.title")} />
      {isDeleting ? (
        <View className="flex-1 justify-center items-center">
          <Loading />
          <Text className="ios:text-lg android:text-base font-medium2 text-secondary-foreground mt-4">
            {t("wallets.edit.deleting")}
          </Text>
        </View>
      ) : (
        <View className="flex-1 flex flex-col mt-4">
          {!REQUIRED_CAPABILITIES.every((capability) =>
            (wallets[walletId]?.nwcCapabilities || []).includes(capability),
          ) && (
            <Alert
              type="warn"
              title={t("wallets.edit.mightNotWorkTitle")}
              description={t("wallets.common.missingCapabilities", {
                capabilities: REQUIRED_CAPABILITIES.filter(
                  (capability) =>
                    !(wallets[walletId]?.nwcCapabilities || []).includes(
                      capability,
                    ),
                ).join(", "),
              })}
              icon={TriangleAlertIcon}
              className="mx-6"
            />
          )}
          <Link href={`/settings/wallets/${walletId}/name`} asChild>
            <TouchableOpacity className="flex flex-row items-center gap-4 px-6 py-4">
              <EditIcon
                className="text-muted-foreground"
                width={24}
                height={24}
              />
              <Text
                className={cn(
                  Platform.select({
                    ios: "ios:text-lg ios:sm:text-xl",
                    android: "android:text-lg",
                  }),
                  "font-medium2",
                )}
              >
                {t("wallets.rename.title")}
              </Text>
              <ChevronRightIcon
                className="ml-auto text-muted-foreground "
                width={16}
                height={16}
              />
            </TouchableOpacity>
          </Link>
          <Link
            href={`/settings/wallets/${walletId}/lightning-address`}
            asChild
          >
            <TouchableOpacity className="flex flex-row items-center gap-4 px-6 py-4">
              <AddressIcon
                className="text-muted-foreground"
                width={24}
                height={24}
              />
              <Text
                className={cn(
                  Platform.select({
                    ios: "ios:text-lg ios:sm:text-xl",
                    android: "android:text-lg",
                  }),
                  "font-medium2",
                )}
              >
                {t("wallets.lightningAddress.title")}
              </Text>
              <ChevronRightIcon
                className="ml-auto text-muted-foreground"
                width={16}
                height={16}
              />
            </TouchableOpacity>
          </Link>
          <ConnectionInfoModal
            visible={showConnectionInfo}
            onClose={() => setShowConnectionInfo(false)}
            nostrWalletConnectUrl={wallets[walletId]?.nostrWalletConnectUrl}
            capabilities={wallets[walletId]?.nwcCapabilities}
          />
          <TouchableOpacity
            className="flex flex-row items-center gap-4 px-6 py-4"
            onPress={() => setShowConnectionInfo(true)}
          >
            <HelpCircleIcon
              className="text-muted-foreground"
              width={24}
              height={24}
            />
            <Text
              className={cn(
                Platform.select({
                  ios: "ios:text-lg ios:sm:text-xl",
                  android: "android:text-lg",
                }),
                "font-medium2",
              )}
            >
              {t("wallets.connectionInfo.title")}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="flex flex-row items-center gap-4 px-6 py-4"
            onPress={onExportWallet}
          >
            <ShareIcon
              className="text-muted-foreground"
              width={24}
              height={24}
            />
            <Text
              className={cn(
                Platform.select({
                  ios: "ios:text-lg ios:sm:text-xl",
                  android: "android:text-lg",
                }),
                "font-medium2",
              )}
            >
              {t("wallets.edit.exportWallet")}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="flex flex-row items-center gap-4 px-6 py-4"
            onPress={() => {
              RNAlert.alert(
                t("wallets.edit.removeTitle"),
                t("wallets.edit.removeMessage"),
                [
                  {
                    text: t("common.cancel"),
                    style: "cancel",
                  },
                  {
                    text: t("common.confirm"),
                    onPress: onDeleteWallet,
                  },
                ],
              );
            }}
          >
            <TrashIcon
              className="text-muted-foreground"
              width={24}
              height={24}
            />
            <Text
              className={cn(
                Platform.select({
                  ios: "ios:text-lg ios:sm:text-xl",
                  android: "android:text-lg",
                }),
                "font-medium2",
              )}
            >
              {t("wallets.edit.deleteWallet")}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
