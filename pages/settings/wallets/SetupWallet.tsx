import { NWCClient, type Nip47Capability } from "@getalby/sdk/nwc";
import * as Clipboard from "expo-clipboard";
import { router, useLocalSearchParams } from "expo-router";
import { useAppStore } from "lib/state/appStore";
import React from "react";
import { Modal, TouchableOpacity, View } from "react-native";
import { Toast } from "toastify-react-native";
import Alert from "~/components/Alert";
import DismissableKeyboardView from "~/components/DismissableKeyboardView";
import {
  HelpCircleIcon,
  PasteIcon,
  TriangleAlertIcon,
  XIcon,
} from "~/components/Icons";
import Loading from "~/components/Loading";
import QRCodeScanner from "~/components/QRCodeScanner";
import Screen from "~/components/Screen";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Text } from "~/components/ui/text";
import { IS_EXPO_GO, REQUIRED_CAPABILITIES } from "~/lib/constants";
import { errorToast } from "~/lib/errorToast";
import { registerWalletNotifications } from "~/lib/notifications";

export function SetupWallet() {
  const { nwcUrl: nwcUrlFromSchemeLink } = useLocalSearchParams<{
    nwcUrl: string;
  }>();
  const wallets = useAppStore((store) => store.wallets);
  const walletIdWithConnection = wallets.findIndex(
    (wallet) => wallet.nostrWalletConnectUrl,
  );

  const [isConnecting, setConnecting] = React.useState(false);
  const [nostrWalletConnectUrl, setNostrWalletConnectUrl] =
    React.useState<string>();
  const [capabilities, setCapabilities] = React.useState<Nip47Capability[]>();
  const [name, setName] = React.useState("");
  const [startScanning, setStartScanning] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [showHelp, setShowHelp] = React.useState(false);

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

  const connect = React.useCallback(
    async (nostrWalletConnectUrl: string): Promise<boolean> => {
      try {
        setConnecting(true);
        // make sure connection is valid
        const nwcClient = new NWCClient({
          nostrWalletConnectUrl,
        });
        const info = await nwcClient.getInfo();
        const capabilities = [...info.methods] as Nip47Capability[];
        if (info.notifications?.length) {
          capabilities.push("notifications");
        }

        console.info("NWC connected", info);

        setNostrWalletConnectUrl(nostrWalletConnectUrl);
        setCapabilities(capabilities);
        setName(nwcClient.lud16 || "");

        Toast.show({
          type: "success",
          text1: "Connection successful",
          text2: "Please set your wallet name to finish",
          position: "top",
        });
        setConnecting(false);
        return true;
      } catch (error) {
        console.error(error);
        errorToast(error);
      }
      setConnecting(false);
      return false;
    },
    [],
  );

  const addWallet = async () => {
    if (isLoading || !nostrWalletConnectUrl) {
      return;
    }
    setIsLoading(true);

    const nwcClient = new NWCClient({ nostrWalletConnectUrl });

    const wallet = {
      nostrWalletConnectUrl,
      nwcCapabilities: capabilities,
      name: name,
      lightningAddress: nwcClient.lud16 || "",
    };
    useAppStore.getState().addWallet(wallet);

    if (!IS_EXPO_GO) {
      const isNotificationsEnabled =
        useAppStore.getState().isNotificationsEnabled;
      if (isNotificationsEnabled) {
        await registerWalletNotifications(wallet, wallets.length);
      }
    }

    useAppStore.getState().setNWCClient(nwcClient);

    Toast.show({
      type: "success",
      text1: "Wallet Connected",
      text2: "Your lightning wallet is ready to use",
      position: "top",
    });

    if (router.canDismiss()) {
      router.dismissAll();
    }
    router.replace("/");
    setIsLoading(false);
  };

  React.useEffect(() => {
    if (nwcUrlFromSchemeLink) {
      (async () => {
        const result = await connect(nwcUrlFromSchemeLink);
        // Delay the camera to show the error message
        if (!result) {
          setTimeout(() => {
            setStartScanning(true);
          }, 2000);
        }
      })();
    } else {
      setStartScanning(true);
    }
  }, [connect, nwcUrlFromSchemeLink]);

  return (
    <>
      <Screen
        title="Setup Wallet Connection"
        right={() =>
          walletIdWithConnection !== -1 ? (
            <TouchableOpacity
              onPressIn={() => {
                useAppStore
                  .getState()
                  .setSelectedWalletId(walletIdWithConnection);
                if (router.canDismiss()) {
                  router.dismissAll();
                }
                router.replace("/");
              }}
              className="-mr-4 px-6"
            >
              <XIcon className="text-muted-foreground" width={24} height={24} />
            </TouchableOpacity>
          ) : (
            <>
              <TouchableOpacity
                onPressIn={() => setShowHelp(true)}
                className="-mr-4 px-6"
              >
                <HelpCircleIcon
                  className="text-muted-foreground"
                  width={24}
                  height={24}
                />
              </TouchableOpacity>
              <HelpModal
                visible={showHelp}
                onClose={() => setShowHelp(false)}
              />
            </>
          )
        }
      />
      {isConnecting ? (
        <View className="flex-1 justify-center items-center">
          <Loading />
          <Text className="mt-4">Connecting to your Wallet</Text>
        </View>
      ) : !nostrWalletConnectUrl ? (
        <>
          <View className="p-4">
            <Text className="text-lg text-center font-medium2 text-secondary-foreground">
              Scan a NWC connection secret to add a wallet
            </Text>
          </View>
          <QRCodeScanner
            onScanned={handleScanned}
            startScanning={startScanning}
          />
          <View className="flex flex-row items-stretch justify-center gap-4 p-6">
            <Button
              onPress={paste}
              variant="secondary"
              className="flex-1 flex flex-col gap-2"
            >
              <PasteIcon className="text-muted-foreground" />
              <Text>Paste</Text>
            </Button>
          </View>
        </>
      ) : (
        <DismissableKeyboardView>
          <View className="flex-1 p-6">
            <View className="flex-1 flex flex-col gap-3 items-center justify-center">
              <Label
                nativeID="name"
                className="text-muted-foreground text-center"
              >
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
            {capabilities &&
              !REQUIRED_CAPABILITIES.every((capability) =>
                capabilities.includes(capability),
              ) && (
                <Alert
                  type="warn"
                  title="Alby Go might not work as expected"
                  description={`Missing capabilities: ${REQUIRED_CAPABILITIES.filter(
                    (capability) => !capabilities.includes(capability),
                  ).join(", ")}`}
                  icon={TriangleAlertIcon}
                />
              )}
            <Button
              size="lg"
              className="flex flex-row gap-2"
              onPress={addWallet}
              disabled={!name || isLoading}
            >
              {isLoading && <Loading className="text-primary-foreground" />}
              <Text>Finish</Text>
            </Button>
          </View>
        </DismissableKeyboardView>
      )}
    </>
  );
}

