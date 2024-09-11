import { Pressable, Text, View } from "react-native";
import React, { useEffect } from "react";
import * as Clipboard from "expo-clipboard";
import { nwc } from "@getalby/sdk";
import { ClipboardPaste, X } from "~/components/Icons";
import { useAppStore } from "lib/state/appStore";
import { router } from "expo-router";
import { Button } from "~/components/ui/button";
import { useInfo } from "~/hooks/useInfo";
import { useBalance } from "~/hooks/useBalance";
import Toast from "react-native-toast-message";
import { errorToast } from "~/lib/errorToast";
import { Nip47Capability } from "@getalby/sdk/dist/NWCClient";
import Loading from "~/components/Loading";
import QRCodeScanner from "~/components/QRCodeScanner";
import Screen from "~/components/Screen";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "~/components/ui/dialog";

export function WalletConnection() {
  const hasConnection = useAppStore((store) => !!store.nwcClient);
  const walletIdWithConnection = useAppStore((store) =>
    store.wallets.findIndex((wallet) => wallet.nostrWalletConnectUrl),
  );
  const isFirstConnection = useAppStore((store) => !store.wallets.length)
  const { data: walletInfo } = useInfo();
  const { data: balance } = useBalance();
  const [isScanning, setScanning] = React.useState(false);
  const [isConnecting, setConnecting] = React.useState(false);
  const [dialogOpen, setDialogOpen] = React.useState(isFirstConnection);

  const handleScanned = (data: string) => {
    return connect(data);
  };

  useEffect(() => {
    setScanning(!dialogOpen);
  }, [dialogOpen]);

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
      setConnecting(true);
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
    setConnecting(false);
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
          ) : null
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
              setScanning(true);
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

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogContent className="sm:max-w-[425px] ">
              <DialogHeader>
                <DialogTitle>Connect Your Wallet</DialogTitle>
                <View className="flex flex-col gap-2">
                  <Text className="text-muted-foreground">Follow these steps to connect Alby Go to your Hub:</Text>
                  <Text className="text-muted-foreground">1. Open your Alby Hub</Text>
                  <Text className="text-muted-foreground">2. Go to App Store &raquo; Alby Go</Text>
                  <Text className="text-muted-foreground">3. Scan the QR code with this app</Text>
                </View>
              </DialogHeader>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="secondary">
                    <Text>OK</Text>
                  </Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {!isConnecting && (
            <>
              <QRCodeScanner onScanned={handleScanned} scanning={isScanning} />
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
