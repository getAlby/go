import { NWCClient, type Nip47Capability } from "@getalby/sdk/nwc";
import * as Clipboard from "expo-clipboard";
import { router, useLocalSearchParams } from "expo-router";
import { useAppStore } from "lib/state/appStore";
import React from "react";
import { TouchableOpacity, View } from "react-native";
import Toast from "react-native-toast-message";
import Alert from "~/components/Alert";
import DismissableKeyboardView from "~/components/DismissableKeyboardView";
import HelpModal from "~/components/HelpModal";
import {
  HelpCircleLineIcon,
  PasteIcon,
  TriangleAlertIcon,
  XIcon,
} from "~/components/Icons";
import Loading from "~/components/Loading";
import QRCodeScanner from "~/components/QRCodeScanner";
import Screen from "~/components/Screen";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
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
      errorToast(error, "Failed to read clipboard");
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
        errorToast(error, "Failed to connect to wallet");
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
        title="Connect Wallet"
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
                <HelpCircleLineIcon
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
        <View className="flex-1">
          <View className="p-4">
            <Text className="text-center text-secondary-foreground font-medium2">
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
        </View>
      ) : (
        <DismissableKeyboardView>
          <View className="flex-1 p-6">
            <View className="flex-1 flex flex-col items-center justify-center">
              <Text className="text-muted-foreground text-center">
                Wallet name
              </Text>
              <Input
                className="w-full text-center border-transparent bg-transparent text-2xl font-semibold2"
                value={name}
                onChangeText={setName}
                placeholder="Enter a name for your wallet"
                returnKeyType="done"
                autoFocus
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
