import * as Clipboard from "expo-clipboard";
import { Link, router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import { Alert as RNAlert, TouchableOpacity, View } from "react-native";
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

export function EditWallet() {
  const { id } = useLocalSearchParams() as { id: string };
  const wallets = useAppStore((store) => store.wallets);
  const [isDeleting, setIsDeleting] = useState(false);
  const isNotificationsEnabled = useAppStore(
    (store) => store.isNotificationsEnabled,
  );
  const [showConnectionInfo, setShowConnectionInfo] = React.useState(false);

  let walletId = parseInt(id);

  const onDeleteWallet = async () => {
    setIsDeleting(true);
    try {
      if (!IS_EXPO_GO && isNotificationsEnabled) {
        const wallet = wallets[walletId];
        await deregisterWalletNotifications(wallet, walletId);
      }
      useAppStore.getState().removeWallet(walletId);
    } catch (error) {
      errorToast(error);
    } finally {
      setIsDeleting(false);
    }
    if (wallets.length !== 1) {
      router.back();
    }
  };

  return (
    <View className="flex-1 bg-background">
      <Screen title="Edit Wallet" />
      {isDeleting ? (
        <View className="flex-1 justify-center items-center">
          <Loading />
          <Text className="text-lg font-medium2 text-secondary-foreground mt-4">
            Deleting wallet
          </Text>
        </View>
      ) : (
        <View className="flex-1 flex flex-col mt-4">
          {!REQUIRED_CAPABILITIES.every((capability) =>
            (wallets[walletId]?.nwcCapabilities || []).includes(capability),
          ) && (
            <Alert
              type="warn"
              title="This wallet might not work as expected"
              description={`Missing capabilities: ${REQUIRED_CAPABILITIES.filter(
                (capability) =>
                  !(wallets[walletId]?.nwcCapabilities || []).includes(
                    capability,
                  ),
              ).join(", ")}`}
              icon={TriangleAlertIcon}
              className="mb-0"
            />
          )}
          <Link href={`/settings/wallets/${walletId}/name`} asChild>
            <TouchableOpacity className="flex flex-row items-center gap-4 px-6 py-3 sm:py-4">
              <EditIcon
                className="text-muted-foreground"
                width={24}
                height={24}
              />
              <Text className="font-medium2 text-lg sm:text-xl text-foreground">
                Wallet Name
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
            <TouchableOpacity className="flex flex-row items-center gap-4 px-6 py-3 sm:py-4">
              <AddressIcon
                className="text-muted-foreground"
                width={24}
                height={24}
              />
              <Text className="font-medium2 text-lg sm:text-xl text-foreground">
                Lightning Address
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
          />
          <TouchableOpacity
            className="flex flex-row items-center gap-4 px-6 py-3 sm:py-4"
            onPress={() => setShowConnectionInfo(true)}
          >
            <HelpCircleIcon
              className="text-muted-foreground"
              width={24}
              height={24}
            />
            <Text className="font-medium2 text-lg sm:text-xl text-foreground">
              Connection Info
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="flex flex-row items-center gap-4 px-6 py-3 sm:py-4"
            onPress={() => {
              RNAlert.alert(
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
                      const isSuperuser = useAppStore
                        .getState()
                        .wallets[
                          walletId
                        ].nwcCapabilities?.includes("create_connection");

                      if (isSuperuser) {
                        Toast.show({
                          type: "error",
                          text1:
                            "Connection Secret with One Tap Connections cannot be exported",
                          text2:
                            "Please create a new connection from Alby Hub instead",
                        });
                        return;
                      }

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
            <ShareIcon
              className="text-muted-foreground"
              width={24}
              height={24}
            />
            <Text className="font-medium2 text-lg sm:text-xl text-foreground">
              Export Wallet
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="flex flex-row items-center gap-4 px-6 py-3 sm:py-4"
            onPress={() => {
              RNAlert.alert(
                "Remove Wallet Connection",
                "Are you sure you want to remove this wallet connection? This cannot be undone.",
                [
                  {
                    text: "Cancel",
                    style: "cancel",
                  },
                  {
                    text: "Confirm",
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
            <Text className="font-medium2 text-lg sm:text-xl text-foreground">
              Delete Wallet
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
