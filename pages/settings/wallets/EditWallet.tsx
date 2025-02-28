import * as Clipboard from "expo-clipboard";
import { Link, router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import { Pressable, Alert as RNAlert, View } from "react-native";
import Toast from "react-native-toast-message";
import Alert from "~/components/Alert";
import {
  AddressIcon,
  ExportIcon,
  TrashIcon,
  TriangleAlertIcon,
  WalletIcon,
} from "~/components/Icons";
import Loading from "~/components/Loading";
import Screen from "~/components/Screen";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "~/components/ui/card";
import { Text } from "~/components/ui/text";
import {
  DEFAULT_WALLET_NAME,
  IS_EXPO_GO,
  REQUIRED_CAPABILITIES,
} from "~/lib/constants";
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
    <View className="flex-1 flex flex-col p-4 gap-4">
      <Screen title="Edit Wallet" />
      {isDeleting ? (
        <View className="flex-1 justify-center items-center">
          <Loading />
          <Text className="text-xl mt-4">Deleting wallet</Text>
        </View>
      ) : (
        <>
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
            <Pressable>
              <Card className="w-full">
                <CardContent className="flex flex-row items-center gap-4">
                  <WalletIcon className="text-muted-foreground" />
                  <View className="flex flex-1 flex-col">
                    <CardTitle>Wallet Name</CardTitle>
                    <CardDescription>
                      {wallets[walletId]?.name || DEFAULT_WALLET_NAME}
                    </CardDescription>
                  </View>
                </CardContent>
              </Card>
            </Pressable>
          </Link>
          <Link
            href={`/settings/wallets/${walletId}/lightning-address`}
            asChild
          >
            <Pressable>
              <Card className="w-full">
                <CardContent className="flex flex-row items-center gap-4">
                  <AddressIcon className="text-muted-foreground" />
                  <View className="flex flex-1 flex-col">
                    <CardTitle>Lightning Address</CardTitle>
                    <CardDescription>
                      Update your Lightning Address to easily receive payments
                    </CardDescription>
                  </View>
                </CardContent>
              </Card>
            </Pressable>
          </Link>
          <Pressable
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
            <Card className="w-full">
              <CardContent className="flex flex-row items-center gap-4">
                <ExportIcon className="text-muted-foreground" />
                <View className="flex flex-1 flex-col">
                  <CardTitle>Export Wallet</CardTitle>
                  <CardDescription>
                    Copy your wallet's Connection Secret which can be imported
                    into another app
                  </CardDescription>
                </View>
              </CardContent>
            </Card>
          </Pressable>
          <Pressable
            onPress={() => {
              RNAlert.alert(
                "Delete Wallet",
                "Are you sure you want to delete your wallet? This cannot be undone.",
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
            <Card className="w-full">
              <CardContent className="flex flex-row items-center gap-4">
                <TrashIcon className="text-muted-foreground" />
                <View className="flex flex-1 flex-col">
                  <CardTitle>Delete Wallet</CardTitle>
                  <CardDescription>
                    Remove this wallet from your list of wallets
                  </CardDescription>
                </View>
              </CardContent>
            </Card>
          </Pressable>
        </>
      )}
    </View>
  );
}
