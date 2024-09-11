import { Camera } from "expo-camera/legacy"; // TODO: check if Android camera detach bug is fixed and update camera
import * as Clipboard from "expo-clipboard";
import { router } from "expo-router";
import { useAppStore } from "lib/state/appStore";
import React from "react";
import { Pressable, Text, View } from "react-native";
import Toast from "react-native-toast-message";
import { CircleHelp, ClipboardPaste, X } from "~/components/Icons";
import Loading from "~/components/Loading";
import QRCodeScanner from "~/components/QRCodeScanner";
import Screen from "~/components/Screen";
import { Button } from "~/components/ui/button";
import { useBalance } from "~/hooks/useBalance";
import { useInfo } from "~/hooks/useInfo";
import { errorToast } from "~/lib/errorToast";

import { nwc } from "@getalby/sdk";
import { Nip47Capability } from "@getalby/sdk/dist/NWCClient";

export function WalletConnection() {
  const hasConnection = useAppStore((store) => !!store.nwcClient);
  const walletIdWithConnection = useAppStore((store) =>
    store.wallets.findIndex((wallet) => wallet.nostrWalletConnectUrl),
  );
  const [isScanning, setIsScanning] = React.useState(false);
  const [isConnecting, setIsConnecting] = React.useState(false);
  const { data: walletInfo } = useInfo();
  const { data: balance } = useBalance();

  async function scan() {
    const { status } = await Camera.requestCameraPermissionsAsync();
    setIsScanning(status === "granted");
  }

  const handleScanned = (data: string) => {
    return connect(data);
  };

  React.useEffect(() => {
    scan();
  }, []);

  async function paste() {
    let nostrWalletConnectUrl;
    try {
      nostrWalletConnectUrl = await Clipboard.getStringAsync();
    } catch (error) {
      console.error("Failed to read clipboard", error);
      errorToast(error);
      return;
    }
    connect(nostrWalletConnectUrl);
  }

  async function connect(nostrWalletConnectUrl: string) {
    try {
      setIsConnecting(true);
      // make sure connection is valid
      const nwcClient = new nwc.NWCClient({
        nostrWalletConnectUrl,
      });
      const info = await nwcClient.getInfo();
      const capabilities = [...info.methods] as Nip47Capability[];
      if (info.notifications?.length) {
        capabilities.push("notifications");
      }
      console.log("NWC connected", info);
      useAppStore.getState().setNostrWalletConnectUrl(nostrWalletConnectUrl);
      useAppStore.getState().updateCurrentWallet({
        nwcCapabilities: capabilities,
        ...(nwcClient.lud16 ? { lightningAddress: nwcClient.lud16 } : {}),
      });
      useAppStore.getState().setNWCClient(nwcClient);
      if (router.canDismiss()) {
        router.dismissAll();
      }
      router.replace("/");
      Toast.show({
        type: "success",
        text1: "Wallet Connected",
        text2: "Your lightning wallet is ready to use",
      });
    } catch (error) {
      console.error(error);
      errorToast(error);
    }
    setIsConnecting(false);
  }

  return (
    <>
      <Screen
        title="Setup Wallet Connection"
        right={() =>
          walletIdWithConnection !== -1 ? (
            <Pressable
              onPress={() => {
                useAppStore
                  .getState()
                  .setSelectedWalletId(walletIdWithConnection);
                router.replace("/");
              }}
            >
              <X className="text-foreground" />
            </Pressable>
          ) : (
            <Pressable
              onPress={() => {
                Toast.show({
                  type: "info",
                  visibilityTime: 8000,
                  text1: "Connect a Wallet",
                  text2:
                    "Go to your 'Alby Hub' -> 'Connections' -> 'Add Connection' -> Scan QR Code",
                });
              }}
            >
              <CircleHelp className="text-foreground" />
            </Pressable>
          )
        }
      />
      {hasConnection && (
        <View className="flex-1 p-3">
          <View className="flex-1 h-full flex flex-col items-center justify-center gap-5">
            {walletInfo && <Text>Wallet Connected!</Text>}
            {!walletInfo && <Text>Loading wallet...</Text>}
            {walletInfo ? (
              <Text className="self-start justify-self-start">
                {JSON.stringify(walletInfo, null, 2)}
              </Text>
            ) : (
              <Loading />
            )}
            {balance && (
              <Text className="self-start justify-self-start">
                {JSON.stringify(balance, null, 2)}
              </Text>
            )}
          </View>
          <Button
            variant="destructive"
            onPress={() => {
              useAppStore.getState().removeNostrWalletConnectUrl();
              scan();
            }}
          >
            <Text>Disconnect Wallet</Text>
          </Button>
        </View>
      )}
      {!hasConnection && (
        <>
          {isConnecting && (
            <>
              <View className="flex-1 justify-center items-center">
                <Loading />
                <Text className="mt-4">Connecting to your Wallet</Text>
              </View>
            </>
          )}
          {!isConnecting && (
            <>
              <QRCodeScanner onScanned={handleScanned} />
              <View className="flex flex-row items-stretch justify-center gap-4 p-6">
                <Button
                  onPress={paste}
                  variant="secondary"
                  className="flex-1 flex flex-col gap-2"
                >
                  <ClipboardPaste className="text-secondary-foreground" />
                  <Text className="text-secondary-foreground">Paste</Text>
                </Button>
              </View>
            </>
          )}
        </>
      )}
    </>
  );
}
