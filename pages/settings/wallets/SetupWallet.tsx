import { Pressable, TouchableOpacity, View } from "react-native";
import React from "react";
import * as Clipboard from "expo-clipboard";
import { nwc } from "@getalby/sdk";
import { ClipboardPaste, HelpCircle, X } from "~/components/Icons";
import { useAppStore } from "lib/state/appStore";
import { router } from "expo-router";
import { Button } from "~/components/ui/button";
import Toast from "react-native-toast-message";
import { errorToast } from "~/lib/errorToast";
import { Nip47Capability } from "@getalby/sdk/dist/NWCClient";
import Loading from "~/components/Loading";
import QRCodeScanner from "~/components/QRCodeScanner";
import Screen from "~/components/Screen";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import DismissableKeyboardView from "~/components/DismissableKeyboardView";
import { Text } from "~/components/ui/text";
import { REQUIRED_CAPABILITIES } from "~/lib/constants";

export function SetupWallet() {
  const wallets = useAppStore((store) => store.wallets);
  const walletIdWithConnection = wallets.findIndex((wallet) => wallet.nostrWalletConnectUrl);

  const [isConnecting, setConnecting] = React.useState(false);
  const [nostrWalletConnectUrl, setNostrWalletConnectUrl] = React.useState<string>();
  const [capabilities, setCapabilities] = React.useState<nwc.Nip47Capability[]>();
  const [name, setName] = React.useState("");

  const handleScanned = (data: string) => {
    return connect(data);
  };

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
      if (!REQUIRED_CAPABILITIES.every(capability => capabilities.includes(capability))) {
        const missing = REQUIRED_CAPABILITIES.filter(capability => !capabilities.includes(capability));
        throw new Error(`Missing required capabilities: ${missing.join(", ")}`)
      }

      console.log("NWC connected", info);

      setNostrWalletConnectUrl(nostrWalletConnectUrl);
      setCapabilities(capabilities);
      setName(nwcClient.lud16 || "");

      Toast.show({
        type: "success",
        text1: "Connection successful",
        text2: "Please set your wallet name to finish",
        position: "top",
      });
    } catch (error) {
      console.error(error);
      errorToast(error);
    }
    setConnecting(false);
  }

  const addWallet = () => {
    if (!nostrWalletConnectUrl) return;

    const nwcClient = new nwc.NWCClient({ nostrWalletConnectUrl });
    useAppStore.getState().addWallet({
      nostrWalletConnectUrl,
      nwcCapabilities: capabilities,
      name: name,
      lightningAddress: nwcClient.lud16 || "",
    });
    useAppStore.getState().setNWCClient(nwcClient);

    Toast.show({
      type: "success",
      text1: "Wallet Connected",
      text2: "Your lightning wallet is ready to use",
      position: "top",
    });

    router.replace("/");
  };

  return (
    <>
      <Screen
        title="Setup Wallet Connection"
        right={() =>
          walletIdWithConnection !== -1 ? (
            <Pressable
              onPress={() => {
                useAppStore.getState().setSelectedWalletId(walletIdWithConnection);
                router.replace("/");
              }}
            >
              <X className="text-foreground" />
            </Pressable>
          ) :
            <Dialog>
              <DialogTrigger asChild>
                <TouchableOpacity>
                  <HelpCircle className="text-foreground" />
                </TouchableOpacity>
              </DialogTrigger>
              <DialogContent className='sm:max-w-[425px]'>
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
                    <Button>
                      <Text>OK</Text>
                    </Button>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>
        }
      />
      {isConnecting ? (
        <View className="flex-1 justify-center items-center">
          <Loading />
          <Text className="mt-4">Connecting to your Wallet</Text>
        </View>
      ) : !nostrWalletConnectUrl ? (
        <>
          <QRCodeScanner onScanned={handleScanned} startScanning />
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
      ) : (
        <DismissableKeyboardView>
          <View className="flex-1 p-6">
            <View className="flex-1 flex flex-col gap-3 items-center justify-center">
              <Label nativeID="name" className="text-muted-foreground text-center">
                Wallet name
              </Label>
              <Input
                autoFocus
                className="w-full border-transparent bg-transparent native:text-2xl text-center"
                value={name}
                onChangeText={setName}
                aria-labelledbyledBy="name"
                placeholder="Enter a name for your wallet"
                returnKeyType="done"
              />
            </View>
            <Button size="lg" onPress={addWallet} disabled={!name}>
              <Text>Finish</Text>
            </Button>
          </View>
        </DismissableKeyboardView>
      )}
    </>
  );
}