function HelpModal({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-center items-center bg-black/80">
        <TouchableOpacity
          activeOpacity={1}
          onPress={onClose}
          className="absolute inset-0"
        />
        <View className="w-4/5 max-w-[425px] bg-background border border-border rounded-2xl z-10">
          <View className="flex-row items-center justify-center relative p-6">
            <Text className="text-xl font-bold2 text-foreground">
              Connect Your Wallet
            </Text>
            <TouchableOpacity
              onPress={onClose}
              className="absolute right-0 p-4"
            >
              <XIcon className="text-muted-foreground" width={24} height={24} />
            </TouchableOpacity>
          </View>
          <View className="p-6 pt-0 flex flex-col">
            <View className="flex flex-col mb-4">
              <Text className="text-muted-foreground">
                Follow these steps to connect Alby Go to your Hub:
              </Text>
              <Text className="text-muted-foreground">
                1. Open your Alby Hub
              </Text>
              <Text className="text-muted-foreground">
                2. Go to App Store &raquo; Alby Go
              </Text>
              <Text className="text-muted-foreground">
                3. Scan the QR code with this app
              </Text>
            </View>
            <Button onPress={onClose}>
              <Text className="font-bold2">OK</Text>
            </Button>
          </View>
        </View>
      </View>
    </Modal>
  );
}
